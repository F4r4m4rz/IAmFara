using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;

namespace System
{
    public static class EnumExtensions
    {
        public static string GetDescription<T>(this T @enum) where T : Enum
        {
            var desc = (typeof(T).GetMember(@enum.ToString())?
                .FirstOrDefault()?
                .GetCustomAttribute(typeof(DescriptionAttribute)) as DescriptionAttribute)?.Description;
            return desc;
        }
    }
}
