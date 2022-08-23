using Data.Model;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public interface IIntroductionTextRepository
    {
        IntroductionTextModel? GetIntroductionText();
        IntroductionTextModel GetIntroductionText(int id);
        IntroductionTextModel UpdateIntroductionText(IntroductionTextModel newIntroductionText);
        IntroductionTextModel AddIntroductionText(string newIntroductionText);
        void DeleteIntroductionText(int id);
    }

    internal class IntroductionTextRepository : IIntroductionTextRepository
    {
        private readonly ILogger<IntroductionTextRepository> _logger;
        private readonly DataDbContext _dbContext;

        public IntroductionTextRepository(ILogger<IntroductionTextRepository> logger, DataDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public IntroductionTextModel AddIntroductionText(string newIntroductionText)
        {
            _logger.LogInformation("Adding introduction text");


            var introTextModel = new IntroductionTextModel
            {
                Text = newIntroductionText,
                CreatedOn = DateTime.Now,
                LastUpdatedOn = DateTime.Now,
            };

            _dbContext.Add(introTextModel);
            _dbContext.SaveChanges();

            return introTextModel;
        }

        public void DeleteIntroductionText(int id)
        {
            throw new NotImplementedException();
        }

        public IntroductionTextModel? GetIntroductionText()
        {
            return _dbContext.IntroTexts.OrderBy(t => t.Id).LastOrDefault();
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
