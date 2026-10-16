package app.nutritrack.pro;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ApkUpdaterPlugin.class);
        registerPlugin(SpeechInputPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
