using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MIOTWebAPI.Models;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    private class DeviceController : ControllerBase
    {
        static ServiceClient serviceClient;
        static string connectionString = "{iot hub connection string}";


        public DeviceController(AuthenticationContext context)
        {
            
        }

        private async static Task SendCloudToDeviceMessageAsync(string targetDevice)
        {
            serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

            var commandMessage = new Message(Encoding.ASCII.GetBytes(("Cloud-to-device" + targetDevice +" message.")));
            await serviceClient.SendAsync(targetDevice, commandMessage);
        }

        private async static void ReceiveFeedbackAsync()
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