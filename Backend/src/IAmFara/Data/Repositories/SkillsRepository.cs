using Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public interface ISkillsRepository
    {
        SkillModel Get(int id);
        IEnumerable<SkillModel> GetAll();
        SkillModel Add(SkillModel skill);
        SkillModel Update(SkillModel skill);
        void Delete(int id);
    }

    internal class SkillsRepository : ISkillsRepository
    {
        public SkillModel Add(SkillModel skill)
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
            throw new NotImplementedException();
        }

        public SkillModel Update(SkillModel skill)
        {
            throw new NotImplementedException();
        }
    }
}
