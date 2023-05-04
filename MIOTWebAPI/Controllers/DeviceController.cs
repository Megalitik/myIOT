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
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;

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

                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[DeviceMessages] ([deviceId],[Message],[MessageDate]) VALUES (@deviceID,@message,@date)";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@deviceID", SqlDbType.Int, int.MaxValue).Value = deviceId;
                            cmd.Parameters.Add("@message", SqlDbType.VarChar, int.MaxValue).Value = json;
                            cmd.Parameters.Add("@date", SqlDbType.DateTime).Value = DateTime.Now;

                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }
        }

        public async Task ReceiveMessagesFromDeviceAsync(string partitionId)
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
                    int deviceId;
                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[Devices] ([deviceName],[deviceUserId]) VALUES (@name, @userId); SELECT SCOPE_IDENTITY()";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@name", SqlDbType.VarChar, 500).Value = deviceName;
                            cmd.Parameters.Add("@userId", SqlDbType.VarChar, 500).Value = userId;

                            cmd.CommandType = CommandType.Text;
                            deviceId = Convert.ToInt32(cmd.ExecuteScalar());
                        }

                        await connection.CloseAsync();
                    }

                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[DeviceWidgets] ([deviceId], [MessageTable], [SendCommands], [LineChart]) VALUES (@Id, 0, 0, 0)";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@Id", SqlDbType.Int).Value = deviceId;

                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }

                        await connection.CloseAsync();
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

                        await connection.CloseAsync();
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

        [HttpGet("GetDeviceLineChartMessages")]
        //GET: /api/Device/GetDeviceConnectionStringAsync
        public async Task<IActionResult> GetDeviceLineChartMessages(string deviceId)
        {
            try
            {
                var messages = new List<string>();
                var messageDates = new List<DateTime>();

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT Message, MessageDate FROM DeviceMessages where deviceId = " + deviceId + " ORDER BY MessageDate DESC;", connection);
                    var reader = await command.ExecuteReaderAsync();

                    bool firstMessage = true;
                    string previousMessage = "";
                    while (reader.Read())
                    {
                        if (String.IsNullOrEmpty(previousMessage) && firstMessage == true)
                        {
                            messages.Add(reader.GetString(0).ToString());
                            previousMessage = reader.GetString(0).ToString();
                            firstMessage = false;
                            messageDates.Add(Convert.ToDateTime(reader.GetDateTime(1).ToString()));
                        }
                        else
                        {
                            if (IsSameJsonStructure(reader.GetString(0).ToString(), previousMessage))
                            {
                                messages.Add(reader.GetString(0).ToString());
                                previousMessage = reader.GetString(0).ToString();
                                messageDates.Add(Convert.ToDateTime(reader.GetDateTime(1).ToString()));
                            }
                        }
                    }
                }

                Dictionary<string, List<int>> chartData = new Dictionary<string, List<int>>();

                // loop through each message and parse the JSON object
                foreach (string message in messages)
                {
                    JObject json = JObject.Parse(message);

                    // loop through each key in the JSON object and add its value to the chartData dictionary
                    foreach (var pair in json)
                    {
                        double retNum;
                        // Check if the value is a number (integer or float)
                        if (pair.Value.Type == JTokenType.Integer || pair.Value.Type == JTokenType.Float || Double.TryParse(Convert.ToString(pair.Value), System.Globalization.NumberStyles.Any, System.Globalization.NumberFormatInfo.InvariantInfo, out retNum))
                        {
                            int numericValue = pair.Value.ToObject<int>();

                            if (chartData.ContainsKey(pair.Key))
                            {
                                chartData[pair.Key].Add(numericValue);
                            }
                            else
                            {
                                chartData.Add(pair.Key, new List<int> { numericValue });
                            }
                        }
                    }
                }

                List<Dictionary<string, object>> result = new List<Dictionary<string, object>>();

                foreach (var kv in chartData)
                {
                    Dictionary<string, object> transformed = new Dictionary<string, object>
                    {
                        { "data", kv.Value },
                        { "label", kv.Key }
                    };
                    result.Add(transformed);
                }

                var returnMessage = new
                {
                    Data = result,
                    MessageDate = messageDates
                };

                return Ok(returnMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

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

                    var json = System.Text.Json.JsonSerializer.Serialize(devices);

                    return Ok(devices);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("GetDeviceWidgets")]
        //GET: /api/Device/GetDevices
        public async Task<IActionResult> GetDeviceWidgets(string deviceId)
        {
            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("SELECT [ID], [deviceId], [MessageTable], [SendCommands], [LineChart] FROM [myIOT].[dbo].[DeviceWidgets] WHERE [deviceId] =" + deviceId + ";", connection);
                    var reader = await command.ExecuteReaderAsync();

                    DeviceWidgetModel widgets = new DeviceWidgetModel();
                    while (reader.Read())
                    {
                        widgets = new DeviceWidgetModel
                        {
                            ID = reader.GetInt32(0),
                            DeviceId = reader.GetInt32(1),
                            MessageTable = reader.GetBoolean(2),
                            SendCommands = reader.GetBoolean(3),
                            LineChart = reader.GetBoolean(4),
                        };
                    }

                    var json = System.Text.Json.JsonSerializer.Serialize(widgets);

                    return Ok(widgets);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("UpdateDeviceWidgetsAsync")]
        //POST: /api/Device/AddDeviceCommandAsync
        public async Task<ActionResult> UpdateDeviceWidgetsAsync(string deviceId, bool sendMethod, bool eventTable, bool lineChart)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    string sql = "UPDATE [dbo].[DeviceWidgets] SET [MessageTable] = @messageTable, [SendCommands] = @sendCommands, [LineChart] = @lineChart WHERE [deviceId] = @Id";
                    using (SqlCommand cmd = new SqlCommand(sql, connection))
                    {
                        cmd.Parameters.Add("@Id", SqlDbType.Int).Value = deviceId;
                        cmd.Parameters.Add("@messageTable", SqlDbType.Bit).Value = eventTable;
                        cmd.Parameters.Add("@sendCommands", SqlDbType.Bit).Value = sendMethod;
                        cmd.Parameters.Add("@lineChart", SqlDbType.Bit).Value = lineChart;

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


        [HttpGet("GetDeviceMessages")]
        public IActionResult GetDeviceMessages(string deviceId)
        {
            List<string> allMessages = new List<string>();

            // Retrieve messages from the database and add them to the allMessages list
            using (SqlConnection connection = new SqlConnection(sqlconnectionString))
            {
                string query = "SELECT [Message] FROM [myIOT].[dbo].[DeviceMessages] WHERE [deviceId] =" + deviceId + " ORDER BY [MessageDate] DESC";

                SqlCommand command = new SqlCommand(query, connection);
                connection.Open();

                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string jsonString = reader.GetString(0);
                        allMessages.Add(jsonString);
                    }
                }
            }


            // Create a list of lists with a maximum of 10 strings per list and sort it from the allMessages listk
            List<List<string>> paginatedMessages = new List<List<string>>();
            List<string> currentList = new List<string>();

            foreach (string message in allMessages)
            {
                try
                {
                    JObject jsonObject = JObject.Parse(message);

                    if (currentList.Count > 0)
                    {
                        if (currentList.Count == 10 || !IsSameJsonStructure(currentList.First(), message))
                        {
                            paginatedMessages.Add(currentList);
                            currentList = new List<string>();
                        }
                    }

                    currentList.Add(message);
                }
                catch (Exception ex)
                {
                    // return StatusCode(500, ex.Message);
                    continue;
                }
            }

            if (currentList.Any())
            {
                paginatedMessages.Add(currentList);
            }

            // Return the list of lists as a JSON array to paginate an HTML table in Angular v14
            return Ok(paginatedMessages);
        }

        private bool IsSameJsonStructure(string firstMessage, string secondMessage)
        {
            try
            {
                JObject firstObject = JObject.Parse(firstMessage);
                JObject secondObject = JObject.Parse(secondMessage);

                return JToken.DeepEquals(firstObject, secondObject);
            }
            catch (Exception ex)
            {
                return false;
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