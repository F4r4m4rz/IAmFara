using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyRazorLibraryBacking;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyRazorLibrary
{
    public class RazorAddin : IFeature
    {
        public string Name => "My depended addin";

        public string Route => "MyDependedAddin";

        public IPage[] Pages => throw new NotImplementedException();

        public INavBarItem[] NavBarItems => throw new NotImplementedException();

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<MyRazorRepository>();
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            throw new NotImplementedException();
        }
    }
}
