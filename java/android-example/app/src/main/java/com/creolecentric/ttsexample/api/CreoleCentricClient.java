package com.creolecentric.ttsexample.api;

import android.util.Log;

import com.creolecentric.ttsexample.models.CreditBalance;
import com.creolecentric.ttsexample.models.TTSJob;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class CreoleCentricClient {
    private static final String TAG = "CreoleCentricClient";
    private final CreoleCentricService service;

    public interface ApiCallback<T> {
        void onSuccess(T result);
        void onError(String error);
    }

    public CreoleCentricClient(String apiKey, String baseUrl) {
        // Create logging interceptor
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        // Create OkHttp client with auth header
        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    Request original = chain.request();
                    Request request = original.newBuilder()
                            .header("Authorization", "ApiKey " + apiKey)
                            .header("Content-Type", "application/json")
                            .method(original.method(), original.body())
                            .build();
                    return chain.proceed(request);
                })
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();

        // Create Retrofit instance
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl.endsWith("/") ? baseUrl : baseUrl + "/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        service = retrofit.create(CreoleCentricService.class);
    }

    public void getCreditBalance(ApiCallback<CreditBalance> callback) {
        service.getCreditBalance().enqueue(new Callback<CreditBalance>() {
            @Override
            public void onResponse(Call<CreditBalance> call, Response<CreditBalance> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }

            @Override
            public void onFailure(Call<CreditBalance> call, Throwable t) {
                Log.e(TAG, "Error getting credit balance", t);
                callback.onError(t.getMessage());
            }
        });
    }

    public void createTTSJob(String text, String voiceId, String modelId, ApiCallback<TTSJob> callback) {
        Map<String, Object> request = new HashMap<>();
        request.put("text", text);
        request.put("voice_id", voiceId);
        request.put("model_id", modelId);

        service.createTTSJob(request).enqueue(new Callback<TTSJob>() {
            @Override
            public void onResponse(Call<TTSJob> call, Response<TTSJob> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }

            @Override
            public void onFailure(Call<TTSJob> call, Throwable t) {
                Log.e(TAG, "Error creating TTS job", t);
                callback.onError(t.getMessage());
            }
        });
    }

    public void getJobStatus(String jobId, ApiCallback<TTSJob> callback) {
        service.getJobStatus(jobId).enqueue(new Callback<TTSJob>() {
            @Override
            public void onResponse(Call<TTSJob> call, Response<TTSJob> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }

            @Override
            public void onFailure(Call<TTSJob> call, Throwable t) {
                Log.e(TAG, "Error getting job status", t);
                callback.onError(t.getMessage());
            }
        });
    }

    public void getVoices(ApiCallback<Map<String, Object>> callback) {
        service.getVoices().enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                Log.e(TAG, "Error getting voices", t);
                callback.onError(t.getMessage());
            }
        });
    }

    public void getModels(ApiCallback<Map<String, Object>> callback) {
        service.getModels().enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSuccess(response.body());
                } else {
                    callback.onError("HTTP " + response.code() + ": " + response.message());
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                Log.e(TAG, "Error getting models", t);
                callback.onError(t.getMessage());
            }
        });
    }
}
