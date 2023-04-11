using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using MIOTWebAPI.Models;

namespace MIOTWebAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserProfileController : ControllerBase
    {

        private readonly UserManager<AppUser> _userManager;

        public UserProfileController(UserManager<AppUser> userManager) 
        {
            _userManager = userManager;
        }

        [HttpGet]
        [Authorize]
        //GET: /api/UserProfile
        public async Task<Object> GetUserProfile() {
            string userId = User.Claims.First(c => c.Type == "UserID").Value;
            var user = await _userManager.FindByIdAsync(userId);

            return new
            {
                user.UserName,
                user.FullName,
                user.Email
            };
        }
    }
}
