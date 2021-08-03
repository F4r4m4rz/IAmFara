using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
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
        private IHost _host;
        private readonly EventWaitHandle _waitHandle = new AutoResetEvent(false);

        public WebHostingManager(ProgramArguments args)
        {
            _args = args;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            var featureWatcher = new FeaturesWatcher(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Features"));
            featureWatcher.FeaturesCountChanged += FeatureWatcher_FeaturesCountChanged;
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
