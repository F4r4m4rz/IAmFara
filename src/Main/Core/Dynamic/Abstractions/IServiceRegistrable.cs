using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace IAmFara.Core.Dynamic.Abstractions
{
    public interface IServiceRegistrable
    {
        /// <summary>
        /// Method to register required services to enable the plugin
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        void RegisterServices(IServiceCollection services, IConfiguration configuration);
    }
}
