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
    public class DeviceCommandController : ControllerBase
    {
        static ServiceClient serviceClient;
        static RegistryManager registryManager;
        public string connectionString { get; set; }
        public string sqlconnectionString { get; set; }

        public DeviceCommandController(IConfiguration _configuration)
        {
            connectionString = _configuration.GetConnectionString("IoTHubConnection");
            sqlconnectionString = _configuration.GetConnectionString("SQLConnection");
        }




        [HttpGet("GetDeviceCommands")]
        //POST: /api/Device/GetDevices
        public async Task<List<DeviceCommandModel>> GetDeviceCommands(string deviceId)
        {
            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT [Id], [deviceId], [Name], [Command] FROM [dbo].[DeviceCommand] where deviceId = " + deviceId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    var devices = new List<DeviceCommandModel>();
                    while (reader.Read())
                    {
                        devices.Add(new DeviceCommandModel
                        {
                            Id = reader.GetInt32(0),
                            deviceId = reader.GetInt32(1),
                            Name = reader.GetString(2),
                            Command = reader.GetString(3)
                        });
                    }

                    var json = JsonSerializer.Serialize(devices);

                    return devices;
                }
            }
            catch (Exception ex)
            {
                return new List<DeviceCommandModel>();
            }
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
                return BadRequest(ex.Message);
            }

            return Ok("Comando foi enviado");
        }



        [HttpPost("AddDeviceCommandAsync")]
        //POST: /api/Device/AddDeviceCommandAsync
        public async Task<ActionResult> AddDeviceCommandAsync(string deviceId, string commandName, string command)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "INSERT INTO [dbo].[DeviceCommand] ([deviceId], [Name], [Command]) VALUES (@Id, @Name, @Command)";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = deviceId;
                        cmd.Parameters.Add("@Name", SqlDbType.VarChar, 500).Value = commandName;
                        cmd.Parameters.Add("@Command", SqlDbType.VarChar, 500).Value = command;

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok("Comando foi apagado");
        }

        [HttpPost("DeleteDeviceCommandAsync")]
        //POST: /api/Device/DeleteDeviceCommandAsync
        public async Task<ActionResult> DeleteDeviceCommandAsync(string deviceCommandId)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "DELETE FROM [dbo].[DeviceCommand] WHERE Id=@Id";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = deviceCommandId;

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok("Comando foi apagado");
        }
    }
}