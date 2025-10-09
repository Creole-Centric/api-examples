using System.Text.Json.Serialization;

namespace CreoleCentricExample.Models;

public class TTSJobRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("voice_id")]
    public string VoiceId { get; set; } = "i4mRPwKM2yHwXhbmkN514"; // Xavier Bruneau default

    [JsonPropertyName("model_id")]
    public string ModelId { get; set; } = "ccl_ht_v100"; // Default Haitian Creole model

    [JsonPropertyName("speed")]
    public double Speed { get; set; } = 1.0;

    [JsonPropertyName("pitch")]
    public double Pitch { get; set; } = 1.0;
}
