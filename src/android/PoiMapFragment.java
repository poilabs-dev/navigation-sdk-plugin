package __PACKAGE_NAME__;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.poilabs.navigation.model.PoiNavigation;
import com.poilabs.navigation.model.PoiSdkConfig;
import com.poilabs.navigation.view.fragments.MapFragment;
import com.poilabs.poilabspositioning.model.PLPStatus;

import java.util.ArrayList;
import java.util.Arrays;

public class PoiMapFragment extends Fragment {
    private String applicationId;
    private String applicationSecret;
    private String uniqueId;
    private String language;
    private String showOnMapStoreId;
    private String getRouteStoreId;
    private boolean isStoresReady = false;
    private boolean hasStartedNavigation = false;

    private final BroadcastReceiver showOnMapReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            ArrayList<String> store_ids = intent.getStringArrayListExtra("store_ids");
            if (isStoresReady && store_ids != null && !store_ids.isEmpty()) {
                requireActivity().runOnUiThread(() -> {
                    PoiNavigation.getInstance().showPointsOnMap(store_ids);
                });
            }
        }
    };

    private final BroadcastReceiver navigateToStoreReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String storeId = intent.getStringExtra("store_id");
            if (isStoresReady && storeId != null && !storeId.isEmpty()) {
                requireActivity().runOnUiThread(() -> {
                    PoiNavigation.getInstance().navigateToStore(storeId);
                });
            }
        }
    };

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup parent, Bundle savedInstanceState) {
        super.onCreateView(inflater, parent, savedInstanceState);
        return inflater.inflate(R.layout.fragment_poi_map, parent, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        if (getArguments() != null) {
            applicationId = getArguments().getString("applicationId");
            applicationSecret = getArguments().getString("applicationSecret");
            uniqueId = getArguments().getString("uniqueId");
            language = getArguments().getString("language", "en");
            getRouteStoreId = getArguments().getString("getRouteStoreId");
            showOnMapStoreId = getArguments().getString("showOnMapStoreId");
        }

        // Register broadcast receivers
        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(
            showOnMapReceiver,
            new IntentFilter("show-on-map")
        );

        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(
            navigateToStoreReceiver,
            new IntentFilter("navigate-to-store")
        );
        
        // Try to start navigation if we have all required config
        tryStartNavigation();
    }

    private void tryStartNavigation() {
        if (applicationId != null && !applicationId.isEmpty() &&
            applicationSecret != null && !applicationSecret.isEmpty() &&
            uniqueId != null && !uniqueId.isEmpty() &&
            !hasStartedNavigation) {
            
            startNavigation(language != null ? language : "en");
            hasStartedNavigation = true;
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Any pause logic if needed
    }

    @Override
    public void onResume() {
        super.onResume();
        // Any resume logic if needed
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Any cleanup logic
    }

    @Override
    public void onDestroyView() {
        LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(showOnMapReceiver);
        LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(navigateToStoreReceiver);
        super.onDestroyView();
    }

    public static PoiMapFragment newInstance(String applicationId, String applicationSecret, String uniqueId,
                                        String language, String showOnMapStoreId, String getRouteStoreId) {
    PoiMapFragment poiMapFragment = new PoiMapFragment();

    Bundle args = new Bundle();
    args.putString("applicationId", applicationId);
    args.putString("applicationSecret", applicationSecret);
    args.putString("uniqueId", uniqueId);
    args.putString("language", language);
    args.putString("showOnMapStoreId", showOnMapStoreId);
    args.putString("getRouteStoreId", getRouteStoreId);
    poiMapFragment.setArguments(args);

    return poiMapFragment;
}

    private void startNavigation(String language) {
        try {
            PoiSdkConfig poiSdkConfig = new PoiSdkConfig(
                    applicationId,
                    applicationSecret,
                    uniqueId
            );
            
            PoiNavigation.getInstance(
                    this.getContext(),
                    language,
                    poiSdkConfig
            ).bind(new PoiNavigation.OnNavigationReady() {
                @Override
                public void onReady(MapFragment mapFragment) {
                    if (isAdded() && getChildFragmentManager() != null) {
                        getChildFragmentManager()
                            .beginTransaction()
                            .replace(R.id.mapLayout, mapFragment)
                            .commitAllowingStateLoss();
                    }
                }

                @Override
                public void onStoresReady() {
                    isStoresReady = true;
                    
                    if (isAdded() && getActivity() != null) {
                        requireActivity().runOnUiThread(() -> {
                            if (getRouteStoreId != null && !getRouteStoreId.isEmpty()) {
                                PoiNavigation.getInstance().navigateToStore(getRouteStoreId);
                            } else if (showOnMapStoreId != null && !showOnMapStoreId.isEmpty()) {
                                PoiNavigation.getInstance().showPointsOnMap(Arrays.asList(showOnMapStoreId));
                            }
                        });
                    }
                }
                
                @Override
                public void onError(Throwable throwable) {
                    if (isAdded() && getActivity() != null) {
                        requireActivity().runOnUiThread(() -> {
                            Toast.makeText(
                                getContext(),
                                "Navigation error: " + throwable.getMessage(),
                                Toast.LENGTH_LONG
                            ).show();
                        });
                    }
                }

                @Override
                public void onStatusChanged(PLPStatus plpStatus) {
                    // Handle status changes if needed
                }
            });
        } catch (Exception e) {
            if (isAdded() && getActivity() != null) {
                requireActivity().runOnUiThread(() -> {
                    Toast.makeText(
                        getContext(),
                        "Failed to start navigation: " + e.getMessage(),
                        Toast.LENGTH_LONG
                    ).show();
                });
            }
        }
    }
}