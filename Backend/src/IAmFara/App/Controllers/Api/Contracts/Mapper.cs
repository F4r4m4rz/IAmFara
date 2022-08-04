using Data.Model;

namespace App.Controllers.Api.Contracts
{
    public static class Mapper
    {
        public static ApiResponse MapToResponse(IntroductionTextModel data)
        {
            return new ApiResponse
            {
                Type = "DATA_UPDATED",
                Payload =
                {
                    EntityName = "IntroductionText",
                    Data = Map(data),
                    Key = "introText"
                }
            };
        }

        public static ApiResponse MapToResponse(IEnumerable<SkillModel> skills)
        {
            var dtos = skills.Select(s => Map(s));
            return new ApiResponse
            {
                Type = "DATA_UPDATED",
                Payload =
                {
                    EntityName = "Skill",
                    Data = dtos,
                    Key = "Skills"
                }
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
        
    }


}
