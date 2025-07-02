package __PACKAGE_NAME__;

import android.content.Intent;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Promise;

import java.util.ArrayList;

public class PoiMapModule extends ReactContextBaseJavaModule {
    
    private static final String TAG = "PoiMapModule";
    
    PoiMapModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "PoiMapModule";
    }

    @ReactMethod
    public void restartMap(String language) {
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent("restart-map");
        intent.putExtra("language", language);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    @ReactMethod
    public void getRouteTo(String storeId) {
        ReactApplicationContext context = getReactApplicationContext();

        Intent intent = new Intent("navigate-to-store");
        intent.putExtra("store_id", storeId);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    @ReactMethod
    public void showPointOnMap(ReadableArray storeIds) {
        if (storeIds == null) {
            return;
        }
        
        ArrayList<String> storeIdList = new ArrayList<String>();
        for (int i = 0; i < storeIds.size(); i++) {
            String storeId = storeIds.getString(i);
            storeIdList.add(storeId);
        }
        
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent("show-on-map");
        intent.putStringArrayListExtra("store_ids", storeIdList);
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    // Keep these for plugin API compatibility
    @ReactMethod
    public void initNavigationSDK(String applicationId, String applicationSecret, String uniqueId, Promise promise) {
        try {
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", "Failed to initialize SDK: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getReadyForStoreMap(Promise promise) {
        try {
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("PREP_ERROR", "Failed to prepare store map: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void startPositioning(Promise promise) {
        try {
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("POSITIONING_ERROR", "Failed to start positioning: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopPositioning(Promise promise) {
        try {
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("POSITIONING_ERROR", "Failed to stop positioning: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void showSinglePointOnMap(String storeId, Promise promise) {
        try {
            ArrayList<String> storeIdList = new ArrayList<String>();
            storeIdList.add(storeId);

            ReactApplicationContext context = getReactApplicationContext();
            Intent intent = new Intent("show-on-map");
            intent.putStringArrayListExtra("store_ids", storeIdList);
            LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("SHOW_POINT_ERROR", "Failed to show point: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getRouteToWithPromise(String storeId, Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            Intent intent = new Intent("navigate-to-store");
            intent.putExtra("store_id", storeId);
            LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
            
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("ROUTE_ERROR", "Failed to get route: " + e.getMessage(), e);
        }
    }
}