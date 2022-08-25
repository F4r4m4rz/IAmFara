using Infrastructure.Authentication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authorization
{
    internal static class SecurityUserExtensions
    {
        public static bool HasRole(this SecurityUser user, string role)
        {
            return user.UserRoles.Contains(new UserRole { role = role });
        }

        public static bool IsAdmin(this SecurityUser user)
        {
            return user.HasRole(AuthorizationConstants.AdminRole);
        }
    }
}
