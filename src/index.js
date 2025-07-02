import React, { useRef, useEffect } from "react";
import {
  Platform,
  UIManager,
  findNodeHandle,
  requireNativeComponent,
  NativeModules,
} from "react-native";

const LINKING_ERROR =
  `The package '@poilabs-dev/navigation-sdk-plugin' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo managed workflow\n";

const PoiMapModule = NativeModules.PoiMapModule
  ? NativeModules.PoiMapModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const PoiMapViewManager = requireNativeComponent("PoiMapViewManager");

const PoiMapView = React.forwardRef((props, ref) => {
  const nativeRef = useRef(null);

  useEffect(() => {
    const viewId = findNodeHandle(nativeRef.current);
    createFragment(viewId);
  }, []);

  const createFragment = (viewId) => {
    UIManager.dispatchViewManagerCommand(
      viewId,
      UIManager.getViewManagerConfig(
        "PoiMapViewManager"
      ).Commands.create.toString(),
      [viewId]
    );
  };

  return <PoiMapViewManager {...props} ref={nativeRef} />;
});

PoiMapView.displayName = "PoiMapView";

export function initNavigationSDK(config) {
  return PoiMapModule.initNavigationSDK(
    config.applicationId,
    config.applicationSecret,
    config.uniqueId
  );
}

export function getReadyForStoreMap() {
  return PoiMapModule.getReadyForStoreMap();
}

export function showPointOnMap(storeIds) {
  const idsArray = Array.isArray(storeIds) ? storeIds : [storeIds];
  return PoiMapModule.showPointOnMap(idsArray);
}

export function showSinglePointOnMap(storeId) {
  return PoiMapModule.showSinglePointOnMap(storeId);
}

export function getRouteTo(storeId) {
  PoiMapModule.getRouteTo(storeId);
}

export function getRouteToWithPromise(storeId) {
  return PoiMapModule.getRouteToWithPromise(storeId);
}

export function startPositioning() {
  return PoiMapModule.startPositioning();
}

export function stopPositioning() {
  return PoiMapModule.stopPositioning();
}

export function restartMap(language = "en") {
  PoiMapModule.restartMap(language);
}

export function askRuntimePermissionsIfNeeded() {
  if (Platform.OS === "android") {
    return Promise.resolve(true);
  }

  return Promise.resolve(true);
}

export function checkAllPermissions() {
  return Promise.resolve(true);
}

export function startScanIfPermissionsGranted() {
  return Promise.resolve(true);
}

export { PoiMapView };
export default PoiMapView;
