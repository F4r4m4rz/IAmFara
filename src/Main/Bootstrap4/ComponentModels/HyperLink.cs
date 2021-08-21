using System;
using System.ComponentModel.DataAnnotations;
using IAmFara.Core.Dynamic;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public class HyperLink : ExchangedData
    {
        [Required]
        public string Href { get; set; }

        [Required]
        public string DisplayText { get; set; }

        public string DisplayColor { get; set; }
    }
}
