namespace IAmFara.Web.Services;

/// <summary>
/// All Oslo-local-date reasoning lives here so both visit recording (the HMAC's
/// daily-rotation date) and the report job (the "reporting day" boundary) share one
/// correct, DST-aware implementation. Uses the IANA id "Europe/Oslo", which .NET 6+
/// resolves correctly cross-platform (Linux/ICU and Windows/IIS alike) — unlike the
/// legacy Windows-only "W. Europe Standard Time" id.
/// </summary>
public static class OsloClock
{
    private static readonly TimeZoneInfo OsloZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Oslo");

    /// <summary>Converts a UTC instant to its Oslo-local calendar date.</summary>
    public static DateOnly ToOsloDate(DateTime utcInstant)
    {
        var utc = DateTime.SpecifyKind(utcInstant, DateTimeKind.Utc);
        var osloTime = TimeZoneInfo.ConvertTimeFromUtc(utc, OsloZone);
        return DateOnly.FromDateTime(osloTime);
    }

    /// <summary>The reporting day: the previous calendar day in Oslo, relative to the given UTC instant.</summary>
    public static DateOnly PreviousOsloDate(DateTime utcNow)
    {
        return ToOsloDate(utcNow).AddDays(-1);
    }

    /// <summary>
    /// The [start, end) UTC instant range that covers one Oslo calendar date, correctly
    /// spanning DST transitions (a 23- or 25-hour day at the spring/autumn changeover).
    /// </summary>
    public static (DateTime StartUtc, DateTime EndUtc) OsloDayRangeUtc(DateOnly osloDate)
    {
        var startLocal = osloDate.ToDateTime(TimeOnly.MinValue);
        var endLocal = osloDate.AddDays(1).ToDateTime(TimeOnly.MinValue);

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(startLocal, DateTimeKind.Unspecified), OsloZone);
        var endUtc = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(endLocal, DateTimeKind.Unspecified), OsloZone);

        return (startUtc, endUtc);
    }
}
