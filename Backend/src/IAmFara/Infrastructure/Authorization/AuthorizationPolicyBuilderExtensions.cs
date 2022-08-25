using Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.Extensions.DependencyInjection
{
    internal static class AuthorizationPolicyBuilderExtensions
    {
        public static AuthorizationPolicyBuilder RequireAdminUser(this AuthorizationPolicyBuilder builder)
        {
            builder.Requirements.Add(new AdminRequirment());

            return builder;
        }
    }
}
