using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure;
using Infrastructure.Authentication;
using Infrastructure.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class AuthenticationServiceCollectionExtensions
    {
        internal static IServiceCollection AddAuthenticationIfrastructure(this IServiceCollection services)
        {
            return services
                .AddScoped<ICurrentUserProvider, CurrentUserProvider>()
                .AddScoped<ICurrentUserAccessor, CurrentUserAccessor>()
                .AddScoped<IPasswordHandler, PasswordHandler>()
                .AddScoped<IAppCoockieHandler, AppCoockieHandler>()
                .AddScoped<IUserManager, UserManager>();
        }        
    }
}
