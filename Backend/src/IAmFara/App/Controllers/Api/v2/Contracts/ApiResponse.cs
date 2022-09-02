using App.Controllers.Api.Contracts.v2;

namespace App.Controllers.Api.v2
{
    public class ApiResponse<T>
    {
        internal ApiResponse()
        {

        }

        public T? Data { get; set; }
        public IEnumerable<AlertDto> Alerts { get; set; } = new List<AlertDto>();
    }

    public static class ApiResponseHelper
    {
        public static ApiResponse<T> GenerateResponse<T>(T? data, params AlertDto[] alerts)
        {
            var response = new ApiResponse<T>();
            response.Data = data;
            response.Alerts = alerts;
            return response;
        }
    }
}
