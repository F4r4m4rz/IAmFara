namespace IAmFara.Data.Abstractions.Finance;

public class Household
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
}
