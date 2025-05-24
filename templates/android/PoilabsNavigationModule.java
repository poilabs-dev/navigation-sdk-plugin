package __PACKAGE_NAME__;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.poilabs.navigation.model.PoiNavigation;
import com.poilabs.navigation.model.PoiSdkConfig;

public class PoiMapModule extends ReactContextBaseJavaModule {
    private static final String TAG = "PoilabsNavigation";
    private final ReactApplicationContext reactContext;

    public PoiMapModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "PoiMapModule";
    }

    @ReactMethod
    public void initWithAppId(String applicationId, String applicationSecret, String uniqueId, Promise promise) {
        try {
            PoiSdkConfig poiSdkConfig = new PoiSdkConfig(
                    applicationId, 
                    applicationSecret, 
                    uniqueId
            );
            
            Context context = reactContext.getApplicationContext();
            
            PoiNavigation.getInstance(context, "en", poiSdkConfig);
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Poilabs Navigation SDK", e);
            promise.reject("INIT_ERROR", "Failed to initialize Poilabs Navigation: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getReadyForStoreMap(Promise promise) {
        try {
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error preparing Poilabs Navigation SDK", e);
            promise.reject("PREP_ERROR", "Failed to prepare Poilabs Navigation: " + e.getMessage(), e);
        }
    }
}