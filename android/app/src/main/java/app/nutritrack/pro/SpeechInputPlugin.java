package app.nutritrack.pro;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.speech.RecognizerIntent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.util.ArrayList;

@CapacitorPlugin(name = "SpeechInput", permissions = {
    @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class SpeechInputPlugin extends Plugin {
    @PluginMethod public void start(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "speechPermission");
        } else recognize(call);
    }
    @PermissionCallback private void speechPermission(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) recognize(call);
        else call.reject("Consenti il microfono nelle impostazioni Android di NutriTrack.");
    }
    private void recognize(PluginCall call) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "it-IT");
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Cosa hai mangiato?");
        try { startActivityForResult(call, intent, "speechResult"); }
        catch (Exception error) { call.reject("Dettatura non disponibile: verifica il servizio vocale nelle impostazioni del telefono.", error); }
    }
    @ActivityCallback private void speechResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) { call.reject("Dettatura annullata", "CANCELLED"); return; }
        ArrayList<String> texts = result.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        if (texts == null || texts.isEmpty()) { call.reject("Nessuna voce riconosciuta"); return; }
        JSObject output = new JSObject(); output.put("text", texts.get(0)); call.resolve(output);
    }
}
