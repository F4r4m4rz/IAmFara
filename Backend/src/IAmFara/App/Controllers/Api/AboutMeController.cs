using Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers.Api
{
    [Route("api/{controller}")]
    [ApiController]
    public class AboutMeController : BaseController
    {
        private readonly ILogger<AboutMeController> _logger;
        private readonly IIntroductionTextRepository _introTextRepository;

        public AboutMeController(ILogger<AboutMeController> logger, IIntroductionTextRepository introTextRepository)
        {
            _logger = logger;
            _introTextRepository = introTextRepository;
        }

        [HttpGet("introtext", Name = "Get introduction text")]
        public IActionResult GetIntroText()
        {
            _logger.LogInformation("Here is the controller action");
            var introText = _introTextRepository.GetIntroductionText();
            return Ok(ApiMapper.Map(introText));
        }
    }
}
