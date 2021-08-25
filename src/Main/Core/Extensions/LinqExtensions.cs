using IAmFara.Core.Dynamic;
using System;
using System.Collections.Generic;
using System.Text;

namespace System.Linq
{
    public static class LinqExtensions
    {
        public static IEnumerable<T> CastExchangedData<T>(this IEnumerable<ExchangedData> list, Type componentType) where T: ExchangedData, new()
        {
            foreach (var item in list)
            {
                yield return item.Cast<T>(componentType);
            }
        }
    }
}
