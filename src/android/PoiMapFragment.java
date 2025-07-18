package __PACKAGE_NAME__;

import android.Manifest;
import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.poilabs.navigation.model.PoiNavigation;
import com.poilabs.navigation.model.PoiSdkConfig;
import com.poilabs.navigation.view.fragments.MapFragment;
import com.poilabs.poilabspositioning.model.PLPStatus;

import java.util.ArrayList;
import java.util.Arrays;
import android.util.Log;

public class PoiMapFragment extends Fragment {
    
    private static final String TAG = "PoiMapFragment";
    
    public static PoiMapFragment newInstance(String applicationId, String applicationSecret, String uniqueId,
            String language, String showOnMapStoreId, String getRouteStoreId) {
        
        PoiMapFragment poiMapFragment = new PoiMapFragment();

        Bundle args = new Bundle();
        args.putString("applicationId", applicationId);
        args.putString("applicationSecret", applicationSecret);
        args.putString("uniqueId", uniqueId);
        args.putString("language", language != null ? language : "en");
        args.putString("showOnMapStoreId", showOnMapStoreId);
        args.putString("getRouteStoreId", getRouteStoreId);
        poiMapFragment.setArguments(args);

        return poiMapFragment;
    }

    private String applicationId;
    private String applicationSecret;
    private String uniqueId;
    private String language = "en";
    private String showOnMapStoreId;
    private String getRouteStoreId;

    private boolean isStoresReady = false;

    private final BroadcastReceiver showOnMapReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            ArrayList<String> store_ids = intent.getStringArrayListExtra("store_ids");
            if (isStoresReady && store_ids != null && !store_ids.isEmpty()) {
                requireActivity().runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        PoiNavigation.getInstance().showPointsOnMap(store_ids);
                    }
                });
            }
        }
    };

    private final BroadcastReceiver navigateToStoreReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String storeId = intent.getStringExtra("store_id");
            if (isStoresReady && storeId != null && !storeId.isEmpty()) {
                requireActivity().runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        PoiNavigation.getInstance().navigateToStore(storeId);
                    }
                });
            }
        }
    };

    private final BroadcastReceiver restartMapReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            getRouteStoreId = null;
            showOnMapStoreId = null;
            isStoresReady = false;

            String language = intent.getStringExtra("language");
            if (language == null) {
                language = "en";
            }
            String finalLanguage = language;
            requireActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PoiNavigation.getInstance().clearResources();
                    startNavigation(finalLanguage);
                }
            });
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
            getRouteStoreId = getArguments().getString("getRouteStoreId");
            showOnMapStoreId = getArguments().getString("showOnMapStoreId");
            language = getArguments().getString("language", "en");

            if (applicationId == null || applicationSecret == null || uniqueId == null) {
                return;
            }
        } else {
            return;
        }

        askLocalPermission();

        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(showOnMapReceiver,
                new IntentFilter("show-on-map"));

        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(navigateToStoreReceiver,
                new IntentFilter("navigate-to-store"));

        LocalBroadcastManager.getInstance(requireContext()).registerReceiver(restartMapReceiver,
                new IntentFilter("restart-map"));
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void onDestroyView() {
        try {
            LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(showOnMapReceiver);
            LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(navigateToStoreReceiver);
            LocalBroadcastManager.getInstance(requireContext()).unregisterReceiver(restartMapReceiver);
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering receivers: " + e.getMessage());
        }
        super.onDestroyView();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
            @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (allGranted) {
                askLocalPermission(); // Check other permissions and start navigation
            }
        }
    }

    private void startNavigation(String language) {
        if (applicationId == null || applicationSecret == null || uniqueId == null) {
            return;
        }
        
        if (this.getContext() == null) {
            return;
        }
        
        try {
            PoiSdkConfig poiSdkConfig = new PoiSdkConfig(
                    applicationId,
                    applicationSecret,
                    uniqueId);
                    
            PoiNavigation.getInstance(
                    this.getContext(),
                    language,
                    poiSdkConfig).bind(new PoiNavigation.OnNavigationReady() {
                        @Override
                        public void onReady(MapFragment mapFragment) {
                            if (isAdded() && getChildFragmentManager() != null) {
                                getChildFragmentManager().beginTransaction()
                                        .replace(R.id.mapLayout, mapFragment)
                                        .commitAllowingStateLoss();
                            }
                        }

                        @Override
                        public void onStoresReady() {
                            isStoresReady = true;
                            if (isAdded() && getActivity() != null) {
                                requireActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (getRouteStoreId != null && !getRouteStoreId.isEmpty()) {
                                            PoiNavigation.getInstance().navigateToStore(getRouteStoreId);
                                        } else if (showOnMapStoreId != null && !showOnMapStoreId.isEmpty()) {
                                            PoiNavigation.getInstance().showPointsOnMap(Arrays.asList(showOnMapStoreId));
                                        }
                                    }
                                });
                            }
                        }

                        @Override
                        public void onError(Throwable throwable) {
                        }

                        @Override
                        public void onStatusChanged(PLPStatus plpStatus) {
                        }
                    });
        } catch (Exception e) {
            Log.e(TAG, "Exception in startNavigation: " + e.getMessage(), e);
        }
    }

    @TargetApi(Build.VERSION_CODES.M)
    private void askLocalPermission() {
        if (getActivity() == null) {
            return;
        }

        int hasLocationPermission = requireActivity().checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION);
        int hasCoarseLocationPermission = requireActivity().checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION);
        
        if (hasLocationPermission != PackageManager.PERMISSION_GRANTED || 
            hasCoarseLocationPermission != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { 
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION 
            }, 1);
        } else {
            if (language == null) {
                language = "en";
            }
            startNavigation(language);
        }
    }
}