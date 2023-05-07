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
using Microsoft.AspNetCore.Authorization;
using MIOTWebAPI.UtilityService;
using MIOTWebAPI.Models.DTO;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _appContext;
        public IConfiguration Configuration { get; }

        private readonly IEmailService _emailService;

        public UserController(AppDbContext appContext, IConfiguration configuration, IEmailService emailService)
        {
            _appContext = appContext;
            Configuration = configuration;
            _emailService = emailService;
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
                        .FirstOrDefaultAsync(u => u.UserName == userObject.UserName);

                    if (user == null)
                    {
                        return NotFound(new { Message = "Utilizador não foi encontrado" });
                    }

                    if (PasswordHasher.VerifyPassword(userObject.Password, user.Password) == false)
                    {
                        return BadRequest(new { Message = "A Palavra-Passe está incorreta" });
                    }

                    user.Token = CreateJwtToken(user);

                    return Ok(new
                    {
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
        //POST: /api/User/Register
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

        [HttpPost("send-reset-email/{email}")]
        public async Task<ActionResult> SendEmail(string email)
        {
            var user = await _appContext.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
            {
                return NotFound(new
                {
                    Message = "O email introduzido não existe",
                    StatusCode = 404
                });
            }

            string token = Guid.NewGuid().ToString();
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(token);
            var emailToken = Convert.ToBase64String(plainTextBytes);

            user.ResetPasswordToken = emailToken;
            user.ResetPasswordExpirity = DateTime.Now.AddDays(1);

            string from = Configuration["EmailSettings:From"];
            var emailModel = new EmailModel(email, "MyIOT - Repor Password", EmailBody.EmailResetPasswordBodyHtml(email, emailToken));

            _emailService.SendEmail(emailModel);
            _appContext.Entry(user).State = EntityState.Modified;
            await _appContext.SaveChangesAsync();

            return Ok( new {
                StatusCode = 200,
                Message = "Successo ao enviar o email"
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var newToken = resetPasswordDto.EmailToken.Replace(" ", "+");
            var user = await _appContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == resetPasswordDto.Email);

            if (user == null)
            {
                return NotFound(new
                {
                    Message = "O utilizador não existe",
                    StatusCode = 404
                });
            }

            var token = user.ResetPasswordToken;
            DateTime? emailTokenExpirity = user.ResetPasswordExpirity;

            if (token != resetPasswordDto.EmailToken || emailTokenExpirity == null || emailTokenExpirity < DateTime.Now)
            {
                return BadRequest(new
                {
                    Message = "Link de reposição da Palavra-Passe inválido",
                    StatusCode = 400
                });
            }

            user.Password = PasswordHasher.HashPassword(resetPasswordDto.NewPassword);
            _appContext.Entry(user).State = EntityState.Modified;

            await _appContext.SaveChangesAsync();

            return Ok(new
                {
                    Message = "Reposição da Palavra-Passe feita com sucesso",
                    StatusCode = 200
                });
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
                new Claim(ClaimTypes.NameIdentifier, $"{user.Id}"),
                new Claim(ClaimTypes.Email, $"{user.Email}"),
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