using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MIOTWebAPI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Common.Exceptions;
using System.Threading;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.Azure.Devices.Client;
using System.Data;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        static ServiceClient serviceClient;
        static RegistryManager registryManager;
        public string connectionString { get; set; }
        public string sqlconnectionString { get; set; }

        public DeviceController(IConfiguration _configuration)
        {
            connectionString = _configuration.GetConnectionString("IoTHubConnection");
            sqlconnectionString = _configuration.GetConnectionString("SQLConnection");
        }



        [HttpPost("RegisterNewDeviceAsync")]
        //POST: /api/Device/RegisterNewDeviceAsync
        public async Task<IActionResult> RegisterNewDeviceAsync(string deviceName, string userId)
        {
            Device device;

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                if (await registryManager.GetDeviceAsync(deviceName) == null)
                {

                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[Devices] ([deviceName],[deviceUserId]) VALUES (@name, @userId)";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@name", SqlDbType.VarChar, 500).Value = deviceName;
                            cmd.Parameters.Add("@userId", SqlDbType.VarChar, 500).Value = userId;

                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }
                    }

                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        var command = new SqlCommand("SELECT deviceId  FROM Devices where deviceName like '%" + deviceName + "%' AND deviceUserId like '%" + userId + "%';", connection);
                        var reader = await command.ExecuteReaderAsync();

                        while (reader.Read())
                        {
                            device = await registryManager.AddDeviceAsync(new Device(reader.GetInt32(0).ToString()));
                        }
                    }

                    return Ok(new
                    {
                        Message = "O dispositivo foi criado",
                        StatusCode = 200
                    });
                }

                return StatusCode(500, "O dispositivo já existe");

            }
            catch (DeviceAlreadyExistsException)
            {
                device = await registryManager.GetDeviceAsync(deviceName);
                return StatusCode(500, "O dispositivo já existe");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetDeviceConnectionStateAsync")]
        public async Task<IActionResult> GetDeviceConnectionStateAsync(string deviceId)
        {
            var registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            var device = await registryManager.GetDeviceAsync(deviceId);

            if (device == null)
                return NotFound();

            return Ok(device.ConnectionState.ToString());
        }

        [HttpGet("GetDeviceConnectionStringAsync")]
        public async Task<IActionResult> GetDeviceConnectionStringAsync(string deviceId)
        {
            var registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            var device = await registryManager.GetDeviceAsync(deviceId);

            if (device == null)
                return NotFound();

            string deviceConString = "HostName=MyIOT-PAP.azure-devices.net;DeviceId=" + deviceId + ";SharedAccessKey=" + device.Authentication.SymmetricKey.PrimaryKey;

            return Ok(deviceConString);
        }

        [HttpGet("GetDevices")]
        //POST: /api/Device/GetDevices
        public async Task<IActionResult> GetDevices(string userId)
        {
            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT deviceId, deviceName, deviceUserId FROM Devices where deviceUserId = " + userId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    var devices = new List<DeviceModel>();
                    while (reader.Read())
                    {
                        devices.Add(new DeviceModel
                        {
                            DeviceId = reader.GetInt32(0),
                            DeviceName = reader.GetString(1),
                            UserId = reader.GetInt32(2)
                        });
                    }

                    var json = JsonSerializer.Serialize(devices);

                    return Ok(devices);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }



        [HttpPost("DeleteDeviceAsync")]
        //POST: /api/Device/DeleteDeviceAsync
        public async Task<IActionResult> DeleteDeviceAsync(string deviceId, string userId)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "DELETE FROM [dbo].[DeviceCommand] WHERE deviceId=" + deviceId;
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();

                    }
                    await connection.CloseAsync();

                }

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "DELETE FROM [dbo].[Devices] WHERE deviceId=" + deviceId + " AND deviceUserId=" + userId;
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();

                    }
                    await connection.CloseAsync();

                }

                Device deviceToBeDeleted = await registryManager.GetDeviceAsync(deviceId);

                if (deviceToBeDeleted != null)
                    await registryManager.RemoveDeviceAsync(deviceToBeDeleted);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

            return Ok(new
            {
                Message = "Dispositivo foi apagador com sucesso",
                StatusCode = 200
            });
        }


        [HttpPost("SendCloudToDeviceMessageAsync")]
        //POST: /api/Device/SendCloudToDeviceMessageAsync
        public async Task<ActionResult> SendCloudToDeviceMessageAsync(string targetDevice, string message)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            try
            {
                var commandMessage = new Microsoft.Azure.Devices.Message(Encoding.ASCII.GetBytes((message)));
                await serviceClient.SendAsync(targetDevice, commandMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

            return Ok(new
            {
                Message = "Comando foi enviado",
                StatusCode = 200
            });
        }
    }
}