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

                    var command = new SqlCommand("SELECT TOP 20 Message, MessageDate FROM DeviceMessages where deviceId = " + deviceId + " ORDER BY MessageDate DESC;", connection);
                    var reader = await command.ExecuteReaderAsync();

                    bool firstMessage = true;
                    string firstJsonMessage = "";
                    while (reader.Read())
                    {
                        if (String.IsNullOrEmpty(firstJsonMessage) && firstMessage == true)
                        {
                            messages.Add(reader.GetString(0).ToString());
                            firstJsonMessage = reader.GetString(0).ToString();
                            firstMessage = false;
                            messageDates.Add(Convert.ToDateTime(reader.GetDateTime(1).ToString()));
                        }
                        else
                        {
                            if (IsSameJsonStructure(reader.GetString(0).ToString(), firstJsonMessage))
                            {
                                messages.Add(reader.GetString(0).ToString());
                                messageDates.Add(Convert.ToDateTime(reader.GetDateTime(1).ToString()));
                            }
                        }
                    }
                }

                Dictionary<string, List<int>> chartData = new Dictionary<string, List<int>>();

                // ver cada mensagem e converter para um objeto JSON
                foreach (string message in messages)
                {
                    JObject json = JObject.Parse(message);

                    // Ver cada JSON key de cada mensagem e adicionar o seu valo ao Dictionary chartData
                    foreach (var pair in json)
                    {
                        double retNum;
                        // Verificar se é um número (integer or float)
                        if (Double.TryParse(Convert.ToString(pair.Value), System.Globalization.NumberStyles.Any, System.Globalization.NumberFormatInfo.InvariantInfo, out retNum))
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

                //Transformar as mensagens no formato para o gráfico de linhas
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


            // Criar uma Lista de Listas com o máximo de 10 mensagens por lista e ordenar
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
                    continue;
                }
            }

            //Caso estiver vazio
            if (currentList.Any())
            {
                paginatedMessages.Add(currentList);
            }


            return Ok(paginatedMessages);
        }

        //Verifica se dois objetos JSON têm as mesmas chaves
        private bool IsSameJsonStructure(string firstMessage, string secondMessage)
        {
            try
            {
                JObject firstObject = JObject.Parse(firstMessage);
                JObject secondObject = JObject.Parse(secondMessage);

                var o1Keys = new JObject(firstObject.Properties().Select(p => new JProperty(p.Name, null)));
                var o2Keys = new JObject(secondObject.Properties().Select(p => new JProperty(p.Name, null)));

                bool areKeysEqual = JToken.DeepEquals(o1Keys, o2Keys);

                return areKeysEqual;
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

                    string sql = "DELETE FROM [dbo].[DeviceWidgets] WHERE deviceId=" + deviceId;
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