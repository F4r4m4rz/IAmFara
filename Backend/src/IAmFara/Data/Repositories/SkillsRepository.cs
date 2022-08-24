using Data.Exceptions;
using Data.Model;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public interface ISkillsRepository
    {
        SkillModel Get(int id);
        IEnumerable<SkillModel> GetAll();
        SkillModel AddOrUpdate(SkillModel skill);
        void Delete(int id);
    }

    internal class SkillsRepository : ISkillsRepository
    {
        private readonly ILogger<SkillsRepository> _logger;
        private readonly DataDbContext _dbContext;

        public SkillsRepository(ILogger<SkillsRepository> logger, DataDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public SkillModel AddOrUpdate(SkillModel skill)
        {
            _logger.LogInformation("AddOrUpdate skills");

            // Check if skill is already added in DB
            var fromDb = _dbContext.Find<SkillModel>(skill.Id);
            if (fromDb is null)
            {
                try
                {
                    var added = _dbContext.Add(skill);
                    _dbContext.SaveChanges();
                    return added.Entity;
                }
                catch (Exception ex)
                {
                    throw new IAmFaraException($"Unable to add new skill", ex);
                }
            }

            try
            {
                fromDb.Title = skill.Title;
                fromDb.Description = skill.Description;
                fromDb.Rate = skill.Rate;

                _dbContext.SaveChanges();
                return fromDb;
            }
            catch (Exception ex)
            {
                throw new IAmFaraException($"Unable to update new skill with Id: {skill.Id}", ex);
            }
        }

        public void Delete(int id)
        {
            _logger.LogInformation($"Deleting skill. Id: {id}");
            var fromDb = _dbContext.Find<SkillModel>(id);
            if (fromDb is null)
            {
                throw new IAmFaraException($"Did not find any skill with id: {id} - No entities are removed", null);
            }

            _dbContext.Remove(fromDb);
            _dbContext.SaveChanges();
        }

        public SkillModel Get(int id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<SkillModel> GetAll()
        {
            return _dbContext.Skills;
        }

    }
}
