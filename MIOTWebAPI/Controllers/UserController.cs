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
using MIOTWebAPI.Tools;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _appContext;
        public IConfiguration Configuration { get; }

        public UserController(AppDbContext appContext, IConfiguration configuration)
        {
            _appContext = appContext;
            Configuration = configuration;
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

                    if (PasswordHasher.VerifyPassword(userObject.Password, user.Password))
                    {
                        return BadRequest(new { Message = "A Palavra-Passe está incorreta" });
                    }

                    user.Token = CreateJwtToken(user);

                    return Ok(new {
                    Token = user.Token,
                    Message = "Acesso Autorizado" 
                    });
                }
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

                if (await VerifyUsernameExistsAsync(userObject.UserName))
                {
                    return BadRequest(new { Message = "Já foi criada uma conta com este Nome de Utilizador" });
                }

                if (await VerifyEmailExistsAsync(userObject.Email))
                {
                    return BadRequest(new { Message = "Já foi criada uma conta com este Email" });
                }

                userObject.Password = PasswordHasher.HashPassword(userObject.Password);
                userObject.Role = "User";
                userObject.Token = "";

                await _appContext.Users.AddAsync(userObject);
                await _appContext.SaveChangesAsync();

                return Ok(new { Message = "Novo Utilizador registrado" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _appContext.Users.ToListAsync());
        }

        private async Task<bool> VerifyUsernameExistsAsync(string username)
        {
            return await _appContext.Users.AnyAsync(user => user.UserName == username);
        }

        private async Task<bool> VerifyEmailExistsAsync(string email)
        {
            return await _appContext.Users.AnyAsync(user => user.Email == email);
        }

        private string CreateJwtToken(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = Encoding.ASCII.GetBytes(Configuration["ApplicationSettings:Key"].ToString());

            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name, $"{user.UserName}")
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(jwtKey), SecurityAlgorithms.HmacSha256);

            var tokenDesc = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(3),
                SigningCredentials = credentials
            };

            var token = jwtTokenHandler.CreateToken(tokenDesc);

            return jwtTokenHandler.WriteToken(token);
        }

    }
}