using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace AnotherTest
{
    public class MyRazorAddin : IFeatureAddin
    {
        public string Name => "My razor";

        public string Route => "MyRazor";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {

        }
    }
}
