using System;

namespace MIOTWebAPI.Models
{
    public class DeviceWidgetModel
    {
        public int ID { get; set; }
        public int DeviceId { get; set; }
        public bool MessageTable { get; set; }
        public bool SendCommands { get; set; }
        public bool LineChart { get; set; }
    }
}