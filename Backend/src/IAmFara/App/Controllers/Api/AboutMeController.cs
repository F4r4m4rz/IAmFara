using App.Controllers.Api.Contracts;
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
        private readonly ISkillsRepository _skillsRepository;

        public AboutMeController(ILogger<AboutMeController> logger, IIntroductionTextRepository introTextRepository, ISkillsRepository skillsRepository)
        {
            _logger = logger;
            _introTextRepository = introTextRepository;
            _skillsRepository = skillsRepository;
        }

        [HttpGet("introtext", Name = "Get introduction text")]
        public IActionResult GetIntroText()
        {
            _logger.LogInformation("Retriving introduction text");
            var introText = _introTextRepository.GetIntroductionText();
            return Ok(Mapper.MapToResponse(introText));
        }

        [HttpGet("skills", Name = "Get skills")]
        public IActionResult GetSkills()
        {
            _logger.LogInformation("Retriving skills");
            var skills = _skillsRepository.GetAll();
            return Ok(Mapper.MapToResponse(skills));
        }
    }
}
