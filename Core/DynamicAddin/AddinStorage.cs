using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Core.DynamicAddin
{
    public class AddinStorage
    {
        private readonly IList<IFeatureAddin> _addins;
        private readonly IServiceCollection _services;
        private readonly IConfiguration _configuration;

        internal AddinStorage(IServiceCollection services, IConfiguration configuration)
        {
            _addins = new List<IFeatureAddin>();
            _services = services;
            _configuration = configuration;
        }

        internal void RegisterAddin(IFeatureAddin addin)
        {
            addin.RegisterServices(_services, _configuration);
            _addins.Add(addin);
        }

        internal IReadOnlyCollection<IFeatureAddin> GetRegisteredAddins() => new ReadOnlyCollection<IFeatureAddin>(_addins);
    }
}
