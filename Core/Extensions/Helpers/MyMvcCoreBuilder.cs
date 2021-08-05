using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace IAmFara.Core.Extensions.Helpers
{
    internal class MyMvcCoreBuilder : IMvcCoreBuilder
    {
        /// <summary>
        /// Initializes a new <see cref="MvcCoreBuilder"/> instance.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <param name="manager">The <see cref="ApplicationPartManager"/> of the application.</param>
        public MyMvcCoreBuilder(
            IServiceCollection services,
            ApplicationPartManager manager)
        {
            if (services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            if (manager == null)
            {
                throw new ArgumentNullException(nameof(manager));
            }

            Services = services;
            PartManager = manager;
        }

        /// <inheritdoc />
        public ApplicationPartManager PartManager { get; }

        /// <inheritdoc />
        public IServiceCollection Services { get; }
    }
}
