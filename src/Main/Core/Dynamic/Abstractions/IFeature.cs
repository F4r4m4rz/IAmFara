using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public interface IFeature : IServiceRegistrable, IValidatableObject
    {
        [Required(AllowEmptyStrings = false)]
        string Name { get; }

        [MinLength(1)]
        IPage[] Pages { get; }

        INavBarItem[] NavBarItems { get; }
    }
}
