using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.Bootstrap4
{
    public enum BootstrapColors
    {
        [Description("primary")]
        Primary = 1,

        [Description("secondary")]
        Secondary = 2,

        [Description("success")]
        Success = 3,

        [Description("danger")]
        Danger = 4,

        [Description("warning")]
        Warning = 5,

        [Description("info")]
        Info = 6,

        [Description("light")]
        Light = 7,

        [Description("dark")]
        Dark = 8,
    }
}
