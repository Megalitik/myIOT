using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;


namespace Claim.Data.Entities {

    public class AppUser:IdentityUser {
        public string FullName { get; set;}
        public DateTime DateCreated { get; set;}
        public DateTime DateModified { get; set;}
    }
}