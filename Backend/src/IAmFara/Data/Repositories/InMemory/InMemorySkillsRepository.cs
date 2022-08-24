using Data.Model;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories.InMemory
{
    internal class InMemorySkillsRepository : ISkillsRepository
    {
        readonly ILogger<InMemorySkillsRepository> _logger;
        static readonly List<SkillModel> _skills = new List<SkillModel>();
        static bool _isInstanciated = false;

        public InMemorySkillsRepository(ILogger<InMemorySkillsRepository> logger)
        {
            _logger = logger;

            if (!_isInstanciated)
                InstanciateDatabase();

            _isInstanciated = true;
        }

        private void InstanciateDatabase()
        {
            _logger.LogInformation("Puting data in inmomry DB");

            var skill1 = new SkillModel
            {
                Id = 1,
                Title = "C#",
                Description = "Programing language",
                Rate = SkillRateEnum.Master
            };

            var skill2 = new SkillModel
            {
                Id = 1,
                Title = "React",
                Description = "Frontend",
                Rate = SkillRateEnum.Convenient
            };

            var skill3 = new SkillModel
            {
                Id = 1,
                Title = "Asp.net",
                Description = "Microsoft",
                Rate = SkillRateEnum.Expert
            };

            var skill4 = new SkillModel
            {
                Id = 1,
                Title = "MongoDb",
                Description = "",
                Rate = SkillRateEnum.Beginner
            };

            _skills.Add(skill1);
            _skills.Add(skill2);
            _skills.Add(skill3);
            _skills.Add(skill4);
        }

        public SkillModel AddOrUpdate(SkillModel skill)
        {
            throw new NotImplementedException();
        }

        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        public SkillModel Get(int id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<SkillModel> GetAll()
        {
            _logger.LogInformation("Getting all skills from in memory database");

            return _skills;
        }
    }
}
