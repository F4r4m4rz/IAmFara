using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AnotherTest
{
    public class MyAddin : BasePlugin
    {
        public MyAddin()
        {
        }

        public override string Name => "My plugin";

        public override IFeature[] Features => new[] { new MyFeature() };

        public override void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            base.RegisterServices(services, configuration);
        }
    }

    public class MyFeature : BaseFeature
    {
        public override string Name => "My feature";

        public override IPage[] Pages => new[] { new MyPage() };

        public override INavBarItem[] NavBarItems => new[] { new MyNavBarItem() };
    }

    public class MyPage : IPage
    {
        public string Name => "My page";

        public string Route => "MyAddin";

        public void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {

        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            return new[] { ValidationResult.Success };
        }
    }

    public class MyNavBarItem : INavBarItem
    {
        public string Name => "My nav item";

        public string Icon => "";

        public IPage[] Pages => new[] { new MyPage() };

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            return new[] { ValidationResult.Success };
        }
    }
}
