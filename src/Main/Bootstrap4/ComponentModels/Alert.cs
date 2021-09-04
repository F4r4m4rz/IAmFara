using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public static class AlertComponantConstants
    {
        public const string ComponentTypeName = nameof(Alert);

        public static class Properties
        {
            public const string Header = nameof(AlertDataModel.Header);
            public const string Content = nameof(AlertDataModel.Content);
            public const string AdditionalContent = nameof(AlertDataModel.AdditionalContent);
            public const string HasDismiss = nameof(AlertDataModel.HasDismiss);
        }
    }

    public class AlertDataModel : ExchangedData, IComponentDataModel
    {
        public BootstrapColors BootstrapColor { get; set; } = BootstrapColors.Primary;

        public string Header { get; set; }

        [Required]
        public string Content { get; set; }

        public string AdditionalContent { get; set; }

        public bool HasDismiss { get; set; } = false;

        public string GetBootstrapClass() => "alert-" + BootstrapColor.GetDescription();

        public string GetComponentName() => AlertComponantConstants.ComponentTypeName;
    }

    public class Alert : ViewComponent
    {
        public IViewComponentResult Invoke(ExchangedData model)
        {
            return View(model);
        }
    }
}
