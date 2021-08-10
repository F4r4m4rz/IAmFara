using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public interface IPage : IServiceRegistrable, IValidatableObject
    {
        [Required(AllowEmptyStrings = false)]
        string Name { get; }

        [Required(AllowEmptyStrings = false)]
        string Route { get; }
    }
}
