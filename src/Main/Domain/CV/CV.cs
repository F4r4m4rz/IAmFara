using System;
using System.Collections.Generic;

namespace IAmFara.Domain.CV
{
    public class CV
    {
        public Introduction Introduction { get; set; }
        public IEnumerable<Education> Educations { get; set; }
        public IEnumerable<WorkExperience> WorkExperiences { get; set; }
        public IEnumerable<Project> Projects { get; set; }
        public IEnumerable<Interest> Interests { get; set; }
        public IEnumerable<Skill> Skills { get; set; }
    }
}
