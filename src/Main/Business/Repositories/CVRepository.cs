using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using IAmFara.Business.Contexts;
using IAmFara.Domain.CV;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IAmFara.Business.Repositories
{
    public interface ICVRepository
    {
        Task AddAsync<T>(T item);
        Task<List<T>> GetAllAsync<T>() where T : class, ICVItem;
        Task<T> GetAsync<T>() where T : class, ICVItem;
        Task<CV> GetCVAsync();
        Task RemoveAsync<T>(T removed);
        Task UpdateAsync<T>(T updated);
    }

    public class CVRepository : ICVRepository
    {
        private readonly ILogger<CVRepository> _logger;
        private readonly DbContext _context;

        public CVRepository(ILogger<CVRepository> logger, CVDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<CV> GetCVAsync()
        {
            var introduction = await GetAsync<Introduction>();
            var educations = await GetAllAsync<Education>();
            var experiences = await GetAllAsync<WorkExperience>();
            var projects = await GetAllAsync<Project>();
            var interests = await GetAllAsync<Interest>();
            var skills = await GetAllAsync<Skill>();

            return new CV
            {
                Introduction = introduction,
                Educations = educations,
                WorkExperiences = experiences,
                Projects = projects,
                Interests = interests,
                Skills = skills
            };
        }

        public Task<T> GetAsync<T>() where T : class, ICVItem
        {
            return _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public Task<List<T>> GetAllAsync<T>() where T : class, ICVItem
        {
            return _context.Set<T>()
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task AddAsync<T>(T item)
        {
            try
            {
                _context.Add(item);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to add {item}", ex);
                throw new IAmFaraDatabaseException("Add", item, ex);
            }
        }

        public async Task UpdateAsync<T>(T updated)
        {
            try
            {
                _context.Update(updated);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to update {updated}", ex);
                throw new IAmFaraDatabaseException("Update", updated, ex);
            }
        }

        public async Task RemoveAsync<T>(T removed)
        {
            try
            {
                _context.Remove(removed);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to remove {removed}", ex);
                throw new IAmFaraDatabaseException("Remove", removed, ex);
            }
        }
    }
}
