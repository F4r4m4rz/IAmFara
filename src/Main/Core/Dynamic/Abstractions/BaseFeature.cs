using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public abstract class BaseFeature : IFeature
    {
        public abstract string Name { get; }

        public abstract IPage[] Pages { get; }

        public abstract INavBarItem[] NavBarItems { get; }

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            foreach (var page in Pages ?? new IPage[0])
            {
                page.RegisterServices(services, configuration);
            }
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> results = new List<ValidationResult>();
            foreach (var page in Pages ?? new IPage[0])
            {
                results.AddRange(page.Validate(validationContext));
            }
            return results;
        }
    }
}
