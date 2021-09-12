using System;
namespace IAmFara.Business
{
    public class IAmFaraException : Exception
    {
        public IAmFaraException(string message) : base(message)
        {

        }

        public IAmFaraException(string message, Exception innerException) : base(message, innerException)
        {

        }
    }

    public class IAmFaraDatabaseException : IAmFaraException
    {
        public IAmFaraDatabaseException(string dbAction, object item, Exception innerException)
            : base($"Db action {dbAction} failed for item {item}", innerException)
        {
            DbAction = dbAction;
            Item = item;
        }

        public string DbAction { get; }
        public object Item { get; }
    }
}
