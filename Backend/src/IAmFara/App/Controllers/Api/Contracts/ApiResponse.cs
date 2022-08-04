namespace App.Controllers.Api
{
#pragma warning disable CS8618
    public class ApiResponse
    {
        public string Type { get; set; }
        public ApiResponsePayload Payload { get; set; } = new ApiResponsePayload();
    }

    public class ApiResponsePayload
    {
        public string EntityName { get; set; }
        public string Key { get; set; }
        public dynamic Data { get; set; }
    }
}
