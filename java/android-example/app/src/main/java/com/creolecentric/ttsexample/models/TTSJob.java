package com.creolecentric.ttsexample.models;

import com.google.gson.annotations.SerializedName;

public class TTSJob {
    @SerializedName("id")
    private String id;

    @SerializedName("status")
    private String status;

    @SerializedName("text")
    private String text;

    @SerializedName("voice_id")
    private String voiceId;

    @SerializedName("model_id")
    private String modelId;

    @SerializedName("audio_url")
    private String audioUrl;

    @SerializedName("duration_seconds")
    private Double durationSeconds;

    @SerializedName("credits_used")
    private Integer creditsUsed;

    @SerializedName("created_at")
    private String createdAt;

    @SerializedName("completed_at")
    private String completedAt;

    @SerializedName("error_message")
    private String errorMessage;

    // Getters
    public String getId() { return id; }
    public String getStatus() { return status; }
    public String getText() { return text; }
    public String getVoiceId() { return voiceId; }
    public String getModelId() { return modelId; }
    public String getAudioUrl() { return audioUrl; }
    public Double getDurationSeconds() { return durationSeconds; }
    public Integer getCreditsUsed() { return creditsUsed; }
    public String getCreatedAt() { return createdAt; }
    public String getCompletedAt() { return completedAt; }
    public String getErrorMessage() { return errorMessage; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setStatus(String status) { this.status = status; }
    public void setText(String text) { this.text = text; }
    public void setVoiceId(String voiceId) { this.voiceId = voiceId; }
    public void setModelId(String modelId) { this.modelId = modelId; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }
    public void setCreditsUsed(Integer creditsUsed) { this.creditsUsed = creditsUsed; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
