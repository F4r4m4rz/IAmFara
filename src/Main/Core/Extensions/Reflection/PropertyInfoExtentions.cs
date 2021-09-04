using IAmFara.Core.Dynamic;
using IAmFara.Core.Dynamic.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace System.Reflection
{
    public static class PropertyInfoExtentions
    {
        public static bool IsFlaggedProperty(this PropertyInfo property, Type componentType, out ExchangedDataPropertyAttribute attribute)
        {
            attribute = property.GetCustomAttributes<ExchangedDataPropertyAttribute>()
                .FirstOrDefault(att =>
                {
                    // Check type
                    if (att.ComponentType != null)
                        return att.ComponentType.Equals(componentType);

                    // Check type name
                    if (!string.IsNullOrWhiteSpace(att.ComponentTypeName))
                        return att.ComponentTypeName.Equals(componentType.Name, StringComparison.OrdinalIgnoreCase);

                    return false;
                });
            return attribute != null;
        }

        public static bool SetValueFlaggedProperty<T>(this PropertyInfo property, T targetObject, object value, Type componentType) where T : ExchangedData
        {
            if (property.IsFlaggedProperty(componentType, out var attribute))
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
