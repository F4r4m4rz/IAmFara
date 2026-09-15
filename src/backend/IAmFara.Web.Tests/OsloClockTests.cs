using IAmFara.Web.Services;

namespace IAmFara.Web.Tests;

public class OsloClockTests
{
    [Theory]
    // Winter (CET, UTC+1): 23:00 UTC on the 14th is still the 14th in Oslo, 23:30 rolls to the 15th.
    [InlineData("2026-01-14T22:30:00Z", "2026-01-14")]
    [InlineData("2026-01-14T23:30:00Z", "2026-01-15")]
    // Summer (CEST, UTC+2): 21:30 UTC is still the 14th in Oslo, 22:30 rolls to the 15th.
    [InlineData("2026-07-14T21:30:00Z", "2026-07-14")]
    [InlineData("2026-07-14T22:30:00Z", "2026-07-15")]
    public void ToOsloDate_ConvertsAcrossTheDayBoundary(string utcInstant, string expectedOsloDate)
    {
        var utc = DateTime.Parse(utcInstant, null, System.Globalization.DateTimeStyles.AdjustToUniversal | System.Globalization.DateTimeStyles.AssumeUniversal);
        Assert.Equal(DateOnly.Parse(expectedOsloDate), OsloClock.ToOsloDate(utc));
    }

    [Fact]
    public void PreviousOsloDate_ReturnsYesterdayRelativeToOslo()
    {
        // 2026-01-15T10:00:00Z is 2026-01-15 11:00 in Oslo (CET) — "yesterday" is the 14th.
        var utcNow = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc);
        Assert.Equal(new DateOnly(2026, 1, 14), OsloClock.PreviousOsloDate(utcNow));
    }

    [Fact]
    public void OsloDayRangeUtc_WinterDayIsExactly24Hours()
    {
        var (start, end) = OsloClock.OsloDayRangeUtc(new DateOnly(2026, 1, 15));
        Assert.Equal(TimeSpan.FromHours(24), end - start);
        Assert.Equal(new DateTime(2026, 1, 14, 23, 0, 0, DateTimeKind.Utc), start);
        Assert.Equal(new DateTime(2026, 1, 15, 23, 0, 0, DateTimeKind.Utc), end);
    }

    [Fact]
    public void OsloDayRangeUtc_SpringForwardDayIsTwentyThreeHours()
    {
        // DST starts in Europe/Oslo on the last Sunday of March — 2026-03-29.
        var (start, end) = OsloClock.OsloDayRangeUtc(new DateOnly(2026, 3, 29));
        Assert.Equal(TimeSpan.FromHours(23), end - start);
    }

    [Fact]
    public void OsloDayRangeUtc_FallBackDayIsTwentyFiveHours()
    {
        // DST ends in Europe/Oslo on the last Sunday of October — 2026-10-25.
        var (start, end) = OsloClock.OsloDayRangeUtc(new DateOnly(2026, 10, 25));
        Assert.Equal(TimeSpan.FromHours(25), end - start);
    }

    [Fact]
    public void OsloDayRangeUtc_VisitsAtBoundariesFallInExpectedDay()
    {
        var (start, end) = OsloClock.OsloDayRangeUtc(new DateOnly(2026, 1, 15));

        Assert.Equal(new DateOnly(2026, 1, 15), OsloClock.ToOsloDate(start));
        Assert.Equal(new DateOnly(2026, 1, 14), OsloClock.ToOsloDate(start.AddTicks(-1)));
        Assert.Equal(new DateOnly(2026, 1, 15), OsloClock.ToOsloDate(end.AddTicks(-1)));
        Assert.Equal(new DateOnly(2026, 1, 16), OsloClock.ToOsloDate(end));
    }
}
