using System.Text;
using System.Text.Json;
using CreoleCentricExample.Exceptions;
using CreoleCentricExample.Models;

namespace CreoleCentricExample.Services;

public class CreoleCentricClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public CreoleCentricClient(IConfiguration configuration)
    {
        _apiKey = configuration["CreoleCentric:ApiKey"] ?? throw new InvalidOperationException("API key not configured");
        _baseUrl = configuration["CreoleCentric:ApiUrl"] ?? "https://api.creolecentric.com/v1";

        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(_baseUrl),
            Timeout = TimeSpan.FromSeconds(30)
        };

        _httpClient.DefaultRequestHeaders.Add("Authorization", $"ApiKey {_apiKey}");
    }

    public async Task<TTSJob> CreateTTSJobAsync(TTSJobRequest request)
    {
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("/tts/jobs/", content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new CreoleCentricException(
                $"HTTP {(int)response.StatusCode}: {response.ReasonPhrase}",
                (int)response.StatusCode,
                responseBody
            );
        }

        return JsonSerializer.Deserialize<TTSJob>(responseBody)
            ?? throw new CreoleCentricException("Failed to deserialize response");
    }

    public async Task<TTSJob> GetJobStatusAsync(string jobId)
    {
        var response = await _httpClient.GetAsync($"/tts/jobs/{jobId}/status/");
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new CreoleCentricException(
                $"HTTP {(int)response.StatusCode}: {response.ReasonPhrase}",
                (int)response.StatusCode,
                responseBody
            );
        }

        return JsonSerializer.Deserialize<TTSJob>(responseBody)
            ?? throw new CreoleCentricException("Failed to deserialize response");
    }

}
