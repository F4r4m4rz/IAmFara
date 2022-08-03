using Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories
{
    public interface IIntroductionTextRepository
    {
        IntroductionTextModel GetIntroductionText();
        IntroductionTextModel GetIntroductionText(int id);
        IntroductionTextModel UpdateIntroductionText(IntroductionTextModel newIntroductionText);
        IntroductionTextModel AddIntroductionText(IntroductionTextModel newIntroductionText);
        void DeleteIntroductionText(int id);
    }

    internal class IntroductionTextRepository : IIntroductionTextRepository
    {
        public IntroductionTextModel AddIntroductionText(IntroductionTextModel newIntroductionText)
        {
            throw new NotImplementedException();
        }

        public void DeleteIntroductionText(int id)
        {
            throw new NotImplementedException();
        }

        public IntroductionTextModel GetIntroductionText()
        {
            throw new NotImplementedException();
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
