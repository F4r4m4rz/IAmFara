using App.Controllers.Api.Contracts;
using Data.Exceptions;
using Data.Repositories;
using Infrastructure.Authorization;
using Infrastructure.Misc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers.Api
{
    [Route("api/{controller}")]
    [ApiController]
    [Authorize(AuthorizationConstants.AdminPolicyName)]
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
        [AllowAnonymous]
        public IActionResult GetIntroText()
        {
            try
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

                // Make latency, just to demonstrate
                Thread.Sleep(3000);

                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Getting introduction text failed", ex);

                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, "Failed to load Introduction text", false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }
        }

        [HttpPost("introtext", Name = "Update introduction text")]
        public IActionResult UpdateIntroText([FromBody] string introText)
        {
            try
            {
                _logger.LogInformation("Updating introduction text");

                var introTextModel = _introTextRepository.AddIntroductionText(introText);
                var dataUpdateAction = Mapper.MapToAction(introTextModel);

                var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully updated data: IntroductionText", false, true, 3);

                var response = ApiResponse.GenerateResponse(dataUpdateAction, successNotification);
                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Failed to update introduction text", ex);

                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, "Failed to update Introduction text", false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }
        }

        [HttpGet("skills", Name = "Get skills")]
        [AllowAnonymous]
        public IActionResult GetSkills()
        {
            try
            {
                _logger.LogInformation("Retriving skills");
                var skills = _skillsRepository.GetAll();
                var dataUpdateAction = Mapper.MapToAction(skills);

                var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully pulled data of type: Skills", false, true, 3);

                var response = ApiResponse.GenerateResponse(dataUpdateAction, successNotification);

                // Make latency, just to demonstrate
                Thread.Sleep(2000);

                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Failed to get skills", ex);

                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, "Failed to get skills", false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }
        }

        [HttpPost("skills", Name = "Add or update skill")]
        public IActionResult AddOrUpdateSkill([FromBody] SkillDto skill)
        {
            try
            {
                var isNew = skill.Id <= 0;
                _logger.LogInformation($"Adding or updating skill. Id: {skill.Id}");
                var newSkill = _skillsRepository.AddOrUpdate(Mapper.Map(skill));
                var dataAction = Mapper.MapToAction(newSkill, isNew);

                var succesNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, "Successfully added/updated skill", false, true, 3);
                var response = ApiResponse.GenerateResponse(dataAction, succesNotification);
                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                var message = $"Failed to {(skill.Id < 0 ? "add" : "update")} skill";
                _logger.LogWarning(message, ex);

                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, message, false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }
        }

        [HttpDelete("skills", Name = "Delete skill")]
        public IActionResult DeleteSkill([FromQuery] int id)
        {
            try
            {
                _logger.LogInformation($"Deleting skill. Id: {id}");
                _skillsRepository.Delete(id);
                var dataAction = new ApiAction
                {
                    Type = "SKILL-DELETED",
                    Payload = new ApiActionPayload
                    {
                        Data = id
                    }
                };

                var successNotification = NotificationAction.Notify(NotificationActionLevelDto.Success, $"Successfully deleted skill. Id: {id}", false, true, 3);
                var response = ApiResponse.GenerateResponse(dataAction, successNotification);
                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                var message = $"Failed to delete skill. Id: {id}";
                _logger.LogWarning(message, ex);

                var warningNotification = NotificationAction.Notify(NotificationActionLevelDto.Warning, message, false, true, 5);
                return Ok(ApiResponse.GenerateResponse(warningNotification));
            }
        }
    }
}
