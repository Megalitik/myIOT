using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;


namespace MIOTWebAPI.Models {

    [NotMapped]
    public class AppUser : IdentityUser
    {
        [Column(TypeName="nvarchar(250)")]
        public string FullName { get; set;}
        [Column(TypeName="datetime2(7)")]
        public DateTime DateCreated { get; set;}
        [Column(TypeName="datetime2(7)")]
        public DateTime DateModified { get; set;}
    }
}