using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace AnotherTest.Data
{
    public interface INewsRepository
    {
        News Get(int id);
        IEnumerable<News> GetAll();
    }

    public class InMemoryNews : INewsRepository
    {
        private static List<News> _newsInMemory;
        private readonly ILogger<InMemoryNews> _logger;

        static InMemoryNews()
        {
            _newsInMemory = new List<News>();
            _newsInMemory.Add(new News
            {
                Author = "Faramarz Bodaghi",
                DatePublished = new DateTime(2021, 6, 05),
                Title = "Her er den ny hverdag",
                Image = @"AnotherTest\News images\First image.jpg",
                Body = "Man kommer til å savne den gamle dager",
                NewsId = 1
            });
            _newsInMemory.Add(new News
            {
                Author = "Faramarz Bodaghi",
                DatePublished = new DateTime(2021, 6, 06),
                Title = "Krig i midtøsten",
                Image = @"AnotherTest\News images\Second image.jpg",
                Body = "Iraq er under angrep",
                NewsId = 2
            });
            _newsInMemory.Add(new News
            {
                Author = "Faramarz Bodaghi",
                DatePublished = new DateTime(2021, 6, 07),
                Title = "Nye teknologier kommer",
                Image = @"AnotherTest\News images\Thrid image.jpg",
                Body = "Forskninger stadig utvikler nye løsninger",
                NewsId = 3
            });
        }

        public InMemoryNews(ILogger<InMemoryNews> logger)
        {
            _logger = logger;
        }

        public News Get(int id)
        {
            return _newsInMemory[id];
        }

        public IEnumerable<News> GetAll()
        {
            return _newsInMemory;
        }
    }
}
