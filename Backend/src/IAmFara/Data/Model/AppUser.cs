using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Model
{
#nullable disable
    public class AppUser
    {
        [Key, EmailAddress]
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string UserRolesString { get; set; }

        [NotMapped]
        public string[] UserRoles
        {
            get { return UserRolesString.Split(';'); }
            set { UserRolesString = string.Join(";", value); }
        }
    }
}
