using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Devices.Client;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceMessageController : ControllerBase
    {
        private string _iotHubConnectionString = "";
        private DeviceClient _deviceClient;
        IConfiguration _configuration;

        public DeviceMessageController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("GetDeviceMessages")]
        //POST: /api/DeviceMessage/GetDeviceMessages/${deviceId}
        public async Task<ActionResult> GetDeviceMessages(string deviceId)
        {
            try
            {
                _iotHubConnectionString = _configuration.GetConnectionString("IoTHubConnection");
                _deviceClient = DeviceClient.CreateFromConnectionString(_iotHubConnectionString, deviceId);
                var receiveMessage = await _deviceClient.ReceiveAsync();
                if (receiveMessage == null)
                {
                    return Ok();
                }

                var messageString = JsonConvert.SerializeObject(receiveMessage);
                await _deviceClient.CompleteAsync(receiveMessage);

                return Ok(messageString);
            }
            catch (Microsoft.Azure.Devices.Client.Exceptions.DeviceNotFoundException nodevice)
            {
                throw new Exception("O dispositivo não existe: " + nodevice.ToString());
            }
            catch (Microsoft.Azure.Devices.Client.Exceptions.UnauthorizedException error)
            {
                throw new Exception(error.ToString());
            }
            catch (Microsoft.Azure.Devices.Client.Exceptions.IotHubException error)
            {
                throw new Exception(error.ToString());
            }
        }
    }
}
