using copilot_api.Models;
using Microsoft.AspNetCore.Mvc;

namespace copilot_api.Controllers;

/// <summary>
/// Manage instructions for the API.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class InstructionsController : ControllerBase
{
    /// <summary>
    /// Get all instructions.
    /// </summary>
    /// <returns>A list of instructions.</returns>
    [HttpGet]
    public ActionResult<IEnumerable<Instruction>> GetInstructions()
    {
        var instructions = new List<Instruction>
        {
            new("Basic Instruction", "This is a basic instruction example"),
            new("Advanced Instruction", "This is an advanced instruction example")
        };
        return Ok(instructions);
    }

    /// <summary>
    /// Get an instruction by name.
    /// </summary>
    /// <param name="name">The name of the instruction.</param>
    /// <returns>The requested instruction.</returns>
    [HttpGet("{name}")]
    public ActionResult<Instruction> GetInstruction(string name)
    {
        var instruction = new Instruction(name, $"Description for {name}");
        return Ok(instruction);
    }

    /// <summary>
    /// Create a new instruction.
    /// </summary>
    /// <param name="name">The instruction name.</param>
    /// <param name="description">The instruction description.</param>
    /// <returns>The created instruction.</returns>
    [HttpPost]
    public ActionResult<Instruction> CreateInstruction([FromQuery] string name, [FromQuery] string description)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(description))
        {
            return BadRequest("Name and description are required.");
        }

        var instruction = new Instruction(name, description);
        return CreatedAtAction(nameof(GetInstruction), new { name }, instruction);
    }
}
