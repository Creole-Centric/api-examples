package com.creolecentric.example.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TTSJob {
    private String id;
    private String status;
    private String text;

    @JsonProperty("voice_id")
    private String voiceId;

    @JsonProperty("model_id")
    private String modelId;

    @JsonProperty("audio_url")
    private String audioUrl;

    @JsonProperty("duration_seconds")
    private Double durationSeconds;

    @JsonProperty("credits_used")
    private Integer creditsUsed;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("completed_at")
    private String completedAt;

    @JsonProperty("error_message")
    private String errorMessage;
}
