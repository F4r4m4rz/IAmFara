using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public static class BreadcrumpConstants
    {
        public const string ComponentTypeName = nameof(Breadcrump);

        public class Properties
        {
            public const string Items = nameof(BreadcrumpDataModel.Items);
        }
    }

    public class BreadcrupItem : ExchangedData
    {
        public BreadcrupItem(string title)
        {
            Title = title;
        }

        public BreadcrupItem(string title, string href) : this(title)
        {
            Href = href;
        }
        public string Title { get; set; }
        public string Href { get; set; }
    }

    public class BreadcrumpDataModel : ComponentDataModel
    {
        internal override BootstrapColors BootstrapColor { get; set; }

        public List<BreadcrupItem> Items { get; } = new List<BreadcrupItem>();

        internal override string GetBootstrapClass() => string.Empty;

        internal override string GetComponentName() => BadgeComponentConstants.ComponentTypeName;

        public void AddItems(BreadcrupItem item)
        {
            Items.Add(item);
        }

        public void AddItems(string title, string href)
        {
            AddItems(new BreadcrupItem(title, href));
        }
    }

    public class Breadcrump : ViewComponent
    {
        public IViewComponentResult Invoke(ExchangedData model)
        {
            return View(model);
        }
    }
}
