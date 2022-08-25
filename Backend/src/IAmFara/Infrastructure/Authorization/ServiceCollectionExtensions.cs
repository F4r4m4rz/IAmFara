using Infrastructure.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class AuthorizationServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationAuthorizationPolicies(this IServiceCollection services)
        {
            services.TryAddEnumerable(ServiceDescriptor.Scoped<IAuthorizationHandler, ApplicationAuthorizationHandler>());

            services.AddAuthorizationCore(options => options.AddPolicy(AuthorizationConstants.AdminPolicyName, builder => builder.RequireAdminUser()));

            return services;
        }
    }
}
