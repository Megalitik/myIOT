using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

public class DeviceMessageHub : Hub
{
    public async Task SendDeviceMessage(string message)
    {
        await Clients.All.SendAsync("deviceMessage", message);
    }
}