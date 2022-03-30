using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace MIOTWebAPI.Models
{
    public class AuthenticationContext : IdentityDbContext<AppUser>
    {
        public AuthenticationContext(DbContextOptions opt):base(opt)
        {

        }

        public DbSet<AppUser> AppUsers { get; set; }
    }
}