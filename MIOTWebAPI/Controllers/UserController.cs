using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

using DTO;
using Claim.BindingModel;
using Claim.Data.Entities;
using BindingModel;

namespace MIOTWebAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {

        private readonly ILogger<UserController> _logger;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public UserController(ILogger<UserController> logger, UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager)
        {
            _logger = logger;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("RegisterUser")]
        public async Task<object> RegisterUser([FromBody] CRUDUserBindingModel model)
        {
            try
            {
                var user = new AppUser()
                {
                    FullName = model.FullName,
                    UserName = model.Email,
                    Email = model.Email,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    return await Task.FromResult("User has been registered");
                }

                return await Task.FromResult(string.Join(", ", result.Errors.Select(x => x.Description).ToArray()));
            }
            catch (Exception ex)
            {
                return await Task.FromResult(ex.Message);
            }
        }

        [HttpPost("Login")]
        public async Task<object> Login([FromBody] LoginBindingModel model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    return await Task.FromResult("Parameters are missing");


                    var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

                    if (result.Succeeded)
                    {
                        return await Task.FromResult("Login Successful");
                    }
                }

                return await Task.FromResult("Login Failed");
            }
            catch (Exception ex)
            {
                return await Task.FromResult(ex.Message);
    }
}

[HttpGet("GetAllUsers")]
public async Task<object> GetAllUsers()
{
    try
    {
        var users = _userManager.Users.Select(x => new UserDTO(x.FullName,
                                                               x.Email,
                                                               x.UserName,
                                                               x.DateCreated));

        return await Task.FromResult(users);
    }
    catch (Exception ex)
    {
        return await Task.FromResult(ex.Message);
    }
}
    }
}
