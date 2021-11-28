

using System.ComponentModel.DataAnnotations;

namespace BindingModel
{

    public class LoginBindingModel
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}