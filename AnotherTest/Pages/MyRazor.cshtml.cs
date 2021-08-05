using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace IAmFara.AnotherTest.Pages
{
    public class MyRazorModel : PageModel
    {
        private readonly ILogger<MyRazorModel> _logger;

        public MyRazorModel(ILogger<MyRazorModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
            _logger.LogInformation("We are in OnGet method");
            Thread.Sleep(10000);
        }
    }
}
