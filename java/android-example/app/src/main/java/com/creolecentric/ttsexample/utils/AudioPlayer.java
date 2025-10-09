package com.creolecentric.ttsexample.utils;

import android.media.MediaPlayer;
import android.util.Log;

import java.io.IOException;

public class AudioPlayer {
    private static final String TAG = "AudioPlayer";
    private MediaPlayer mediaPlayer;

    public interface Callback {
        void onPrepared();
        void onError(String error);
    }

    public void playFromUrl(String url, Callback callback) {
        release(); // Release any existing player

        mediaPlayer = new MediaPlayer();

        try {
            mediaPlayer.setDataSource(url);
            mediaPlayer.setOnPreparedListener(mp -> {
                mp.start();
                if (callback != null) {
                    callback.onPrepared();
                }
            });

            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                String error = "MediaPlayer error: what=" + what + ", extra=" + extra;
                Log.e(TAG, error);
                if (callback != null) {
                    callback.onError(error);
                }
                return true;
            });

            mediaPlayer.setOnCompletionListener(mp -> {
                Log.d(TAG, "Playback completed");
            });

            mediaPlayer.prepareAsync();

        } catch (IOException e) {
            Log.e(TAG, "Error setting data source", e);
            if (callback != null) {
                callback.onError(e.getMessage());
            }
        }
    }

    public void pause() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            mediaPlayer.pause();
        }
    }

    public void resume() {
        if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
            mediaPlayer.start();
        }
    }

    public void stop() {
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
            }
        }
    }

    public void release() {
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }

    public boolean isPlaying() {
        return mediaPlayer != null && mediaPlayer.isPlaying();
    }
}
