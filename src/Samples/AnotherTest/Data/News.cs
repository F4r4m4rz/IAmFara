using IAmFara.Bootstrap4;
using IAmFara.Bootstrap4.ComponentModels;
using IAmFara.Core.Dynamic;
using IAmFara.Core.Dynamic.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace AnotherTest.Data
{
    public class News : ExchangedData
    {
        public int NewsId { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }

        [ExchangedDataProperty(PropertyName = CarouselComponentConstants.Properties.Summary, ComponentTypeName = CarouselComponentConstants.ComponentTypeName)]
        [ExchangedDataProperty(PropertyName = AlertComponantConstants.Properties.Content, ComponentTypeName = AlertComponantConstants.ComponentTypeName)]
        public string Body { get; set; }
        public DateTime DatePublished { get; set; }
        public string Author { get; set; }

        public BootstrapColors BootstrapColor => BootstrapColors.Danger;

        [ExchangedDataProperty(PropertyName = AlertComponantConstants.Properties.HasDismiss, ComponentTypeName = AlertComponantConstants.ComponentTypeName)]
        public bool HasDismiss => true;
    }
}
