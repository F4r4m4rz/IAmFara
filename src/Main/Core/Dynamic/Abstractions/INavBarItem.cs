using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public interface INavBarItem : IValidatableObject
    {
        [Required(AllowEmptyStrings = false)]
        string Name { get; }

        string Icon { get; }

        [MinLength(1)]
        IPage[] Pages { get; }
    }
}
