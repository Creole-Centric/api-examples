package com.creolecentric.example.client;

import com.creolecentric.example.config.CreoleCentricConfig;
import com.creolecentric.example.exception.CreoleCentricException;
import com.creolecentric.example.model.TTSJob;
import com.creolecentric.example.model.TTSJobRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class CreoleCentricClient {
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;

    public CreoleCentricClient(CreoleCentricConfig config, ObjectMapper objectMapper) {
        this.apiKey = config.getKey();
        this.baseUrl = config.getUrl();
        this.objectMapper = objectMapper;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    public TTSJob createTTSJob(TTSJobRequest request) {
        try {
            String json = objectMapper.writeValueAsString(request);
            RequestBody body = RequestBody.create(
                    json,
                    MediaType.parse("application/json")
            );

            Request httpRequest = new Request.Builder()
                    .url(baseUrl + "/tts/jobs/")
                    .post(body)
                    .addHeader("Authorization", "ApiKey " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (!response.isSuccessful()) {
                    throw new CreoleCentricException(
                            "HTTP " + response.code() + ": " + response.message(),
                            response.code(),
                            responseBody
                    );
                }

                return objectMapper.readValue(responseBody, TTSJob.class);
            }
        } catch (IOException e) {
            throw new CreoleCentricException("Network error: " + e.getMessage());
        }
    }

    public TTSJob getJobStatus(String jobId) {
        try {
            Request request = new Request.Builder()
                    .url(baseUrl + "/tts/jobs/" + jobId + "/status/")
                    .get()
                    .addHeader("Authorization", "ApiKey " + apiKey)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (!response.isSuccessful()) {
                    throw new CreoleCentricException(
                            "HTTP " + response.code() + ": " + response.message(),
                            response.code(),
                            responseBody
                    );
                }

                return objectMapper.readValue(responseBody, TTSJob.class);
            }
        } catch (IOException e) {
            throw new CreoleCentricException("Network error: " + e.getMessage());
        }
    }

    public TTSJob waitForJob(String jobId, long timeoutMs, long pollIntervalMs) throws InterruptedException {
        long startTime = System.currentTimeMillis();

        while (System.currentTimeMillis() - startTime < timeoutMs) {
            TTSJob job = getJobStatus(jobId);

            if ("delivered".equals(job.getStatus()) ||
                "failed".equals(job.getStatus()) ||
                "cancelled".equals(job.getStatus())) {
                return job;
            }

            Thread.sleep(pollIntervalMs);
        }

        throw new CreoleCentricException("Job " + jobId + " did not complete within " + timeoutMs + "ms");
    }
}
