package com.creolecentric.example.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Voice {
    @JsonProperty("voice_id")
    private String voiceId;

    private String name;
    private String region;
    private String gender;
    private String age;
    private String description;
}
