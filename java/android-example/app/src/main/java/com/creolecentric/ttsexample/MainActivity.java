package com.creolecentric.ttsexample;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.creolecentric.ttsexample.api.CreoleCentricClient;
import com.creolecentric.ttsexample.models.CreditBalance;
import com.creolecentric.ttsexample.models.TTSJob;
import com.creolecentric.ttsexample.utils.AudioPlayer;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private static final String DEFAULT_VOICE_ID = "i4mRPwKM2yHwXhbmkN514"; // Xavier Bruneau
    private static final String DEFAULT_MODEL_ID = "ccl_ht_v100";

    private CreoleCentricClient apiClient;
    private AudioPlayer audioPlayer;
    private Handler pollHandler;

    private EditText editTextInput;
    private Button buttonGenerate;
    private Button buttonPlay;
    private ProgressBar progressBar;
    private TextView textViewStatus;
    private TextView textViewCredits;

    private TTSJob currentJob;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize views
        editTextInput = findViewById(R.id.editTextInput);
        buttonGenerate = findViewById(R.id.buttonGenerate);
        buttonPlay = findViewById(R.id.buttonPlay);
        progressBar = findViewById(R.id.progressBar);
        textViewStatus = findViewById(R.id.textViewStatus);
        textViewCredits = findViewById(R.id.textViewCredits);

        // Initialize API client
        String apiKey = getString(R.string.creolecentric_api_key);
        String apiUrl = getString(R.string.creolecentric_api_url);
        apiClient = new CreoleCentricClient(apiKey, apiUrl);

        // Initialize audio player
        audioPlayer = new AudioPlayer();
        pollHandler = new Handler(Looper.getMainLooper());

        // Set up button listeners
        buttonGenerate.setOnClickListener(v -> generateSpeech());
        buttonPlay.setOnClickListener(v -> playAudio());

        // Load credit balance
        loadCreditBalance();
    }

    private void loadCreditBalance() {
        apiClient.getCreditBalance(new CreoleCentricClient.ApiCallback<CreditBalance>() {
            @Override
            public void onSuccess(CreditBalance balance) {
                String text = String.format("Credits: %,d", balance.getTotalCredits());
                textViewCredits.setText(text);
            }

            @Override
            public void onError(String error) {
                Log.e(TAG, "Error loading credits: " + error);
            }
        });
    }

    private void generateSpeech() {
        String text = editTextInput.getText().toString().trim();

        if (text.isEmpty()) {
            Toast.makeText(this, "Please enter text", Toast.LENGTH_SHORT).show();
            return;
        }

        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        buttonGenerate.setEnabled(false);
        buttonPlay.setEnabled(false);
        textViewStatus.setText("Creating TTS job...");

        apiClient.createTTSJob(text, DEFAULT_VOICE_ID, DEFAULT_MODEL_ID,
            new CreoleCentricClient.ApiCallback<TTSJob>() {
                @Override
                public void onSuccess(TTSJob job) {
                    currentJob = job;
                    textViewStatus.setText("Job created: " + job.getId());
                    Log.d(TAG, "Job created: " + job.getId());

                    // Start polling for job completion
                    pollJobStatus(job.getId());
                }

                @Override
                public void onError(String error) {
                    progressBar.setVisibility(View.GONE);
                    buttonGenerate.setEnabled(true);
                    textViewStatus.setText("Error: " + error);
                    Toast.makeText(MainActivity.this, "Error: " + error, Toast.LENGTH_LONG).show();
                }
            });
    }

    private void pollJobStatus(String jobId) {
        apiClient.getJobStatus(jobId, new CreoleCentricClient.ApiCallback<TTSJob>() {
            @Override
            public void onSuccess(TTSJob job) {
                currentJob = job;
                String status = job.getStatus();
                textViewStatus.setText("Status: " + status);

                if ("delivered".equals(status) || "completed".equals(status)) {
                    // Job completed successfully
                    progressBar.setVisibility(View.GONE);
                    buttonGenerate.setEnabled(true);

                    if (job.getAudioUrl() != null && !job.getAudioUrl().isEmpty()) {
                        buttonPlay.setEnabled(true);
                        textViewStatus.setText("Audio ready! Tap Play to listen.");

                        // Update credits
                        loadCreditBalance();
                    }

                } else if ("failed".equals(status) || "cancelled".equals(status)) {
                    // Job failed
                    progressBar.setVisibility(View.GONE);
                    buttonGenerate.setEnabled(true);
                    String errorMsg = job.getErrorMessage() != null ? job.getErrorMessage() : "Job failed";
                    textViewStatus.setText("Error: " + errorMsg);
                    Toast.makeText(MainActivity.this, errorMsg, Toast.LENGTH_LONG).show();

                } else {
                    // Still processing, poll again
                    pollHandler.postDelayed(() -> pollJobStatus(jobId), 2000);
                }
            }

            @Override
            public void onError(String error) {
                progressBar.setVisibility(View.GONE);
                buttonGenerate.setEnabled(true);
                textViewStatus.setText("Error checking status: " + error);
                Toast.makeText(MainActivity.this, "Error: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void playAudio() {
        if (currentJob == null || currentJob.getAudioUrl() == null) {
            Toast.makeText(this, "No audio available", Toast.LENGTH_SHORT).show();
            return;
        }

        if (audioPlayer.isPlaying()) {
            audioPlayer.pause();
            buttonPlay.setText("Play");
        } else {
            buttonPlay.setText("Playing...");
            audioPlayer.playFromUrl(currentJob.getAudioUrl(), new AudioPlayer.Callback() {
                @Override
                public void onPrepared() {
                    Log.d(TAG, "Audio playback started");
                    runOnUiThread(() -> buttonPlay.setText("Pause"));
                }

                @Override
                public void onError(String error) {
                    Log.e(TAG, "Audio playback error: " + error);
                    runOnUiThread(() -> {
                        buttonPlay.setText("Play");
                        Toast.makeText(MainActivity.this, "Playback error: " + error, Toast.LENGTH_LONG).show();
                    });
                }
            });
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (audioPlayer != null) {
            audioPlayer.release();
        }
        if (pollHandler != null) {
            pollHandler.removeCallbacksAndMessages(null);
        }
    }
}
