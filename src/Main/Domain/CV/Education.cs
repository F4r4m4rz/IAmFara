using System;
namespace IAmFara.Domain.CV
{
    [System.Diagnostics.DebuggerDisplay("Education {Title}, {University}")]
    public class Education : ICVItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string University { get; set; }
        public string UniversityUrl { get; set; }
        public string Place { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public bool IsCurrent { get; set; }
    }
}
