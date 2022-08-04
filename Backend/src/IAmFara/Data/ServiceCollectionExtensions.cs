using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Data;
using Data.Repositories;
using Data.Repositories.InMemory;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDependencies(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("AppDbContext");
            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

            AddRepositories(services);

            return services;
        }

        private static void AddRepositories(IServiceCollection services)
        {
            services.AddScoped<IIntroductionTextRepository, InMemoryIntroTextRepository>();
            services.AddScoped<ISkillsRepository, InMemorySkillsRepository>();
        }
    }
}
