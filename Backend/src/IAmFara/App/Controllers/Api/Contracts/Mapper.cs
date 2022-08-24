using Data.Model;
using Infrastructure.Authentication.Models;

namespace App.Controllers.Api.Contracts
{
    public static class Mapper
    {
        public static ApiAction MapToAction(IntroductionTextModel data)
        {
            return new ApiAction
            {
                Type = "DATA_UPDATED",
                Payload = new ApiActionPayload
                {
                    EntityName = "IntroductionText",
                    Data = Map(data),
                    Key = "introText"
                }
            };
        }

        public static ApiAction MapToAction(IEnumerable<SkillModel> skills)
        {
            var dtos = skills.Select(s => Map(s));
            return new ApiAction
            {
                Type = "DATA_UPDATED",
                Payload = new ApiActionPayload
                {
                    EntityName = "Skill",
                    Data = dtos,
                    Key = "Skills"
                }
            };
        }

        public static ApiAction MapToAction(SkillModel skill, bool isNew)
        {
            return new ApiAction
            {
                Type = "NEW-SKILL",
                Payload = new ApiActionPayload
                {
                    EntityName = "Skill",
                    Data = Map(skill),
                    Key = "Skill"
                }
            };
        }

        public static ApiAction MapToAction(AppUser user)
        {
            return new ApiAction
            {
                Type = "LOGIN_SUCCEDDED",
                Payload = new ApiActionPayload
                {
                    EntityName = "AppUser",
                    Data = Map(user),
                    Key = "currentUser"
                }
            };
        }

        public static SignUpModel Map(SignUpDto dto)
        {
            return new SignUpModel
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Password = dto.Password,
            };
        }

        public static SignInModel Map(SignInDto dto)
        {
            return new SignInModel
            {
                Email = dto.Email,
                Password = dto.Password,
            };
        }

        static AppUserDto Map(AppUser user)
        {
            return new AppUserDto
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            };
        }

        static IntroductionTextDto Map(IntroductionTextModel model)
        {
            return new IntroductionTextDto
            {
                Id = model.Id,
                Text = model.Text ?? "",
                CreatedOn = model.CreatedOn.ToString(),
                LastUpdatedOn = model.LastUpdatedOn.ToString(),
            };
        }

        static SkillDto Map(SkillModel model)
        {
            return new SkillDto
            {
                Id = model.Id,
                Title = model.Title,
                Description = model.Description,
                Rate = (SkillRateDto)model.Rate,
            };
        }
        
        public static SkillModel Map(SkillDto skill)
        {
            return new SkillModel
            {
                Id = skill.Id < 0 ? 0 : skill.Id,
                Title = skill.Title,
                Description = skill.Description,
                Rate = (SkillRateEnum)skill.Rate
            };
        }
    }


}
