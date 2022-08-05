namespace App.Controllers.Api.Contracts
{
#nullable disable
    public class IntroductionTextDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string CreatedOn { get; set; }
        public string LastUpdatedOn { get; set; }
    }

    public enum SkillRateDto
    {
        Beginner = 1,
        SomeExperience = 2,
        Convenient = 3,
        Expert = 4,
        Master = 5
    }

    public class SkillDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public SkillRateDto Rate { get; set; }
    }

    public class AppUserDto
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class SignUpDto
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
    }

    public class SignInDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
