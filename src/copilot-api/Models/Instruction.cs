namespace copilot_api.Models;

public class Instruction(string name, string description)
{
    public string Name { get; } = name;
    public string Description { get; } = description;
}
