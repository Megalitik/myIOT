using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MIOTWebAPI.Models;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ValuesController : ControllerBase
    {
        public ValuesController(AuthenticationContext context)
        {
            
        }

        
    }
}