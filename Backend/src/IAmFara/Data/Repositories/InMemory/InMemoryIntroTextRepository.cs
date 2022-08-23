using Data.Model;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories.InMemory
{
    internal class InMemoryIntroTextRepository : IIntroductionTextRepository
    {
        private static readonly List<IntroductionTextModel> _data;
        private readonly ILogger<InMemoryIntroTextRepository> _logger;

        public InMemoryIntroTextRepository(ILogger<InMemoryIntroTextRepository> logger)
        {
            _logger = logger;
        }

        static InMemoryIntroTextRepository()
        {
            _data = new List<IntroductionTextModel>();
            AddInMemoryData();
        }

        static void AddInMemoryData()
        {
            var data1 = new IntroductionTextModel
            {
                Id = 1,
                CreatedOn = DateTime.Now,
                LastUpdatedOn = DateTime.Now,
                Text = @"I am a self-learned full-stack developer with focus on .NET and react.

My jurney as a developer started with developing plug-ins for engineering software such as PDMS, E3D, Tekla NavisWorks and etc. This start awakened my joy and deep interest in developing even more application with higher complexity and therfore led me into learning C# and .NET. More complex applications needed more complex and user friendly user interface and this is where react came into picture as my main focus for frontend development.

It worths mentioning that I have also hands on developing fronend based on .NET technologies as Blazor or ASP.NET razor pages. I choose technologies based on project needs and infrastructure and complexity, but yet react is my own favorite when it comes to frontend and therefore this little webpage is fully depended on .NET for its serverside and react for client side.

This is just a begining. This webpage is ment to be used more and more to publish my experiences and help others who are new in the business to grow as fast as possible."
            };

            _data.Add(data1);
        }

        public IntroductionTextModel AddIntroductionText(string newIntroductionText)
        {
            _logger.LogInformation("Adding new intoduction text");

            var introText = new IntroductionTextModel
            {
                Id = _data.Count,
                Text = newIntroductionText,
                CreatedOn = DateTime.Now,
                LastUpdatedOn = DateTime.Now
            };

            _logger.LogInformation($"Assigned Id is {introText.Id}");

            _data.Add(introText);

            return introText;
        }

        public void DeleteIntroductionText(int id)
        {
            throw new NotImplementedException();
        }

        public IntroductionTextModel GetIntroductionText()
        {
            _logger.LogInformation("Getting latest introduction text from data");
            return _data.OrderBy(a => a.Id).LastOrDefault() ?? new IntroductionTextModel();
        }

        public IntroductionTextModel GetIntroductionText(int id)
        {
            throw new NotImplementedException();
        }

        public IntroductionTextModel UpdateIntroductionText(IntroductionTextModel newIntroductionText)
        {
            throw new NotImplementedException();

        }
    }
}
