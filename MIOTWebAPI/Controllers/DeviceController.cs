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
        public async Task<string> RegisterNewDeviceAsync(string deviceName, string userId)
        {
            Device device;

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                device = await registryManager.AddDeviceAsync(new Device(deviceName));

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "INSERT INTO [dbo].[Devices] ([deviceName],[deviceUserId]) VALUES (@name, @userId)";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@name", SqlDbType.Int).Value = deviceName;
                        cmd.Parameters.Add("@userId", SqlDbType.VarChar, 50).Value = userId;

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }

                    device = await registryManager.AddDeviceAsync(new Device(deviceName));
                }

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT deviceId  FROM Devices where deviceName like '%" + deviceName + "%' AND deviceUserId like '%" + userId + "%');", connection);
                    var reader = await command.ExecuteReaderAsync();

                    while (reader.Read())
                    {
                        device = await registryManager.AddDeviceAsync(new Device(reader.GetString(0)));
                    }
                }

                return device.Authentication.SymmetricKey.PrimaryKey;
            }
            catch (DeviceAlreadyExistsException)
            {
                device = await registryManager.GetDeviceAsync(deviceName);
                return "O dispositivo já existe";
            }
        }

        [HttpGet("GetDeviceConnectionStateAsync")]
        public async Task<string> GetDeviceConnectionStateAsync(string deviceId)
        {
            var registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            var device = await registryManager.GetDeviceAsync(deviceId);

            if (device == null)
                return "Dispositivo não encontrado";

            return device.ConnectionState.ToString();
        }

        [HttpGet("GetDevices")]
        //POST: /api/Device/GetDevices
        public async Task<ActionResult<IEnumerable<DeviceModel>>> GetDevices(string userId)
        {
            using (var connection = new SqlConnection(sqlconnectionString))
            {
                await connection.OpenAsync();

                var command = new SqlCommand("SELECT deviceId, deviceName, deviceUserId FROM Devices where UserId like (SELECT Id FROM users where UserName like '%" + userId + "%');", connection);
                var reader = await command.ExecuteReaderAsync();

                var devices = new List<DeviceModel>();
                while (reader.Read())
                {
                    devices.Add(new DeviceModel
                    {
                        DeviceId = Convert.ToInt32(reader.GetString(0)),
                        DeviceName = reader.GetString(1),
                        UserId = Convert.ToInt32(reader.GetString(2))
                    });
                }

                var json = JsonSerializer.Serialize(devices);

                return Ok(devices);
            }
        }




        [HttpPost("DeleteDeviceAsync")]
        //POST: /api/Device/DeleteDeviceAsync
        private async Task<ActionResult> DeleteDeviceAsync(string deviceId, string userId)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "DELETE FROM [dbo].[Devices] WHERE deviceId=@name, deviceUserId=@userId";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@Id", SqlDbType.VarChar, 200).Value = deviceId;
                        cmd.Parameters.Add("@userId", SqlDbType.VarChar, 50).Value = userId;

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }
                }

                await registryManager.RemoveDeviceAsync(new Device(deviceId));

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok("Comando foi enviado");
        }


        [HttpPost("SendCloudToDeviceMessageAsync")]
        //POST: /api/Device/SendCloudToDeviceMessageAsync
        public async Task<ActionResult> SendCloudToDeviceMessageAsync(string targetDevice, string message)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            var commandMessage = new Microsoft.Azure.Devices.Message(Encoding.ASCII.GetBytes((message)));
            await serviceClient.SendAsync(targetDevice, commandMessage);

            return Ok("Comando foi enviado");
        }
    }
}