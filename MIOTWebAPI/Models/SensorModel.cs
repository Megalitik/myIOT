using System;

namespace MIOTWebAPI.Models
{
    public class SensorModel
    {
        public string DeviceId { get; set; }
        public string Temperature { get; set; }
        public string Humidity { get; set; }
    }
}