using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyRazorLibraryBacking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyRazorLibrary
{
    public class RazorAddin : IFeatureAddin
    {
        public string Name => "My depended addin";

        public string Route => "MyDependedAddin";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<MyRazorRepository>();
        }
    }
}
