namespace IAmFara.Web.Services;

public static class PathNormalizer
{
    private const int MaxLength = 200;

    /// <summary>Normalizes a client-supplied path to a safe, comparable form, or null if invalid.</summary>
    public static string? Normalize(string? rawPath)
    {
        if (string.IsNullOrWhiteSpace(rawPath)) return null;

        var path = rawPath.Trim();

        // Defensive: strip query string / fragment even though the client shouldn't send them.
        var cutIndex = path.IndexOfAny(['?', '#']);
        if (cutIndex >= 0) path = path[..cutIndex];

        if (!path.StartsWith('/')) return null;
        if (path.Length == 0 || path.Length > MaxLength) return null;

        // Trim a trailing slash, except for the root path itself.
        if (path.Length > 1 && path.EndsWith('/')) path = path[..^1];

        foreach (var c in path)
        {
            var isAllowed = char.IsLetterOrDigit(c) || c is '/' or '-' or '_' or '.';
            if (!isAllowed) return null;
        }

        return path;
    }
}
