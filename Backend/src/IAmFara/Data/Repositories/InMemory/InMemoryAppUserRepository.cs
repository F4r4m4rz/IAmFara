using Data.Model;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data.Repositories.InMemory
{
    internal class InMemoryAppUserRepository : IAppUserRepository
    {
        static bool _isSetupCompleted = false;
        static List<AppUser> _database = new List<AppUser>();
        private readonly ILogger<InMemoryAppUserRepository> _logger;

        public InMemoryAppUserRepository(ILogger<InMemoryAppUserRepository> logger)
        {
            _logger = logger;

            if (!_isSetupCompleted)
                SetupDatabase();
        }

        private void SetupDatabase()
        {
            var user1 = new AppUser
            {
                Email = "bob@email.com",
                FirstName = "Bob",
                Password = "MGcYc5JnwviZZQj6kN5YxA==:BIad+yrJlLfIoHJL4ZDfUIPq1WVkJHcrNJxjveyt1lo="
            };

            var user2 = new AppUser
            {
                Email = "john@email.com",
                FirstName = "John",
            };

            _database.Add(user1);
            _database.Add(user2);
        }

        public AppUser? GetUser(string email)
        {
            return _database.FirstOrDefault(x => x.Email == email);
        }

        public AppUser AddUser(AppUser user)
        {
            _database.Add(user);
            return user;
        }
    }
}
