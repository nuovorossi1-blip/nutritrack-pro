package app.nutritrack.pro;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.ArrayList;

@CapacitorPlugin(name = "SpeechInput", permissions = {
    @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class SpeechInputPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());
    private SpeechRecognizer recognizer;
    private PluginCall pending;
    private boolean listening;
    private boolean stopped;
    private String latest = "";
    private Runnable deadline;

    @PluginMethod public void getCapabilities(PluginCall call) {
        main.post(() -> {
            JSObject result = new JSObject();
            result.put("inline", true);
            result.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
            call.resolve(result);
        });
    }

    @PluginMethod public void start(PluginCall call) {
        main.post(() -> {
            if (pending != null) { call.reject("Dettatura gia in corso"); return; }
            pending = call;
            stopped = false;
            latest = "";
            if (getPermissionState("microphone") != PermissionState.GRANTED) {
                requestPermissionForAlias("microphone", call, "speechPermission");
            } else recognize(call);
        });
    }

    @PermissionCallback private void speechPermission(PluginCall call) {
        main.post(() -> {
            if (pending != call) return;
            if (getPermissionState("microphone") == PermissionState.GRANTED) recognize(call);
            else finish(null, "Consenti il microfono nelle impostazioni Android di NutriTrack.", "PERMISSION_DENIED");
        });
    }

    private void recognize(PluginCall call) {
        if (pending != call) return;
        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            finish(null, "Dettatura non disponibile: attiva il servizio vocale del telefono.", "UNAVAILABLE");
            return;
        }
        try {
            recognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
            recognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle params) {
                    if (pending != call) return;
                    listening = true;
                    emitState(true);
                }
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float rmsdB) {}
                @Override public void onBufferReceived(byte[] buffer) {}
                @Override public void onEndOfSpeech() {
                    if (pending != call) return;
                    listening = false;
                    emitState(false);
                    awaitResult(call, 6000);
                }
                @Override public void onError(int error) {
                    if (pending != call) return;
                    if (stopped) { finish(latest, null, null); return; }
                    String message = error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS
                        ? "Consenti il microfono nelle impostazioni Android di NutriTrack."
                        : error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT
                        ? "Non ho sentito niente: riprova."
                        : "Dettatura interrotta: controlla connessione e servizio vocale, poi riprova.";
                    finish(null, message, "RECOGNITION_ERROR");
                }
                @Override public void onResults(Bundle results) {
                    if (pending != call) return;
                    readText(results);
                    finish(latest, null, null);
                }
                @Override public void onPartialResults(Bundle results) {
                    if (pending == call && !stopped) readText(results);
                }
                @Override public void onEvent(int eventType, Bundle params) {}
            });
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "it-IT");
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            recognizer.startListening(intent);
            awaitResult(call, 120000);
        } catch (Exception error) {
            finish(null, "Impossibile avviare il microfono: verifica il servizio vocale.", "UNAVAILABLE");
        }
    }

    private void readText(Bundle results) {
        ArrayList<String> texts = results == null ? null : results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (texts == null || texts.isEmpty() || texts.get(0).trim().isEmpty()) return;
        latest = texts.get(0);
        JSObject event = new JSObject(); event.put("text", latest);
        notifyListeners("text", event);
    }

    @PluginMethod public void stop(PluginCall call) {
        main.post(() -> {
            stopped = true;
            emitState(false);
            if (pending != null) {
                if (recognizer != null && listening) {
                    listening = false;
                    try { recognizer.stopListening(); awaitResult(pending, 2500); }
                    catch (Exception ignored) { finish(latest, null, null); }
                } else finish(latest, null, null);
            }
            call.resolve();
        });
    }

    @PluginMethod public void cancel(PluginCall call) {
        main.post(() -> { finish(null, "Dettatura annullata", "CANCELLED"); call.resolve(); });
    }

    private void awaitResult(PluginCall call, long milliseconds) {
        if (deadline != null) main.removeCallbacks(deadline);
        deadline = () -> { if (pending == call) finish(latest, null, null); };
        main.postDelayed(deadline, milliseconds);
    }

    private void emitState(boolean active) {
        JSObject event = new JSObject(); event.put("listening", active);
        notifyListeners("state", event);
    }

    private void finish(String text, String error, String code) {
        PluginCall call = pending;
        pending = null;
        listening = false;
        if (deadline != null) { main.removeCallbacks(deadline); deadline = null; }
        if (recognizer != null) {
            SpeechRecognizer previous = recognizer;
            recognizer = null;
            previous.cancel();
            previous.destroy();
        }
        emitState(false);
        if (call == null) return;
        if (error != null) call.reject(error, code);
        else { JSObject result = new JSObject(); result.put("text", text == null ? "" : text); call.resolve(result); }
    }

    @Override protected void handleOnPause() {
        main.post(() -> { if (recognizer != null) finish(null, "Dettatura annullata", "CANCELLED"); });
    }

    @Override protected void handleOnDestroy() {
        main.post(() -> finish(null, "Dettatura annullata", "CANCELLED"));
    }
}
