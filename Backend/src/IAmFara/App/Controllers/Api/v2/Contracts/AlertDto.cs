namespace App.Controllers.Api.Contracts.v2
{
    public enum AlertLevelDto
    {
        Info,
        Success,
        Warning,
        Error
    }

    public class AlertDto
    {
        public string Id { get; set; }
        public AlertLevelDto Level { get; set; }
        public string Message { get; set; }
        public bool Dismissable { get; set; }
        public bool AutoDismiss { get; set; }
        public int Timeout { get; set; }
    }

    public static class AlertHelper
    {
        public static AlertDto Notify(AlertLevelDto level, string message, bool dismissable = false, bool autoDismiss = false, int timeout = 0)
        {
            return new AlertDto
            {
                Id = Guid.NewGuid().ToString(),
                Level = level,
                Message = message,
                Dismissable = dismissable,
                AutoDismiss = autoDismiss,
                Timeout = timeout
            };
        }
    }
}
