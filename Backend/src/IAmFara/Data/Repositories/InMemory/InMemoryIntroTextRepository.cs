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
                Text = "Hello!"
            };

            _data.Add(data1);
        }

        public IntroductionTextModel AddIntroductionText(IntroductionTextModel newIntroductionText)
        {
            _logger.LogInformation("Adding new intoduction text");

            newIntroductionText.Id = _data.Count;

            _logger.LogInformation($"Assigned Id is {newIntroductionText.Id}");

            _data.Add(newIntroductionText);

            return newIntroductionText;
        }

        public void DeleteIntroductionText(int id)
        {
            throw new NotImplementedException();
        }

        public IntroductionTextModel GetIntroductionText()
        {
            _logger.LogInformation("Getting latest introduction text from data");
            return _data.FirstOrDefault() ?? new IntroductionTextModel();
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
