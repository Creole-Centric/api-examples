package com.creolecentric.ttsexample.api;

import com.creolecentric.ttsexample.models.CreditBalance;
import com.creolecentric.ttsexample.models.TTSJob;
import com.creolecentric.ttsexample.models.Voice;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface CreoleCentricService {

    @GET("health/")
    Call<Map<String, Object>> checkHealth();

    @GET("credits/balance/")
    Call<CreditBalance> getCreditBalance();

    @GET("tts/voices/")
    Call<Map<String, Object>> getVoices();

    @GET("tts/models/")
    Call<Map<String, Object>> getModels();

    @POST("tts/jobs/")
    Call<TTSJob> createTTSJob(@Body Map<String, Object> request);

    @GET("tts/jobs/{jobId}/status/")
    Call<TTSJob> getJobStatus(@Path("jobId") String jobId);

    @GET("tts/jobs/list/")
    Call<Map<String, Object>> listJobs(
        @Query("limit") int limit,
        @Query("offset") int offset
    );

    @POST("tts/jobs/{jobId}/cancel/")
    Call<Map<String, Object>> cancelJob(@Path("jobId") String jobId);
}
