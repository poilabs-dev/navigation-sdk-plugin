import React, { useEffect, useRef } from "react";
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  Platform,
  View,
  NativeModules,
} from "react-native";

const { PoiMapModule } = NativeModules;

let NativeMap;

if (Platform.OS === "android") {
  try {
    NativeMap = requireNativeComponent("PoiMapViewManager");
  } catch (e) {
    console.warn("❌ Android component failed to load: PoiMapViewManager", e);
    NativeMap = View;
  }
} else if (Platform.OS === "ios") {
  try {
    NativeMap = requireNativeComponent("PoilabsNavigationMap");
  } catch (e) {
    console.warn("❌ iOS component failed to load: PoilabsNavigationMap", e);
    NativeMap = View;
  }
} else {
  console.warn("❌ Unsupported platform:", Platform.OS);
  NativeMap = View;
}

const PoiMapView = ({
  applicationId,
  applicationSecret,
  uniqueId,
  language = "en",
  showOnMap,
  getRouteTo,
  style,
  ...rest
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (applicationId && applicationSecret && uniqueId) {
      PoiMapModule.initNavigationSDK(
        applicationId,
        applicationSecret,
        uniqueId
      ).catch((err) => console.error("Failed to initialize SDK:", err));
    }

    if (
      Platform.OS === "android" &&
      UIManager.getViewManagerConfig &&
      UIManager.getViewManagerConfig("PoiMapViewManager")
    ) {
      const id = findNodeHandle(ref.current);
      if (id) {
        UIManager.dispatchViewManagerCommand(
          id,
          UIManager.getViewManagerConfig(
            "PoiMapViewManager"
          ).Commands.create.toString(),
          [id]
        );
      }
    }

    // Cleanup
    return () => {
      // Any cleanup needed when component unmounts
    };
  }, [applicationId, applicationSecret, uniqueId]);

  return (
    <NativeMap
      ref={ref}
      applicationId={applicationId}
      applicationSecret={applicationSecret}
      uniqueId={uniqueId}
      language={language}
      showOnMap={showOnMap}
      getRouteTo={getRouteTo}
      style={[{ flex: 1 }, style]}
      {...rest}
    />
  );
};

export default PoiMapView;
