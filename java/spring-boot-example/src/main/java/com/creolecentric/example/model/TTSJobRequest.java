package com.creolecentric.example.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TTSJobRequest {
    private String text;

    @JsonProperty("voice_id")
    private String voiceId = "i4mRPwKM2yHwXhbmkN514"; // Xavier Bruneau default

    @JsonProperty("model_id")
    private String modelId = "ccl_ht_v100"; // Default Haitian Creole model

    private Double speed = 1.0;
    private Double pitch = 1.0;
}
