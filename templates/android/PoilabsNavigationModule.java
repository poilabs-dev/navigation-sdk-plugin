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

public class PoilabsNavigationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "PoilabsNavigation";
    private final ReactApplicationContext reactContext;

    public PoilabsNavigationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "PoilabsNavigationModule";
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
            
            // Default to English if not specified
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
            // This is a wrapper, as the actual implementation happens in the Fragment
            // We're just resolving the promise to maintain API consistency
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error preparing Poilabs Navigation SDK", e);
            promise.reject("PREP_ERROR", "Failed to prepare Poilabs Navigation: " + e.getMessage(), e);
        }
    }
}