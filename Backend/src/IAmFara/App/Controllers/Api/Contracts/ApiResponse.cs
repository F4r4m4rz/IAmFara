namespace App.Controllers.Api
{
#nullable disable
    public class ApiResponse
    {
        private ApiResponse()
        {

        }

        public IEnumerable<ApiAction> Actions { get; set; }

        public static ApiResponse GenerateResponse(params ApiAction[] actions)
        {
            var response = new ApiResponse();
            response.Actions = actions;
            return response;
        }
    }

    public class ApiAction
    {
        public string Type { get; set; }
        public ApiActionPayload Payload { get; set; }
    }

    public class ApiActionPayload
    {
        public string EntityName { get; set; }
        public string Key { get; set; }
        public dynamic Data { get; set; }
    }
}
