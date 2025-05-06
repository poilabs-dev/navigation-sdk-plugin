package __PACKAGE_NAME__;

import android.content.Intent;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.util.ArrayList;

public class PoiMapModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public PoiMapModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        // this is how JS will refer to it: NativeModules.PoiMapModule
        return "PoiMapModule";
    }

    @ReactMethod
    public void showPointOnMap(ReadableArray storeIds) {
        ArrayList<String> list = new ArrayList<>();
        for (int i = 0; i < storeIds.size(); i++) {
            list.add(storeIds.getString(i));
        }
        Intent intent = new Intent("show-on-map");
        intent.putStringArrayListExtra("store_ids", list);
        LocalBroadcastManager.getInstance(reactContext).sendBroadcast(intent);
    }

    @ReactMethod
    public void getRouteTo(String storeId) {
        Intent intent = new Intent("navigate-to-store");
        intent.putExtra("store_id", storeId);
        LocalBroadcastManager.getInstance(reactContext).sendBroadcast(intent);
    }
}
