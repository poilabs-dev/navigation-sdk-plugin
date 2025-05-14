import { NativeModules } from "react-native";
import {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
} from "./permission";
import PoiMapView, { showPointOnMap, getRouteTo } from "./PoiMapView";

export async function initNavigationSDK({
  applicationId,
  applicationSecret,
  uniqueId,
}) {
  if (!applicationId || !applicationSecret || !uniqueId)
    throw new Error("Missing credentials");

  await askRuntimePermissionsIfNeeded();

  const { PoilabsNavigationModule } = NativeModules;

  if (!PoilabsNavigationModule) {
    console.error(
      "PoilabsNavigationModule not found. Make sure native modules are properly linked."
    );
    return false;
  }

  try {
    return await PoilabsNavigationModule.initWithAppId(
      applicationId,
      applicationSecret,
      uniqueId
    );
  } catch (error) {
    console.error("Error initializing Poilabs Navigation SDK:", error);
    return false;
  }
}

export async function getReadyForStoreMap() {
  const { PoilabsNavigationModule } = NativeModules;

  if (!PoilabsNavigationModule) {
    console.error(
      "PoilabsNavigationModule not found. Make sure native modules are properly linked."
    );
    return false;
  }

  try {
    return await PoilabsNavigationModule.getReadyForStoreMap();
  } catch (error) {
    console.error("Error preparing Poilabs Navigation SDK:", error);
    return false;
  }
}

export {
  PoiMapView,
  showPointOnMap,
  getRouteTo,
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
};
