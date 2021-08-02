using System;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TestAddin
{
    public class NewAddin :IFeatureAddin
    {
        public NewAddin()
        {
        }

        public string Name => "Fara Addin";

        public string Route => "Index";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {

        }
    }
}
