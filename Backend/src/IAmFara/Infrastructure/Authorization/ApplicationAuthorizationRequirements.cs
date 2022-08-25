using Infrastructure.Authentication.Models;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authorization
{
    public interface IApplicationAuthorizationRequirement : IAuthorizationRequirement
    {
        bool Evaluate(SecurityUser user);
    }

    internal class AdminRequirment : IApplicationAuthorizationRequirement
    {
        public bool Evaluate(SecurityUser user)
        {
            return user.IsAdmin();
        }
    }
}
