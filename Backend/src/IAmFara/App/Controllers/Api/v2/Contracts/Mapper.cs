using Data.Model;
using Infrastructure.Authentication.Models;

namespace App.Controllers.Api.Contracts.v2
{
    public static class Mapper
    {
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

        public static AppUserDto Map(AppUser user)
        {
            return new AppUserDto
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            };
        }

        public static IntroductionTextDto Map(IntroductionTextModel model)
        {
            return new IntroductionTextDto
            {
                Id = model.Id,
                Text = model.Text ?? "",
                CreatedOn = model.CreatedOn.ToString(),
                LastUpdatedOn = model.LastUpdatedOn.ToString(),
            };
        }

        public static SkillDto Map(SkillModel model)
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
