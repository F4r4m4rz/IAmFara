using IAmFara.Core.Dynamic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public class CarouselDataModel : ExchangedData
    {
        [Required]
        public string Image { get; set; }

        [Required]
        public string Title { get; set; }

        public string Summary { get; set; }
    }
}
