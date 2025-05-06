import { NativeModules, Platform } from "react-native";
import {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
} from "./permission";
import PoiMapView, { showPointOnMap, getRouteTo } from "./PoiMapView";

/**
 * Initialize the Poilabs Navigation SDK
 * @param {Object} config
 * @param {string} config.applicationId - Application ID provided by Poilabs
 * @param {string} config.applicationSecret - Application secret provided by Poilabs
 * @param {string} config.uniqueId - Unique identifier for your application
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
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

/**
 * Prepare the SDK for map operations
 * @returns {Promise<boolean>} - Whether preparation was successful
 */
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

// Export everything
export {
  PoiMapView,
  showPointOnMap,
  getRouteTo,
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
};
