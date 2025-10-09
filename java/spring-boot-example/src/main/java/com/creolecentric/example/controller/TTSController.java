package com.creolecentric.example.controller;

import com.creolecentric.example.client.CreoleCentricClient;
import com.creolecentric.example.exception.CreoleCentricException;
import com.creolecentric.example.model.TTSJob;
import com.creolecentric.example.model.TTSJobRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TTSController {

    @Autowired
    private CreoleCentricClient client;

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CreoleCentric TTS API - Spring Boot Example");
        response.put("version", "1.0.0");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("createJob", "POST /api/tts/jobs");
        endpoints.put("getJobStatus", "GET /api/tts/jobs/{jobId}");
        response.put("endpoints", endpoints);
        response.put("documentation", "https://creolecentric.com/developer");

        return response;
    }

    @PostMapping("/tts/jobs")
    public ResponseEntity<?> createTTSJob(@RequestBody TTSJobRequest request) {
        try {
            if (request.getText() == null || request.getText().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Text is required");
                return ResponseEntity.badRequest().body(error);
            }

            TTSJob job = client.createTTSJob(request);
            return ResponseEntity.ok(job);
        } catch (CreoleCentricException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getResponseBody());
            return ResponseEntity.status(e.getStatusCode()).body(error);
        }
    }

    @GetMapping("/tts/jobs/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable String jobId) {
        try {
            TTSJob job = client.getJobStatus(jobId);
            return ResponseEntity.ok(job);
        } catch (CreoleCentricException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getResponseBody());
            return ResponseEntity.status(e.getStatusCode()).body(error);
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
