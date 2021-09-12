using System;
namespace IAmFara.Domain.CV
{
    public enum SkillProficiencyLevels
    {
        Beginner,
        Intermediate,
        Proficient,
        Expert,
        SuperExpert
    }

    [System.Diagnostics.DebuggerDisplay("Skill {Title}")]
    public class Skill : ICVItem
    {
        public string Title { get; set; }
        public SkillProficiencyLevels LevelOfProfieciency { get; set; }
    }
}
