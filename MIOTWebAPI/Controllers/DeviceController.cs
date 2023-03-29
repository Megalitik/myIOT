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

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DeviceController : ControllerBase
    {
        static ServiceClient serviceClient;
        static RegistryManager registryManager;
        public string connectionString { get; set; }

        public DeviceController (IConfiguration _configuration)
        {
            connectionString = _configuration.GetConnectionString("IoTHubConnection");
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

            }
            catch (DeviceAlreadyExistsException)
            {
                device = await registryManager.GetDeviceAsync(newDeviceId);
            }

            return device.Authentication.SymmetricKey.PrimaryKey;

        }

        [HttpPost("DeleteDeviceAsync")]
        //POST: /api/Device/RegisterNewDeviceAsync
        private async Task<string> DeleteDeviceAsync(string newDeviceId)
        {
            
            registryManager = RegistryManager.CreateFromConnectionString(connectionString);

            try
            {
                await registryManager.RemoveDeviceAsync(new Device(newDeviceId));

            }
            catch (Exception ex)
            {
                return ex.Message;
            }

            return "Device Deleted: " + newDeviceId;
        }


        [HttpPost("SendCloudToDeviceMessageAsync")]
        //POST: /api/Device/SendCloudToDeviceMessageAsync
        private async Task SendCloudToDeviceMessageAsync(string targetDevice, string message)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            var commandMessage = new Message(Encoding.ASCII.GetBytes((message)));
            await serviceClient.SendAsync(targetDevice, commandMessage);
        }

        [HttpGet("ReceiveFeedbackAsync")]
        //GET: /api/Device/ReceiveFeedbackAsync
        private async void ReceiveFeedbackAsync()
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