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
        private async Task<string> RegisterNewDeviceAsync(string newDeviceId)
        {
            Device device;

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                device = await registryManager.AddDeviceAsync(new Device(newDeviceId));

                using (var connection = new SqlConnection(sqlconnectionString))
                {
                    await connection.OpenAsync();

                    var command = new SqlCommand("INSERT INTO Devices", connection);
                    var reader = await command.ExecuteReaderAsync();
                }

            }
            catch (DeviceAlreadyExistsException)
            {
                device = await registryManager.GetDeviceAsync(newDeviceId);
            }

            return device.Authentication.SymmetricKey.PrimaryKey;

        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessageAsync(string message, string deviceId)
        {
            var deviceClient = DeviceClient.CreateFromConnectionString(connectionString, deviceId);
            var messageBytes = Encoding.UTF8.GetBytes(message);
            var iotMessage = new Microsoft.Azure.Devices.Client.Message(messageBytes);
            await deviceClient.SendEventAsync(iotMessage);
            return Ok();
        }

        [HttpGet("GetDevices")]
        //POST: /api/Device/GetDevices
        public async Task<ActionResult<IEnumerable<Device>>> GetDevices(string userId)
        {
            using (var connection = new SqlConnection(sqlconnectionString))
            {
                await connection.OpenAsync();

                var command = new SqlCommand("SELECT deviceId, deviceName FROM Devices where deviceUserId like '%" + userId + "%'", connection);
                var reader = await command.ExecuteReaderAsync();

                var devices = new List<DeviceModel>();
                while (reader.Read())
                {
                    devices.Add(new DeviceModel
                    {
                        DeviceId = reader.GetString(0),
                        DeviceName = reader.GetString(1)
                    });
                }

                var json = JsonSerializer.Serialize(devices);

                return Ok(devices);
            }
        }



        [HttpPost("DeleteDeviceAsync")]
        //POST: /api/Device/DeleteDeviceAsync
        private async Task<string> DeleteDeviceAsync(string deviceId)
        {

            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                await registryManager.RemoveDeviceAsync(new Device(deviceId));

            }
            catch (Exception ex)
            {
                return ex.Message;
            }

            return "Dispositivo Apagado: " + deviceId;
        }


        [HttpPost("SendCloudToDeviceMessageAsync")]
        //POST: /api/Device/SendCloudToDeviceMessageAsync
        public async Task SendCloudToDeviceMessageAsync(string targetDevice, string message)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            var commandMessage = new Microsoft.Azure.Devices.Message(Encoding.ASCII.GetBytes((message)));
            await serviceClient.SendAsync(targetDevice, commandMessage);
        }

        [HttpGet("ReceiveFeedbackAsync")]
        //GET: /api/Device/ReceiveFeedbackAsync
        public async void ReceiveFeedbackAsync()
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);
            var feedbackReceiver = serviceClient.GetFeedbackReceiver();

            while (true)
            {
                var feedbackBatch = await feedbackReceiver.ReceiveAsync(CancellationToken.None);

                if (feedbackBatch == null)
                    continue;

                await feedbackReceiver.CompleteAsync(feedbackBatch, CancellationToken.None);
            }
        }


    }
}