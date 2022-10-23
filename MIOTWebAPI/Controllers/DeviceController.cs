using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MIOTWebAPI.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Devices;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DeviceController : ControllerBase
    {
        static ServiceClient serviceClient;
        public string connectionString { get; set; }

        public DeviceController (IConfiguration _configuration)
        {
            connectionString = _configuration.GetConnectionString("IoTHubConnection");
        }



        [HttpPost("SendCloudToDeviceMessageAsync")]
        //POST: /api/Device/SendCloudToDeviceMessageAsync
        private async Task SendCloudToDeviceMessageAsync(string targetDevice)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            var commandMessage = new Message(Encoding.ASCII.GetBytes(("Cloud-to-device" + targetDevice +" message.")));
            await serviceClient.SendAsync(targetDevice, commandMessage);
        }

        [HttpGet("ReceiveFeedbackAsync")]
        //GET: /api/Device/ReceiveFeedbackAsync
        private async void ReceiveFeedbackAsync()
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);
            var feedbackReceiver = serviceClient.GetFeedbackReceiver();

            Console.WriteLine("\nReceiving c2d feedback from service");
            while (true)
            {
                var feedbackBatch = await feedbackReceiver.ReceiveAsync();
                if (feedbackBatch == null) continue;

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("Received feedback: {0}",
                string.Join(", ", feedbackBatch.Records.Select(f => f.StatusCode)));
                Console.ResetColor();

                await feedbackReceiver.CompleteAsync(feedbackBatch);
            }
        }

        
    }
}