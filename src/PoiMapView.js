import React, { useEffect, useRef } from "react";
import {
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
  UIManager,
  View,
} from "react-native";

const ModuleName =
  Platform.OS === "ios" ? "PoilabsNavigationBridge" : "PoiMapModule";
const NativeModule = NativeModules[ModuleName];

let NativeMap;

if (Platform.OS === "android") {
  try {
    NativeMap = requireNativeComponent("PoiMapViewManager");
  } catch (e) {
    NativeMap = View;
  }
} else if (Platform.OS === "ios") {
  try {
    NativeMap = requireNativeComponent("PoilabsNavigationMap");
  } catch (e) {
    NativeMap = View;
  }
} else {
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
  const initializedRef = useRef(false);
  const fragmentCreatedRef = useRef(false);

  useEffect(() => {
    if (
      applicationId &&
      applicationSecret &&
      uniqueId &&
      !initializedRef.current
    ) {
      console.log("Initializing SDK with props");
      initializeSDK();
      initializedRef.current = true;
    }
  }, [applicationId, applicationSecret, uniqueId]);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.getViewManagerConfig && !fragmentCreatedRef.current) {
      const viewManagerConfig =
        UIManager.getViewManagerConfig("PoiMapViewManager");

      if (viewManagerConfig && ref.current) {
        const id = findNodeHandle(ref.current);
        
        if (id && viewManagerConfig.Commands?.create) {
          setTimeout(() => {
            UIManager.dispatchViewManagerCommand(
              id,
              viewManagerConfig.Commands.create.toString(),
              [id]
            );
            fragmentCreatedRef.current = true;
          }, 500);
        }
      }
    }
  }, [applicationId, applicationSecret, uniqueId]);

  const initializeSDK = async () => {
    if (!NativeModule) {
      console.warn("Native module not available");
      return;
    }

    try {
      if (Platform.OS === "ios") {
        await NativeModule.initNavigationSDK(
          applicationId,
          applicationSecret,
          uniqueId
        );
      }
    } catch (error) {
      console.error("❌ Failed to initialize SDK:", error);
    }
  };

  if (NativeMap === View) {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      >
        <View
          style={{
            padding: 20,
            backgroundColor: "#fff",
            borderRadius: 8,
            margin: 20,
          }}
        >
          <View style={{ marginBottom: 10 }}>
            <View style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
              ⚠️ Navigation SDK Not Available
            </View>
          </View>
          <View style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
            The native navigation component could not be loaded. Please ensure
            the SDK is properly installed.
          </View>
        </View>
      </View>
    );
  }

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