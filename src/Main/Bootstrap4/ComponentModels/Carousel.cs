using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public static class CarouselComponentConstants
    {
        public const string ComponentTypeName = nameof(Carousel);

        public static class Properties
        {
            public const string Image = nameof(CarouselDataModel.Image);
            public const string Title = nameof(CarouselDataModel.Title);
            public const string Summary = nameof(CarouselDataModel.Summary);
        }
    }

    public class CarouselDataModel : ComponentDataModel
    {
        internal override BootstrapColors BootstrapColor { get; set; } = BootstrapColors.Primary;

        [Required]
        public string Image { get; set; }

        [Required]
        public string Title { get; set; }

        public string Summary { get; set; }

        internal override string GetBootstrapClass() => string.Empty;

        internal override string GetComponentName() => CarouselComponentConstants.ComponentTypeName;
    }

    public class Carousel : ViewComponent
    {
        public IViewComponentResult Invoke(IEnumerable<ExchangedData> model)
        {
            return View(model);
        }
    }
}
