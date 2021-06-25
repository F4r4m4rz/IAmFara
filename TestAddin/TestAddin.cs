using System;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TestAddin
{
    public class TestAddin : IFeatureAddin
    {
        public TestAddin()
        {

        }

        public string Name => nameof(TestAddin);

        public void Instance(IServiceProvider provider)
        {
            provider.GetRequiredService<MyClass>();
        }

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<MyClassConfig>(configuration.GetSection("MyClass"));
            services.AddScoped<MyClass>();
        }
    }
}
