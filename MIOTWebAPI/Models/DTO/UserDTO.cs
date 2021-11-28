using System;

namespace DTO
{

    public class UserDTO
    {

        public UserDTO(string fullname, string email, string userName, DateTime dateCreated)
        {
            FullName = fullname;
            Email = email;
            UserName = userName;
            DateCreated = dateCreated;
        }

        public string FullName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public DateTime DateCreated { get; set; }
    }
}