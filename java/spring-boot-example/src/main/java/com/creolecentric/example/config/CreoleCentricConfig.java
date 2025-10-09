package com.creolecentric.example.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "creolecentric.api")
public class CreoleCentricConfig {
    private String key;
    private String url;
}
