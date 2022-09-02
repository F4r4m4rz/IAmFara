using App.Controllers.Api.Contracts.v2;
using Data.Exceptions;
using Data.Repositories;
using Infrastructure.Authorization;
using Infrastructure.Misc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace App.Controllers.Api.v2
{
    [Route("api/v2/{controller}")]
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
        [ProducesResponseType(200, Type = typeof(ApiResponse<IntroductionTextDto>))]
        [AllowAnonymous]
        public IActionResult GetIntroText()
        {
            try
            {
                _logger.LogInformation("Retriving introduction text");
                var introText = _introTextRepository.GetIntroductionText();
                if (introText is null)
                {
                    var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, "Could not find any data of type: IntroductionText", false, true, 5);
                    return Ok(ApiResponseHelper.GenerateResponse<IntroductionTextDto>(null, warningNotification));
                }

                var dto = Mapper.Map(introText);

                var successNotification = AlertHelper.Notify(AlertLevelDto.Success, "Successfully pulled data of type: IntroductionText", false, true, 3);

                var response = ApiResponseHelper.GenerateResponse(dto, successNotification);

                // Make latency, just to demonstrate
                Thread.Sleep(3000);

                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Getting introduction text failed", ex);

                var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, "Failed to load Introduction text", false, true, 5);
                return Ok(ApiResponseHelper.GenerateResponse<IntroductionTextDto>(null, warningNotification));
            }
        }

        [HttpPost("introtext", Name = "Update introduction text")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<IntroductionTextDto>))]
        public IActionResult UpdateIntroText([FromBody] string introText)
        {
            try
            {
                _logger.LogInformation("Updating introduction text");

                var introTextModel = _introTextRepository.AddIntroductionText(introText);
                var dto = Mapper.Map(introTextModel);

                var successNotification = AlertHelper.Notify(AlertLevelDto.Success, "Successfully updated data: IntroductionText", false, true, 3);

                var response = ApiResponseHelper.GenerateResponse(dto, successNotification);
                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Failed to update introduction text", ex);

                var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, "Failed to update Introduction text", false, true, 5);
                return Ok(ApiResponseHelper.GenerateResponse<IntroductionTextDto>(null, warningNotification));
            }
        }

        [HttpGet("skills", Name = "Get skills")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<IEnumerable<SkillDto>>))]
        [AllowAnonymous]
        public IActionResult GetSkills()
        {
            try
            {
                _logger.LogInformation("Retriving skills");
                var skills = _skillsRepository.GetAll();
                var dtos = skills.Select(s => Mapper.Map(s));

                var successNotification = AlertHelper.Notify(AlertLevelDto.Success, "Successfully pulled data of type: Skills", false, true, 3);

                var response = ApiResponseHelper.GenerateResponse(dtos, successNotification);

                // Make latency, just to demonstrate
                Thread.Sleep(2000);

                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                _logger.LogWarning("Failed to get skills", ex);

                var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, "Failed to get skills", false, true, 5);
                return Ok(ApiResponseHelper.GenerateResponse<IEnumerable<SkillDto>>(null, warningNotification));
            }
        }

        [HttpPost("skills", Name = "Add or update skill")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SkillDto>))]
        public IActionResult AddOrUpdateSkill([FromBody] SkillDto skill)
        {
            try
            {
                var isNew = skill.Id <= 0;
                _logger.LogInformation($"Adding or updating skill. Id: {skill.Id}");
                var newSkill = _skillsRepository.AddOrUpdate(Mapper.Map(skill));
                var dto = Mapper.Map(newSkill);

                var succesNotification = AlertHelper.Notify(AlertLevelDto.Success, "Successfully added/updated skill", false, true, 3);
                var response = ApiResponseHelper.GenerateResponse(dto, succesNotification);
                return Ok(response);
            }
            catch (IAmFaraException ex)
            {
                var message = $"Failed to {(skill.Id < 0 ? "add" : "update")} skill";
                _logger.LogWarning(message, ex);

                var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, message, false, true, 5);
                return Ok(ApiResponseHelper.GenerateResponse<SkillDto>(null, warningNotification));
            }
        }

        [HttpDelete("skills", Name = "Delete skill")]
        [ProducesResponseType(200, Type = typeof(ApiResponse<SkillDto>))]
        public IActionResult DeleteSkill([FromQuery] int id)
        {
            try
            {
                _logger.LogInformation($"Deleting skill. Id: {id}");
                var skill = _skillsRepository.Get(id);
                if (skill != null)
                {
                    _skillsRepository.Delete(id);
                    var alert = AlertHelper.Notify(AlertLevelDto.Success, $"Successfully deleted skill. Id: {id}", false, true, 3);
                    var response = ApiResponseHelper.GenerateResponse<SkillDto>(Mapper.Map(skill), alert);
                    return Ok(response);
                }
                else
                {
                    var alert = AlertHelper.Notify(AlertLevelDto.Warning, $"Could not deleted skill. Id: {id}", false, true, 3);
                    var response = ApiResponseHelper.GenerateResponse<SkillDto>(null, alert);
                    return Ok(response);
                }

                
            }
            catch (IAmFaraException ex)
            {
                var message = $"Failed to delete skill. Id: {id}";
                _logger.LogWarning(message, ex);

                var warningNotification = AlertHelper.Notify(AlertLevelDto.Warning, message, false, true, 5);
                return Ok(ApiResponseHelper.GenerateResponse<SkillDto>(null, warningNotification));
            }
        }
    }
}
