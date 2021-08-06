using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Core.DynamicAddin.Abstractions
{
    public interface IFeatureAddin
    {
        string Name { get; }

        string Route { get; }

        void RegisterServices(IServiceCollection services, IConfiguration configuration);
    }
}
