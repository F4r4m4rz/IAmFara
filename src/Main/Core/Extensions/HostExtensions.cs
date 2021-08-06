using IAmFara.Core.DynamicAddin;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.Extensions.Hosting
{
    public static class HostExtensions
    {
        public static IHost LogAddinLogs(this IHost host)
        {
            var addinLogs = host.Services.GetRequiredService<IAddinLogs>();
            addinLogs.Log();

            return host;
        }
    }
}
