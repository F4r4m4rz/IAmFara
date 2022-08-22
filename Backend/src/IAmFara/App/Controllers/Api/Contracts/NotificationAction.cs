namespace App.Controllers.Api.Contracts
{
#nullable disable
    public enum NotificationActionLevelDto
    {
        Info,
        Success,
        Warning,
        Error
    }

    public class ProgressNotificationDto
    {
        public string Id { get; set; }
        public NotificationActionLevelDto Level { get; set; }
        public string Message { get; set; }
        public bool Dismissable { get; set; }
        public bool AutoDismiss { get; set; }
        public int Timeout { get; set; }
    }

    public class NotificationAction : ApiAction
    {
        private NotificationAction()
        {

        }

        public static NotificationAction Notify(NotificationActionLevelDto level, string message, bool dismissable = false, bool autoDismiss = false, int timeout = 0)
        {
            return new NotificationAction()
            {
                Type = "NOTIFICATION-ACTION",
                Payload = new ApiActionPayload
                {
                    Data = new ProgressNotificationDto
                    {
                        Id = Guid.NewGuid().ToString(),
                        Level = level,
                        Message = message,
                        Dismissable = dismissable,
                        AutoDismiss = autoDismiss,
                        Timeout = timeout
                    }
                }
            };
        }
    }
}
