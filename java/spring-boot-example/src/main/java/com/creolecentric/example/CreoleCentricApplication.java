package com.creolecentric.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CreoleCentricApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreoleCentricApplication.class, args);
        System.out.println("✅ CreoleCentric TTS API - Spring Boot Example");
        System.out.println("📖 API Documentation: https://creolecentric.com/developer");
        System.out.println("🚀 Server running on http://localhost:8080");
    }
}
