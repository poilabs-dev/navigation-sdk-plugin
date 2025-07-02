package __PACKAGE_NAME__;

import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;
import android.util.Log;

public class PoiMapViewManager extends ViewGroupManager<FrameLayout> {

    public static final String REACT_CLASS = "PoiMapViewManager";
    public final int COMMAND_CREATE = 1;
    private String applicationId;
    private String applicationSecret;
    private String uniqueId;
    private String language = "en";
    private String showOnMapStoreId;
    private String getRouteStoreId;
    private boolean shouldCreateFragment = false;
    private FrameLayout currentView = null;

    ReactApplicationContext reactContext;

    public PoiMapViewManager(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    /**
     * Return a FrameLayout which will later hold the Fragment
     */
    @Override
    public FrameLayout createViewInstance(ThemedReactContext reactContext) {
        FrameLayout frameLayout = new FrameLayout(reactContext);
        this.currentView = frameLayout;
        return frameLayout;
    }

    /**
     * Map the "create" command to an integer
     */
    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("create", COMMAND_CREATE);
    }

    /**
     * Handle "create" command (called from JS) and call createFragment method
     */
    @Override
    public void receiveCommand(
            @NonNull FrameLayout root,
            String commandId,
            @Nullable ReadableArray args) {

        super.receiveCommand(root, commandId, args);

        try {
            int commandIdInt = Integer.parseInt(commandId);
            switch (commandIdInt) {
                case COMMAND_CREATE:
            
                    if (args != null && args.size() > 0) {
                        int reactNativeViewId = args.getInt(0);
                        
                        createFragment(root, reactNativeViewId);
                    }
                    break;
                default:
                    Log.w("PoiMapViewManager", "Unknown command: " + commandIdInt);
            }
        } catch (NumberFormatException e) {
            Log.e("PoiMapViewManager", "Failed to parse commandId: " + commandId, e);
        } catch (Exception e) {
            Log.e("PoiMapViewManager", "Error in receiveCommand: " + e.getMessage(), e);
        }
    }

    @ReactProp(name = "applicationId")
    public void setApplicationId(FrameLayout view, String value) {
        this.applicationId = value;
        checkAndCreateFragment();
    }

    @ReactProp(name = "applicationSecret")
    public void setApplicationSecret(FrameLayout view, String value) {
        this.applicationSecret = value;
        checkAndCreateFragment();
    }

    @ReactProp(name = "uniqueId")
    public void setUniqueId(FrameLayout view, String value) {
        this.uniqueId = value;
        checkAndCreateFragment();
    }

    @ReactProp(name = "language")
    public void setLanguage(FrameLayout view, String value) {
        this.language = value != null ? value : "en";
    }

    @ReactProp(name = "showOnMap")
    public void setShowOnMap(FrameLayout view, String value) {
        this.showOnMapStoreId = value;
    }

    @ReactProp(name = "getRouteTo")
    public void setGetRouteTo(FrameLayout view, String value) {
        this.getRouteStoreId = value;
    }

    private void checkAndCreateFragment() {
        if (applicationId != null && applicationSecret != null && uniqueId != null && 
            currentView != null && !shouldCreateFragment) {
            shouldCreateFragment = true;
            
            currentView.post(new Runnable() {
                @Override
                public void run() {
                    createFragmentDirect(currentView);
                }
            });
        }
    }

    /**
     * Create fragment directly when props are ready
     */
    private void createFragmentDirect(FrameLayout root) {
        if (applicationId == null || applicationSecret == null || uniqueId == null) {
            return;
        }

        FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
        if (activity == null || activity.isFinishing()) {
            return;
        }

        final PoiMapFragment poiMapFragment = PoiMapFragment.newInstance(
            applicationId, 
            applicationSecret, 
            uniqueId, 
            language, 
            showOnMapStoreId, 
            getRouteStoreId
        );
        
        int viewId = root.getId();
        if (viewId == View.NO_ID) {
            viewId = View.generateViewId();
            root.setId(viewId);
        }
        
        activity.getSupportFragmentManager()
                .beginTransaction()
                .replace(viewId, poiMapFragment, "poi_map_fragment")
                .commitAllowingStateLoss();
                
        setupLayout(root);
    }

    /**
     * Original createFragment method (fallback)
     */
    public void createFragment(FrameLayout root, int reactNativeViewId) {

        ViewGroup parentView = (ViewGroup) root.findViewById(reactNativeViewId);
        if (parentView == null) {
            parentView = root;
        }
        setupLayout(parentView);

        // Validate required props
        if (applicationId == null || applicationSecret == null || uniqueId == null) {
            return;
        }

        final PoiMapFragment poiMapFragment = PoiMapFragment.newInstance(
            applicationId, 
            applicationSecret, 
            uniqueId, 
            language, 
            showOnMapStoreId, 
            getRouteStoreId
        );

        FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
        if (activity != null && !activity.isFinishing()) {
            activity.getSupportFragmentManager()
                    .beginTransaction()
                    .replace(reactNativeViewId, poiMapFragment, String.valueOf(reactNativeViewId))
                    .commitAllowingStateLoss();
        }
    }

    public void setupLayout(ViewGroup view) {
        if (view == null) {
            return;
        }

        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren(view);
                view.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    /**
     * Layout all children properly
     */
    public void manuallyLayoutChildren(ViewGroup view) {
        for (int i = 0; i < view.getChildCount(); i++) {
            View child = view.getChildAt(i);
            child.measure(View.MeasureSpec.makeMeasureSpec(view.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(view.getMeasuredHeight(), View.MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }
}