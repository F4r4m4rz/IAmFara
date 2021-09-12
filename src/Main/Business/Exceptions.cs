using System;
namespace IAmFara.Business
{
    public class IAmFaraDatabaseException : Exception
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
