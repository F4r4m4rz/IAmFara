using System;
using System.Collections.Generic;

namespace IAmFara.Domain.CV
{
    [System.Diagnostics.DebuggerDisplay("Introduction {Title}")]
    public class Introduction : ICVItem
    {
        public string Title { get; set; }
        public string Intro { get; set; }
    }
}
