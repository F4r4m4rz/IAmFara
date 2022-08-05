using Data.Model;
using Infrastructure.Authentication.Exceptions;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Authentication
{
    internal interface IPasswordHandler
    {
        string HashPassword(string password);
        bool PasswordIsValid(AppUser user, string password);
    }

    internal class PasswordHandler : IPasswordHandler
    {
        public PasswordHandler()
        {

        }

        public bool PasswordIsValid(AppUser user, string password)
        {
            var hashedPasswordFromDb = user.Password;

            return Compare(hashedPasswordFromDb, password);
        }

        bool Compare(string hash, string password)
        {
            var salt = hash.Split(':')[0];

            var newHash = Hash(password, SaltToByteArray(salt));

            return hash == newHash;
        }

        public string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(128 / 8);
            return Hash(password, salt);
        }

        string Hash(string password, byte[] salt)
        {
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
                ));
        }

        string SaltToBase64String(byte[] salt)
        {
            return Convert.ToBase64String(salt);
        }

        byte[] SaltToByteArray(string salt)
        {
            return Convert.FromBase64String(salt);
        }
    }
}
