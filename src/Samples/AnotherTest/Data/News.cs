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

        [ExchangedDataProperty(PropertyName = "Summary")]
        public string Body { get; set; }
        public DateTime DatePublished { get; set; }
        public string Author { get; set; }
    }
}
