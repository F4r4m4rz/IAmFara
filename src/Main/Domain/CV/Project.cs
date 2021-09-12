using System;
namespace IAmFara.Domain.CV
{
    [System.Diagnostics.DebuggerDisplay("Project {Title}")]
    public class Project : ICVItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ProjectUrl { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public bool IsCurrent { get; set; }
    }
}
