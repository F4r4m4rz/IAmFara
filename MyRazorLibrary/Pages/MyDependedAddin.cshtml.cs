using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using MyRazorLibraryBacking;

namespace MyRazorLibrary.Pages
{
    public class MyDependedAddinModel : PageModel
    {
        private readonly ILogger<MyDependedAddinModel> _logger;
        private readonly MyRazorRepository _repository;

        public MyDependedAddinModel(ILogger<MyDependedAddinModel> logger, MyRazorRepository repository)
        {
            _logger = logger;
            _repository = repository;
        }

        public void OnGet()
        {
            ViewData["Greeting"] = _repository.Get();
        }
    }
}
