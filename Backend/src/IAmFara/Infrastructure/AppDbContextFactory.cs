using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
#nullable disable
    public class AppDbContextFactorySettings
    {
        public const string _section = "ConnectionStrings";
        public string AppConnectionString { get; set; }
    }

    internal interface IAppDbContextFactory
    {
        AppDbContext CreateContext();
    }

    internal class AppDbContextFactory : IAppDbContextFactory
    {
        private AppDbContextFactorySettings _config;

        public AppDbContextFactory(IOptionsMonitor<AppDbContextFactorySettings> settings)
        {
            _config = settings.CurrentValue;
            settings.OnChange(newSetting => _config = newSetting);
        }

        public AppDbContext CreateContext()
        {
            return new AppDbContext(_config.AppConnectionString);
        }
    }
}
