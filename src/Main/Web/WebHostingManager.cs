using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace IAmFara.Web
{
    public class WebHostingManager : IHostedService
    {
        private readonly ProgramArguments _args;
        private readonly ILogger<WebHostingManager> _logger;
        private readonly FeaturesWatcher _featuresWatcher;
        private IHost _host;
        private readonly EventWaitHandle _waitHandle = new AutoResetEvent(false);

        public WebHostingManager(ProgramArguments args, ILogger<WebHostingManager> logger, FeaturesWatcher featuresWatcher)
        {
            _args = args;
            _logger = logger;
            _featuresWatcher = featuresWatcher;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _featuresWatcher.Initialize(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Features"));
            _featuresWatcher.FeaturesCountChanged += FeatureWatcher_FeaturesCountChanged;
            _ = StartNewHost();

            return Task.CompletedTask;
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await ShutdownHost();
        }

        private async Task ShutdownHost()
        {
            if (_host != null)
            {
                await _host.StopAsync();
            }
        }

        private async void FeatureWatcher_FeaturesCountChanged(object sender, EventArgs e)
        {
            await ShutdownHost();
            _ = StartNewHost();
        }

        public async Task StartNewHost()
        {
            _host = CreateNewHostBuilder().Build().LogAddinLogs();
            await _host.RunAsync();
        }

        public IHostBuilder CreateNewHostBuilder() =>
            Host.CreateDefaultBuilder(_args.Args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                })
            ;

    }
}
