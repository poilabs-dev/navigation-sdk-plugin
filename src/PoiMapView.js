import React, { useEffect, useRef } from "react";
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  Platform,
  View,
  NativeModules,
} from "react-native";

// Platform-specific module names
const ModuleName = Platform.OS === "ios" ? "PoilabsNavigationBridge" : "PoiMapModule";
const NativeModule = NativeModules[ModuleName];

let NativeMap;

// Try to load native components with proper error handling
if (Platform.OS === "android") {
  try {
    NativeMap = requireNativeComponent("PoiMapViewManager");
  } catch (e) {
    console.warn("❌ Android component failed to load: PoiMapViewManager", e);
    NativeMap = View; // Fallback to regular View
  }
} else if (Platform.OS === "ios") {
  try {
    NativeMap = requireNativeComponent("PoilabsNavigationMap");
  } catch (e) {
    console.warn("❌ iOS component failed to load: PoilabsNavigationMap", e);
    NativeMap = View; // Fallback to regular View
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
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once when we have all required props
    if (applicationId && applicationSecret && uniqueId && !initializedRef.current) {
      initializeSDK();
      initializedRef.current = true;
    }
  }, [applicationId, applicationSecret, uniqueId]);

  useEffect(() => {
    // Handle Android view creation
    if (Platform.OS === "android" && UIManager.getViewManagerConfig) {
      const viewManagerConfig = UIManager.getViewManagerConfig("PoiMapViewManager");
      
      if (viewManagerConfig && ref.current) {
        const id = findNodeHandle(ref.current);
        if (id && viewManagerConfig.Commands?.create) {
          setTimeout(() => {
            UIManager.dispatchViewManagerCommand(
              id,
              viewManagerConfig.Commands.create.toString(),
              [id]
            );
          }, 100);
        }
      }
    }
  }, []);

  const initializeSDK = async () => {
    if (!NativeModule) {
      console.error(`${ModuleName} module not found`);
      return;
    }

    try {
      if (Platform.OS === "ios") {
        // iOS initialization
        await NativeModule.initNavigationSDK(
          applicationId,
          applicationSecret,
          uniqueId
        );
        console.log("✅ iOS SDK initialized successfully");
      } else {
        // Android initialization is handled in the native module
        console.log("✅ Android SDK will be initialized by native module");
      }
    } catch (error) {
      console.error("❌ Failed to initialize SDK:", error);
    }
  };

  // Show a fallback view if native component failed to load
  if (NativeMap === View) {
    return (
      <View style={[{ flex: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }, style]}>
        <View style={{ padding: 20, backgroundColor: '#fff', borderRadius: 8, margin: 20 }}>
          <View style={{ marginBottom: 10 }}>
            <View style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>⚠️ Navigation SDK Not Available</View>
          </View>
          <View style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            The native navigation component could not be loaded. Please ensure the SDK is properly installed.
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