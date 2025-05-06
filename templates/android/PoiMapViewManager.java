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

public class PoiMapViewManager extends ViewGroupManager<FrameLayout> {
    public static final String REACT_CLASS = "PoiMapViewManager";
    private static final int COMMAND_CREATE = 1;

    private String language;
    private String showOnMapStoreId;
    private String getRouteStoreId;
    private final ReactApplicationContext reactContext;

    public PoiMapViewManager(ReactApplicationContext context) {
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected FrameLayout createViewInstance(ThemedReactContext reactContext) {
        return new FrameLayout(reactContext);
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("create", COMMAND_CREATE);
    }

    @Override
    public void receiveCommand(
        @NonNull FrameLayout root,
        String commandId,
        @Nullable ReadableArray args
    ) {
        int viewId = args.getInt(0);
        int cmd = Integer.parseInt(commandId);
        if (cmd == COMMAND_CREATE) {
            createFragment(root, viewId);
        }
    }

    @ReactProp(name = "language")
    public void setLanguage(FrameLayout view, String lang) {
        this.language = lang;
    }

    @ReactProp(name = "showOnMap")
    public void setShowOnMap(FrameLayout view, String storeId) {
        this.showOnMapStoreId = storeId;
    }

    @ReactProp(name = "getRouteTo")
    public void setGetRouteTo(FrameLayout view, String storeId) {
        this.getRouteStoreId = storeId;
    }

    private void createFragment(FrameLayout root, int reactViewId) {
        ViewGroup parent = (ViewGroup) root.findViewById(reactViewId);
        // continuously layout children so fragment fills the view
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                for (int i = 0; i < parent.getChildCount(); i++) {
                    View c = parent.getChildAt(i);
                    c.measure(
                      View.MeasureSpec.makeMeasureSpec(parent.getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                      View.MeasureSpec.makeMeasureSpec(parent.getMeasuredHeight(), View.MeasureSpec.EXACTLY)
                    );
                    c.layout(0, 0, c.getMeasuredWidth(), c.getMeasuredHeight());
                }
                parent.getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });

        // create & mount the navigation fragment
        PoiMapFragment fragment = PoiMapFragment.newInstance(
          language, showOnMapStoreId, getRouteStoreId
        );
        FragmentActivity activity = (FragmentActivity) reactContext.getCurrentActivity();
        activity.getSupportFragmentManager()
                .beginTransaction()
                .replace(reactViewId, fragment, String.valueOf(reactViewId))
                .commit();
    }
}
