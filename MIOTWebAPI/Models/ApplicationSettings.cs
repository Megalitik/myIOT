using System;

namespace MIOTWebAPI.Models
{
    public class ApplicationSettings
    {
        public string Client_URL { get; set; }
        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
    }
}