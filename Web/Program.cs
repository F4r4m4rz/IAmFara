using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IAmFara.Web
{
    public class Program
    {
        private static string _path;
        private static int _featuresCount;
        private static Timer _timer;

        public async static Task Main(string[] args)
        {
            await CreateHostBuilder(args)
                .Build()
                .StartAsync();
        }

        private static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .ConfigureServices((builderContext, services) =>
                {
                    services.AddScoped<ProgramArguments>(programArgs => new ProgramArguments(args));
                    services.AddHostedService<WebHostingManager>();
                });
        }
    }

    public class ProgramArguments
    {
        public ProgramArguments(string[] args)
        {
            Args = args;
        }

        public string[] Args { get; }
    }
}
