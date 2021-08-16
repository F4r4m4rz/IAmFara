using IAmFara.Core.Dynamic;
using IAmFara.Core.Dynamic.Attributes;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Tests.Dynamic
{
    public class ExchangedDataTests
    {
        public class SourceType : ExchangedData
        {
            public int IntProp { get; set; }
            public string StringProp { get; set; }
            public object ObjectProp { get; set; }

            [ExchangedDataPropertyAttribute(PropertyName = "IntAttributeTest")]
            public int IntPropWithAttribute { get; set; }
            [ExchangedDataPropertyAttribute(PropertyName = "StringAttributeTest")]
            public string StringPropWithAttribute { get; set; }
            [ExchangedDataPropertyAttribute(PropertyName = "ObjectAttributeTest")]
            public object ObjectPropWithAttribute { get; set; }

            public object SourceNotMappedProperty { get; set; }
        }

        private class TargetType : ExchangedData
        {
            public int IntProp { get; set; }
            public string StringProp { get; set; }
            public object ObjectProp { get; set; }
            public int IntAttributeTest { get; set; }
            public string StringAttributeTest { get; set; }
            public object ObjectAttributeTest { get; set; }

            // This should not be mapped
            public object TargetNotMappedProperty { get; set; }
        }

        [Test]
        public void CanMapPropertiesByName()
        {
            // Prepare
            var source = new SourceType 
            {
                IntProp = 1,
                StringProp = "Hello world!",
                ObjectProp = new { Property1 = "Property1", Property2 = 2 } 
            };

            // Test
            var target = source.Cast<TargetType>();

            // Assert
            Assert.AreEqual(source.IntProp, target.IntProp);
            Assert.AreEqual(source.StringProp, target.StringProp);
            Assert.AreEqual(source.ObjectProp, target.ObjectProp);
            Assert.IsNull(target.TargetNotMappedProperty);
        }

        [Test]
        public void CanMapPropertiesByAttribute()
        {
            // Prepare
            var source = new SourceType 
            { 
                IntPropWithAttribute = 1,
                StringPropWithAttribute = "Hello world!",
                ObjectPropWithAttribute = new { Property1 = "Property1", Property2 = 2 }
            };

            // Test
            var target = source.Cast<TargetType>();

            // Assert
            Assert.AreEqual(source.IntPropWithAttribute, target.IntAttributeTest);
            Assert.AreEqual(source.StringPropWithAttribute, target.StringAttributeTest);
            Assert.AreEqual(source.ObjectPropWithAttribute, target.ObjectAttributeTest);
            Assert.IsNull(target.TargetNotMappedProperty);
        }

        [Test]
        public void CanMapPropertiesByNameAndAttribute()
        {
            // Prepare
            var source = new SourceType
            {
                IntProp = 1,
                StringProp = "Hello world!",
                ObjectProp = new { Property1 = "Property1", Property2 = 2 },
                IntPropWithAttribute = 1,
                StringPropWithAttribute = "Hello world!",
                ObjectPropWithAttribute = new { Property1 = "Property1", Property2 = 2 },
                SourceNotMappedProperty = "Something"
            };

            // Test
            var target = source.Cast<TargetType>();

            // Assert
            Assert.AreEqual(source.IntProp, target.IntProp);
            Assert.AreEqual(source.StringProp, target.StringProp);
            Assert.AreEqual(source.ObjectProp, target.ObjectProp);
            Assert.AreEqual(source.IntPropWithAttribute, target.IntAttributeTest);
            Assert.AreEqual(source.StringPropWithAttribute, target.StringAttributeTest);
            Assert.AreEqual(source.ObjectPropWithAttribute, target.ObjectAttributeTest);
            Assert.IsNull(target.TargetNotMappedProperty);
        }
    }
}
