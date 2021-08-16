using IAmFara.Core.Dynamic;
using IAmFara.Core.Dynamic.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace System.Reflection
{
    public static class PropertyInfoExtentions
    {
        public static bool IsFlaggedProperty(this PropertyInfo property, out ExchangedDataPropertyAttribute attribute)
        {
            attribute = property.GetCustomAttribute<ExchangedDataPropertyAttribute>();
            return attribute != null;
        }

        public static bool SetValueFlaggedProperty<T>(this PropertyInfo property, T targetObject, object value) where T : ExchangedData
        {
            if (property.IsFlaggedProperty(out var attribute))
            {
                typeof(T).GetProperty(attribute.PropertyName)?.SetValue(targetObject, value);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
