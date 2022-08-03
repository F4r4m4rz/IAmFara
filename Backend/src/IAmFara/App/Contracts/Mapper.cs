using Data.Model;

namespace App.Contracts
{
    public static class Mapper
    {
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
    }
}
