using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.Bootstrap4.ComponentModels
{
    public interface IComponentDataModel
    {
        List<IComponentDataModel> NestedComponents { get; set; }
        BootstrapColors BootstrapColor { get; set; }
        string GetBootstrapClass();
        string GetComponentName();
    }
}
