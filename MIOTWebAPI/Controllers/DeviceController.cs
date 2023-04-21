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
using Azure.Messaging.EventHubs.Consumer;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        public static ServiceClient serviceClient;
        public static RegistryManager registryManager;
        public static EventHubConsumerClient eventHubConsumerClient = null;
        public string connectionString { get; set; }
        public string sqlconnectionString { get; set; }

        public DeviceController(IConfiguration _configuration)
        {
            connectionString = _configuration.GetConnectionString("IoTHubConnection");
            sqlconnectionString = _configuration.GetConnectionString("SQLConnection");
        }


        [HttpGet("GetDeviceEventMessageAsync")]
        //GET: /api/Device/GetDeviceConnectionStateAsync
        public async Task GetDeviceEventMessageAsync()
        {
            string ConsumerGroup = "$Default";
            string consumerGroup = EventHubConsumerClient.DefaultConsumerGroupName;

            string eventHubConnectionString = $"Endpoint=sb://ihsuprodamres082dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=Bj6J9hRQODXMZrMFAygpaGUBqRtttOb4JspTHzNDTDc=;EntityPath=iothub-ehub-myiot-pap-24899739-4cd7aaee27";
            eventHubConsumerClient = new EventHubConsumerClient(consumerGroup, eventHubConnectionString);

            // var tasks = new List<Task>();
            // var partitions = await eventHubConsumerClient.GetPartitionIdsAsync();
            // foreach (string partition in partitions)
            // {
            //     tasks.Add(ReceiveMessagesFromDeviceAsync(partition));
            // }


            await using (var consumerClient = eventHubConsumerClient)
            {
                DateTimeOffset timesamp = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(10)); // In your case this line would be DateTimeOffset timesamp = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromHours(1));
                EventPosition timestamp = EventPosition.FromEnqueuedTime(timesamp);
                using CancellationTokenSource cancellationSource = new CancellationTokenSource();
                string partitionId = (await consumerClient.GetPartitionIdsAsync(cancellationSource.Token)).First();

                await foreach (PartitionEvent partitionEvent in consumerClient.ReadEventsFromPartitionAsync(
                   partitionId,
                    timestamp))
                {
                    string deviceId = partitionEvent.Data.SystemProperties["iothub-connection-device-id"].ToString();
                    string json = Encoding.UTF8.GetString(partitionEvent.Data.Body.ToArray());
                    Console.WriteLine(json);
                }
            }
        }

        static async Task ReceiveMessagesFromDeviceAsync(string partitionId)
        {
            Console.WriteLine($"Starting listener thread for partition: {partitionId}");
            while (true)
            {
                await foreach (PartitionEvent receivedEvent in eventHubConsumerClient.ReadEventsFromPartitionAsync(partitionId, EventPosition.Latest))
                {
                    string msgSource;
                    string body = Encoding.UTF8.GetString(receivedEvent.Data.Body.ToArray());
                    if (receivedEvent.Data.SystemProperties.ContainsKey("iothub-message-source"))
                    {
                        msgSource = receivedEvent.Data.SystemProperties["iothub-message-source"].ToString();
                        Console.WriteLine($"{partitionId} {msgSource} {body}");
                    }
                }
            }
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
        //GET: /api/Device/GetDeviceConnectionStateAsync
        public async Task<IActionResult> GetDeviceConnectionStateAsync(string deviceId)
        {
            var registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            var device = await registryManager.GetDeviceAsync(deviceId);

            if (device == null)
                return NotFound();

            return Ok(device.ConnectionState.ToString());
        }

        [HttpGet("GetDeviceConnectionStringAsync")]
        //GET: /api/Device/GetDeviceConnectionStringAsync
        public async Task<IActionResult> GetDeviceConnectionStringAsync(string deviceId)
        {
            var registryManager = RegistryManager.CreateFromConnectionString(connectionString);
            var device = await registryManager.GetDeviceAsync(deviceId);

            if (device == null)
                return NotFound();

            string deviceConString = "HostName=MyIOT-PAP.azure-devices.net;DeviceId=" + deviceId + ";SharedAccessKey=" + device.Authentication.SymmetricKey.PrimaryKey;

            return Ok(deviceConString);
        }

        [HttpGet("GetDeviceUser")]
        //GET: /api/Device/GetDeviceConnectionStringAsync
        public async Task<IActionResult> GetDeviceUser(string deviceId)
        {
            try
            {

                string UserId = "";
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT deviceUserId FROM Devices where deviceId = " + deviceId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    var devices = new List<DeviceModel>();
                    while (reader.Read())
                    {
                        UserId = reader.GetInt32(0).ToString();
                    }
                }

                return Ok(UserId);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetDevices")]
        //GET: /api/Device/GetDevices
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
    }
}