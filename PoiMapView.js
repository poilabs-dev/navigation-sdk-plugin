import React, { useEffect, useRef } from "react";
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  Platform,
  View,
  Alert,
} from "react-native";

let NativeMap;

if (Platform.OS === "android") {
  try {
    NativeMap = requireNativeComponent("PoiMapViewManager");
  } catch (e) {
    console.warn("❌ Android bileşeni yüklenemedi: PoiMapViewManager", e);
    NativeMap = View;
  }
} else if (Platform.OS === "ios") {
  try {
    NativeMap = requireNativeComponent("PoilabsNavigationMap");
  } catch (e) {
    console.warn("❌ iOS bileşeni yüklenemedi: PoilabsNavigationMap", e);
    NativeMap = View;
  }
} else {
  console.warn("❌ Desteklenmeyen platform:", Platform.OS);
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
    if (
      Platform.OS === "android" &&
      UIManager.getViewManagerConfig("PoiMapViewManager")
    ) {
      const id = findNodeHandle(ref.current);
      UIManager.dispatchViewManagerCommand(
        id,
        // @ts-ignore
        UIManager.PoiMapViewManager.Commands.create.toString(),
        [id]
      );
    }
  }, []);

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
