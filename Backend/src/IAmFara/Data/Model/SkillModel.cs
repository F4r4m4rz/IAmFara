using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Model
{
    public enum SkillRateEnum
    {
        Beginner = 1,
        SomeExperience = 2,
        Convenient = 3,
        Expert = 4,
        Master = 5
    }

#nullable disable
    public class SkillModel
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public SkillRateEnum Rate { get; set; }

    }
}
