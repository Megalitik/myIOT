using System;

namespace MIOTWebAPI.Models
{
    public class DeviceModel
    {
        public string DeviceId { get; set; }
        public string DeviceName { get; set; }
        public bool IsConnected { get; set; }
        public DateTime? LastActivityTime { get; set; }
    }
}