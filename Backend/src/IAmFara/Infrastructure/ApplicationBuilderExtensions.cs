using Infrastructure;
using Infrastructure.Authentication;
using Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.AspNetCore.Builder
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseApplicationMidllewares(this IApplicationBuilder builder)
        {
            // Migrate database
            using (var services = builder.ApplicationServices.CreateScope())
            {
                var dbContext = services.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.Migrate();
            }

                return builder
                    .UseExceptionHanling()
                    .UseCoockieAuthentication()
                    .UseCorelationId();
        }
    }
}
