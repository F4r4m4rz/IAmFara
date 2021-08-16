using System;
using System.Collections.Generic;
using System.Text;

namespace IAmFara.Core.Dynamic.Attributes
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
    public class ExchangedDataPropertyAttribute : Attribute
    {
        public string PropertyName { get; set; }
    }
}
