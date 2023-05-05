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
        //GET: /api/Device/GetDevices
        public async Task<IActionResult> GetDeviceCommands(string deviceId)
        {
            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT [Id], [deviceId], [Name], [Command] FROM [dbo].[DeviceCommand] where deviceId = " + deviceId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    var deviceCommands = new List<DeviceCommandModel>();
                    while (reader.Read())
                    {
                        deviceCommands.Add(new DeviceCommandModel
                        {
                            Id = reader.GetInt32(0),
                            deviceId = reader.GetInt32(1),
                            Name = reader.GetString(2),
                            Command = reader.GetString(3)
                        });
                    }

                    var json = JsonSerializer.Serialize(deviceCommands);

                    return Ok(deviceCommands);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("CallMethodOnDeviceAsync")]
        //POST: /api/Device/CallMethodOnDeviceAsync
        public async Task<ActionResult> CallMethodOnDeviceAsync(string targetDevice, string commandId)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);
            string message = "";
            string payload = "";

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT [Command], [Payload] FROM [dbo].[DeviceCommand] where Id = " + commandId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    while (reader.Read())
                    {

                        message = reader.GetString(0);
                        payload = String.IsNullOrEmpty(reader.GetString(1)) ? reader.GetString(1) : "";
                    }
                }

                var methodInvocation = new CloudToDeviceMethod(message) { ResponseTimeout = TimeSpan.FromSeconds(30) };
                methodInvocation.SetPayloadJson(payload);

                var response = await serviceClient.InvokeDeviceMethodAsync(targetDevice, methodInvocation);

                var commandMessage = new Microsoft.Azure.Devices.Message(Encoding.ASCII.GetBytes((message)));
                await serviceClient.SendAsync(targetDevice, commandMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

            return Ok(new
            {
                Message = "Comando foi enviado"
            });
        }


        [HttpPost("AddDeviceCommandAsync")]
        //POST: /api/Device/AddDeviceCommandAsync
        public async Task<ActionResult> AddDeviceCommandAsync(string deviceId, string commandName, string command, string payload)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                if(String.IsNullOrWhiteSpace(payload) || String.IsNullOrEmpty(payload))
                {
                    payload = null;
                }
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "INSERT INTO [dbo].[DeviceCommand] ([deviceId], [Name], [Command], [Payload]) VALUES (@Id, @Name, @Command, @Payload)";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = deviceId;
                        cmd.Parameters.Add("@Name", SqlDbType.VarChar, 500).Value = commandName;
                        cmd.Parameters.Add("@Command", SqlDbType.VarChar, 500).Value = command;
                        cmd.Parameters.Add("@Payload", SqlDbType.VarChar, int.MaxValue).Value = String.IsNullOrEmpty(payload) ? DBNull.Value : payload;

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }
                }

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

            return Ok(new
            {
                Message = "Comando foi adicionado"
            });
        }

        [HttpPost("DeleteDeviceCommandAsync")]
        //POST: /api/Device/DeleteDeviceCommandAsync
        public async Task<ActionResult> DeleteDeviceCommandAsync(string deviceId, string deviceCommandId)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "DELETE FROM [dbo].[DeviceCommand] WHERE Id = " + deviceCommandId + " AND deviceId = " + deviceId;
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {

                        cmd.CommandType = CommandType.Text;
                        cmd.ExecuteNonQuery();
                    }
                }

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

            return Ok(new
            {
                Message = "Comando foi apagado"
            });
        }
    }
}