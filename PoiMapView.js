import React, { useEffect, useRef } from "react";
import {
  Platform,
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  NativeModules,
} from "react-native";

// Import appropriate native component based on platform
const MapViewNative = Platform.select({
  ios: requireNativeComponent("PoilabsNavigationMap"),
  android: requireNativeComponent("PoiMapViewManager"),
});

// For Android, we need to create fragments
const createFragment = (viewId) => {
  if (Platform.OS === "android") {
    UIManager.dispatchViewManagerCommand(
      viewId,
      UIManager.PoiMapViewManager.Commands.create.toString(),
      [viewId]
    );
  }
};

/**
 * PoiMapView component for indoor navigation
 * @param {Object} props
 * @param {string} props.language - Language for map UI ('en' or 'tr')
 * @param {string} props.showOnMap - Store ID to show on map
 * @param {string} props.getRouteTo - Store ID to navigate to
 * @param {Object} props.style - Style for map container
 */
export const PoiMapView = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    if (Platform.OS === "android") {
      const viewId = findNodeHandle(ref.current);
      createFragment(viewId);
    }
  }, []);

  return (
    <MapViewNative
      {...props}
      ref={ref}
      language={props.language || "en"}
      showOnMap={props.showOnMap}
      getRouteTo={props.getRouteTo}
      style={[{ flex: 1 }, props.style]}
    />
  );
};

/**
 * Show point of interest on map
 * @param {string|string[]} storeIds - Single store ID or array of store IDs to show
 */
export const showPointOnMap = (storeIds) => {
  const { PoilabsNavigationBridge, PoiMapModule } = NativeModules;

  if (Platform.OS === "ios") {
    if (Array.isArray(storeIds)) {
      // iOS implementation only accepts a single ID
      PoilabsNavigationBridge.showPointOnMap(storeIds[0]);
    } else {
      PoilabsNavigationBridge.showPointOnMap(storeIds);
    }
  } else {
    // Android implementation expects an array
    PoiMapModule.showPointOnMap(
      Array.isArray(storeIds) ? storeIds : [storeIds]
    );
  }
};

/**
 * Get route to a specific store
 * @param {string} storeId - Store ID to navigate to
 */
export const getRouteTo = (storeId) => {
  const { PoilabsNavigationBridge, PoiMapModule } = NativeModules;

  if (Platform.OS === "ios") {
    PoilabsNavigationBridge.getRouteTo(storeId);
  } else {
    PoiMapModule.getRouteTo(storeId);
  }
};

export default PoiMapView;
