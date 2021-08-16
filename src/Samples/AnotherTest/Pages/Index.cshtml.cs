using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AnotherTest.Data;
using IAmFara.Core.Dynamic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace IAmFara.AnotherTest.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly INewsRepository _repos;
        public IEnumerable<ExchangedData> CarouselDataModels;

        public IndexModel(ILogger<IndexModel> logger, INewsRepository repos)
        {
            _logger = logger;
            _repos = repos;
        }

        public void OnGet()
        {
            _logger.LogInformation("We are in OnGet method");
            CarouselDataModels = _repos.GetAll();
        }
    }
}
