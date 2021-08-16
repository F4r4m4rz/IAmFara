using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public interface IPlugin : IServiceRegistrable, IValidatableObject
    {
        [Required(AllowEmptyStrings = false)]
        string Name { get; }

        [MinLength(0)]
        IFeature[] Features { get; }
    }
}
