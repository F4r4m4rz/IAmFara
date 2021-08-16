using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Core.Dynamic
{
    public class PluginStorage
    {
        private readonly IList<IPlugin> _plugins;
        private readonly IServiceCollection _services;
        private readonly IConfiguration _configuration;

        internal PluginStorage(IServiceCollection services, IConfiguration configuration)
        {
            _plugins = new List<IPlugin>();
            _services = services;
            _configuration = configuration;
        }

        internal void RegisterPlugin(IPlugin addin)
        {
            addin.RegisterServices(_services, _configuration);
            _plugins.Add(addin);
        }

        internal IReadOnlyCollection<IPlugin> GetRegisteredPlugins() => new ReadOnlyCollection<IPlugin>(_plugins);
        internal IReadOnlyCollection<IFeature> GetRegisteredFeatures() => new ReadOnlyCollection<IFeature>(_plugins.SelectMany(p => p.Features).ToList());
        internal IReadOnlyCollection<IPage> GetRegisteredPages() => new ReadOnlyCollection<IPage>(_plugins.SelectMany(p => p.Features.SelectMany(f => f.Pages)).ToList());
        internal IReadOnlyCollection<INavBarItem> GetRegisteredNavBarItems() => new ReadOnlyCollection<INavBarItem>(_plugins.SelectMany(p => p.Features.SelectMany(f => f.NavBarItems)).ToList());
    }
}
