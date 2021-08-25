using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public enum AlertType
    {
        [Description("alert-success")]
        Success = 1,

        [Description("alert-info")]
        Info = 2,

        [Description("alert-warning")]
        Warning = 3,

        [Description("alert-info")]
        Error = 4
    }

    public class AlertDataModel : ExchangedData
    {
        public string AlertBootstrapClass => AlertType.GetDescription();

        public AlertType AlertType => (AlertType)AlertTypeInt;

        public int AlertTypeInt { get; set; } = 1;

        public string Header { get; set; }

        [Required]
        public string Content { get; set; }

        public string AdditionalContent { get; set; }

        public bool HasDismiss { get; set; } = false;
    }

    public class Alert : ViewComponent
    {
        public IViewComponentResult Invoke(ExchangedData model)
        {
            return View(model);
        }
    }
}
