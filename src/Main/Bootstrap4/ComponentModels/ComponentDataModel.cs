using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IAmFara.Core.Dynamic;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public abstract class ComponentDataModel : ExchangedData
    {
        public abstract BootstrapColors BootstrapColor { get; set; }
        internal abstract string GetBootstrapClass();
        internal abstract string GetComponentName();
    }
}
