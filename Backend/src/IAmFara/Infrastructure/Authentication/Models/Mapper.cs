using Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication.Models
{
    internal static class Mapper
    {
        public static AppUser ToAppUser(SignUpModel model, string hashedPassword)
        {
            return new AppUser
            {
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Password = hashedPassword
            };
        }

        public static SecurityUser ToSecurityUser(AppUser user)
        {
            return new SecurityUser
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserRoles = user.UserRoles?.Select(r=> new UserRole { role = r }).ToArray()
            };
        }
    }
}
