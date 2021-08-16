using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public abstract class BasePlugin : IPlugin
    {
        public abstract string Name { get; }

        public abstract IFeature[] Features { get; }

        public virtual void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            foreach (var feature in Features ?? new IFeature[0])
            {
                feature.RegisterServices(services, configuration);
            }
        }

        public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> results = new List<ValidationResult>();
            foreach (var feature in Features)
            {
                results.AddRange(feature.Validate(validationContext));
            }
            return results;
        }
    }
}
