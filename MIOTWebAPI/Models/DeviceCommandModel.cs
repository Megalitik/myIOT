using System;

namespace MIOTWebAPI.Models
{
    public class DeviceCommandModel
    {
        public int Id { get; set; }
        public int deviceId { get; set; }
        public string Name { get; set; }
        public string Command { get; set; }
    }
}