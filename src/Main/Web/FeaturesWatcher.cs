﻿using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace IAmFara.Web
{
    public class FeaturesWatcher
    {
        private string _root;
        private int _featuresCount;
        private Timer _timer;
        private readonly ILogger<FeaturesWatcher> _logger;

        public event EventHandler FeaturesCountChanged;

        public FeaturesWatcher(ILogger<FeaturesWatcher> logger)
        {
            _logger = logger;
        }

        public void Initialize(string root)
        {
            if (Directory.Exists(root))
            {
                _root = root;
                _featuresCount = Scan();
                _timer = new Timer(Watch, null, 1000, 0);
            }
            else
                _logger.LogError("Feature folder could not be found");
        }

        private int Scan()
        {
            return Directory.GetFiles(_root, "*.dll", SearchOption.AllDirectories).Length;
        }

        private void Watch(object state)
        {
            _timer.Change(Timeout.Infinite, Timeout.Infinite);

            var newFeaturesCount = Scan();
            if (newFeaturesCount != _featuresCount)
            {
                FeaturesCountChanged?.Invoke(this, null);
                _featuresCount = newFeaturesCount;
            }

            _timer.Change(1000, 0);
        }
    }
}