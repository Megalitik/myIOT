using System;
using MIOTWebAPI.Models;

namespace MIOTWebAPI.UtilityService
{
    public interface IEmailService
    {
        void SendEmail(EmailModel emailModel);
    }
}