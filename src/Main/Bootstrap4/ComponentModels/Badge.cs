using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public static class BadgeComponentConstants
    {
        public const string ComponentTypeName = nameof(Badge);
        
        public class Properties
        {
            public const string Content = nameof(BadgeDataModel.Content);
            public const string Href = nameof(BadgeDataModel.Href);
            public const string IsPill = nameof(BadgeDataModel.IsPill);
        }
    }

    public class BadgeDataModel : ExchangedData, IComponentDataModel
    {
        public BootstrapColors BootstrapColor { get; set; } = BootstrapColors.Primary;

        [Required]
        public string Content { get; set; }
        public string Href { get; set; }
        public bool IsPill { get; set; } = false;

        public string GetBootstrapClass() => "badge-" + BootstrapColor.GetDescription();

        public string GetComponentName() => BadgeComponentConstants.ComponentTypeName;
    }

    public class Badge : ViewComponent
    {
        public IViewComponentResult Invoke(ExchangedData model)
        {
            return View(model);
        }
    }
}
