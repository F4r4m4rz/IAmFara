using System;
namespace IAmFara.Domain.CV
{
    [System.Diagnostics.DebuggerDisplay("Interest {Title}")]
    public class Interest : ICVItem
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
