using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IAmFara.Business.Repositories;
using IAmFara.Domain.CV;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly ICVRepository _repository;

        public IndexModel(ILogger<IndexModel> logger, ICVRepository repository)
        {
            _logger = logger;
            _repository = repository;
        }

        public CV CV { get; private set; }

        public async Task OnGet()
        {
            CV = await _repository.GetCVAsync();
        }

        public async Task<IActionResult> OnPostAddInterest()
        {
            await _repository.AddAsync(new Interest { Title = "Reading" });
            return RedirectToPage();
        }
    }
}
