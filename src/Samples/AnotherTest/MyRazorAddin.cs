using AnotherTest.Data;
using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AnotherTest
{
    public class MyRazorAddin : BasePlugin
    {
        public override string Name => "My razor";

        public override IFeature[] Features => new[] { new MyRazorFeature() };

        public override void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            base.RegisterServices(services, configuration);
        }
    }

    public class MyRazorFeature : BaseFeature
    {
        public override string Name => "My razor feature";

        public override IPage[] Pages => new[] { new MyRazorPage() };

        public override INavBarItem[] NavBarItems => new[] { new MyRazorNavItem() };
    }

    public class MyRazorPage : IPage
    {
        public string Name => "Razor page";

        public string Route => "Index";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<INewsRepository, InMemoryNews>();
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            return new[] { ValidationResult.Success };
        }
    }

    public class MyRazorNavItem : INavBarItem
    {
        public string Name => "My dropdown";

        public string Icon => "";

        public IPage[] Pages => new IPage[] { new MyPage(), new MyRazorPage() };

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            return new[] { ValidationResult.Success };
        }
    }
}
