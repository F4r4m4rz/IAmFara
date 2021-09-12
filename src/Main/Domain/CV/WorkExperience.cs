using System;
namespace IAmFara.Domain.CV
{
    [System.Diagnostics.DebuggerDisplay("Work experience {Title}, {Company}")]
    public class WorkExperience : ICVItem
    {
        public int Id { get; set; }
        public string JobTitle { get; set; }
        public string Company { get; set; }
        public string CompanyUrl { get; set; }
        public string Place { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public bool IsCurrent { get; set; }
    }
}
