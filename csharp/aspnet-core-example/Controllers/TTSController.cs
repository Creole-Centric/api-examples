using Microsoft.AspNetCore.Mvc;
using CreoleCentricExample.Exceptions;
using CreoleCentricExample.Models;
using CreoleCentricExample.Services;

namespace CreoleCentricExample.Controllers;

[ApiController]
[Route("api")]
public class TTSController : ControllerBase
{
    private readonly CreoleCentricClient _client;
    private readonly ILogger<TTSController> _logger;

    public TTSController(CreoleCentricClient client, ILogger<TTSController> logger)
    {
        _client = client;
        _logger = logger;
    }

    [HttpGet("")]
    public IActionResult Root()
    {
        return Ok(new
        {
            message = "CreoleCentric TTS API - ASP.NET Core Example",
            version = "1.0.0",
            endpoints = new
            {
                createJob = "POST /api/tts/jobs",
                getJobStatus = "GET /api/tts/jobs/{jobId}"
            },
            documentation = "https://creolecentric.com/developer"
        });
    }

    [HttpPost("tts/jobs")]
    public async Task<IActionResult> CreateTTSJob([FromBody] TTSJobRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { error = "Text is required" });
            }

            var job = await _client.CreateTTSJobAsync(request);
            return Ok(job);
        }
        catch (CreoleCentricException ex)
        {
            _logger.LogError(ex, "CreoleCentric API error");
            return StatusCode(ex.StatusCode, new
            {
                error = ex.Message,
                details = ex.ResponseBody
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("tts/jobs/{jobId}")]
    public async Task<IActionResult> GetJobStatus(string jobId)
    {
        try
        {
            var job = await _client.GetJobStatusAsync(jobId);
            return Ok(job);
        }
        catch (CreoleCentricException ex)
        {
            _logger.LogError(ex, "CreoleCentric API error");
            return StatusCode(ex.StatusCode, new
            {
                error = ex.Message,
                details = ex.ResponseBody
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
