using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace IAmFara.Core.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger, IServiceProvider provider, IEnumerable<IFeatureAddin> addins)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
    }
}
