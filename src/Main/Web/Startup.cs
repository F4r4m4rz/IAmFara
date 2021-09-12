using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IAmFara.Business.Contexts;
using IAmFara.Business.Repositories;
using IAmFara.Domain.CV;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();

            // CvDbContext
            services.AddDbContext<CVDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemory");
            });

            services.AddScoped<ICVRepository, CVRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });

            // Add in-memory pre-loaded data
            AddInMemoryCVData(app);
        }

        private void AddInMemoryCVData(IApplicationBuilder app)
        {
            var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetService<CVDbContext>();

            var educations = new List<Education>
            {
                new Education
                {
                    Title = "Civil engineering",
                    Place = "Qazvin, Iran",
                    University = "Qazvin Azad university",
                    UniversityUrl = "www.qiau.ac.ir",
                    From = new DateTime(2004, 9, 1),
                    To = new DateTime(2010, 6, 1)
                }
            };

            var interests = new List<Interest>
            {
                new Interest
                {
                    Title = "Photographing"
                },
                new Interest
                {
                    Title = "Film"
                }
            };

            var introduction = new Introduction
            {
                Title = "Full-stack developer",
                Intro = "Self-taught"
            };

            var projects = new List<Project>
            {
                new Project
                {
                    Title = "Current website",
                    From = new DateTime(2020, 9, 1),
                    IsCurrent = true
                },
                new Project
                {
                    Title = "PrideArt",
                    ProjectUrl = "www.skeivkunst.com",
                    From = new DateTime(2020,12,15),
                    To = new DateTime(2021, 5, 31)
                }
            };

            var skills = new List<Skill>
            {
                new Skill
                {
                    Title = "C#",
                    LevelOfProfieciency = SkillProficiencyLevels.Proficient
                },
                new Skill
                {
                    Title = ".NET",
                    LevelOfProfieciency = SkillProficiencyLevels.Proficient
                }
            };

            context.AddRange(educations);
            context.AddRange(interests);
            context.AddRange(introduction);
            context.AddRange(projects);
            context.AddRange(skills);
            context.SaveChanges();
        }
    }
}
