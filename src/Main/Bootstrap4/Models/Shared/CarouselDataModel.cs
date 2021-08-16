using IAmFara.Core.Dynamic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.SharedViews.Models.Shared
{
    public class CarouselDataModel : ExchangedData
    {
        public string Image { get; set; }
        public string Title { get; set; }
        public string Summary { get; set; }
    }
}
