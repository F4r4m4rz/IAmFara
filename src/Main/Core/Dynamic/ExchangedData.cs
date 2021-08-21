using IAmFara.Core.Dynamic.Attributes;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;

namespace IAmFara.Core.Dynamic
{
    public abstract class ExchangedData
    {
        /// <summary>
        /// Indexer to dynamically get access to the property
        /// </summary>
        /// <param name="key">Name of property (Case sensetive)</param>
        /// <returns></returns>
        private object this[string key]
        {
            get
            {
                var property = GetType().GetProperty(key, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                return property.GetValue(this);
            }
        }

        public virtual T Cast<T>() where T: ExchangedData, new()
        {
            var type = typeof(T);
            var targetObj = new T();
            var properties = GetType().GetPublicInstanceProperties();
            foreach (var prop in properties)
            {
                // First get property by its attribute
                if (!prop.SetValueFlaggedProperty<T>(targetObj, this[prop.Name]))
                {
                    // Get property by its name
                    type.GetProperty(prop.Name)?.SetValue(targetObj, this[prop.Name]);
                }
            }

            return targetObj;
        }
    }
}
