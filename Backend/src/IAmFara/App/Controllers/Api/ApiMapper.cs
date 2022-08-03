using Data.Model;

namespace App.Controllers.Api
{
    public static class ApiMapper
    {
        public static ApiResponse Map(IntroductionTextModel data)
        {
            return new ApiResponse
            {
                Type = "DATA_UPDATED",
                Payload =
                {
                    EntityName = "IntroductionText",
                    Data = Contracts.Mapper.Map(data),
                    Key = "introText"
                }
            };
        }
    }
}
