using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MIOTWebAPI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Common.Exceptions;
using System.Threading;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.Azure.Devices.Client;
using MIOTWebAPI.Context;
using Microsoft.EntityFrameworkCore;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _appContext;

        public UserController(AppDbContext appContext)
        {
            _appContext = appContext;
        }


        [HttpPost("Login")]
        //POST: /api/User/Login
        public async Task<IActionResult> Login([FromBody] User userObject)
        {
            try
            {
                if (userObject == null)
                {
                    return BadRequest();
                }
                else
                {
                    var user = await _appContext.Users
                        .FirstOrDefaultAsync(u => u.UserName == userObject.UserName && u.Password == userObject.Password);

                    if (user == null)
                    {
                        return NotFound(new { Message = "Utilizador não foi encontrado" });
                    }
                }

                return Ok(new { Message = "Acesso Autorizado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("Register")]
        //POST: /api/User/Login
        public async Task<IActionResult> Register([FromBody] User userObject)
        {
            try
            {
                if (userObject == null)
                {
                    return BadRequest();
                }

                await _appContext.Users.AddAsync(userObject);
                await _appContext.SaveChangesAsync();

                return Ok(new { Message = "Novo Utilizador registrado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}