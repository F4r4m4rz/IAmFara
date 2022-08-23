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
            if (introText is null)
            {
                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, "Could not find any data of type: IntroductionText", false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }

            var dataUpdateAction = Mapper.MapToAction(introText);

            var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully pulled data of type: IntroductionText", false, true, 3);

            var response = ApiResponse.GenerateResponse(dataUpdateAction, successNotification);
            return Ok(response);
        }

        [HttpPost("introtext", Name = "Update introduction text")]
        public IActionResult UpdateIntroText([FromBody] string introText)
        {
            _logger.LogInformation("Updating introduction text");

            var introTextModel = _introTextRepository.AddIntroductionText(introText);
            var dataUpdateAction = Mapper.MapToAction(introTextModel);

            var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully updated data: IntroductionText", false, true, 3);

            var response = ApiResponse.GenerateResponse(dataUpdateAction, successNotification);
            return Ok(response);
        }

        [HttpGet("skills", Name = "Get skills")]
        public IActionResult GetSkills()
        {
            _logger.LogInformation("Retriving skills");
            var skills = _skillsRepository.GetAll();
            var dataUpdateAction = Mapper.MapToAction(skills);

            var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully pulled data of type: Skills", false, true, 3);

            var response = ApiResponse.GenerateResponse(dataUpdateAction, successNotification);
            return Ok(response);
        }
    }
}
