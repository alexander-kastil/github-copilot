using Microsoft.AspNetCore.Mvc;
using copilot_api.Models;

namespace copilot_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructionsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Instruction>> GetInstructions()
    {
        var instructions = new[]
        {
            new Instruction("GetWeatherForecast", "Retrieves weather forecast data"),
            new Instruction("GetInstructions", "Lists all available instructions")
        };
        return Ok(instructions);
    }

    [HttpPost]
    public ActionResult<Instruction> CreateInstruction([FromBody] Instruction instruction)
    {
        return CreatedAtAction(nameof(GetInstructions), instruction);
    }
}
