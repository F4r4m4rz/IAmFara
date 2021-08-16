using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace System.Reflection
{
    internal static class TypeExtentions
    {
        public static IEnumerable<PropertyInfo> GetPublicInstanceProperties(this Type type)
        {
            return type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
                ?? new PropertyInfo[0];
        }
    }
}
