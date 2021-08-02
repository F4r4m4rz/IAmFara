using System;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AnotherTest
{
    public class MyAddin : IFeatureAddin
    {
        public MyAddin()
        {
        }

        public string Name => "My addin";

        public string Route => "MyAddin";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddRazorPages();
        }
    }
}
