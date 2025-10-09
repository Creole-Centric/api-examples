package com.creolecentric.ttsexample.models;

import com.google.gson.annotations.SerializedName;

public class Voice {
    @SerializedName("voice_id")
    private String voiceId;

    @SerializedName("name")
    private String name;

    @SerializedName("region")
    private String region;

    @SerializedName("gender")
    private String gender;

    @SerializedName("age")
    private String age;

    @SerializedName("description")
    private String description;

    // Getters
    public String getVoiceId() { return voiceId; }
    public String getName() { return name; }
    public String getRegion() { return region; }
    public String getGender() { return gender; }
    public String getAge() { return age; }
    public String getDescription() { return description; }

    // Setters
    public void setVoiceId(String voiceId) { this.voiceId = voiceId; }
    public void setName(String name) { this.name = name; }
    public void setRegion(String region) { this.region = region; }
    public void setGender(String gender) { this.gender = gender; }
    public void setAge(String age) { this.age = age; }
    public void setDescription(String description) { this.description = description; }
}
