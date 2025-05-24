import { NativeModules } from "react-native";
import {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
} from "./permission";
import PoiMapViewComponent from "./PoiMapView";

const { PoiMapModule } = NativeModules;

if (!PoiMapModule) {
  console.error(
    "PoiMapModule not found. Make sure the native module is properly installed and linked."
  );
}

/**
 * Initialize the Poilabs Navigation SDK with required credentials
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.applicationId - Application ID provided by Poilabs
 * @param {string} config.applicationSecret - Application secret key
 * @param {string} config.uniqueId - Unique identifier for the application
 * @returns {Promise<boolean>} - Success status
 */
export async function initNavigationSDK({
  applicationId,
  applicationSecret,
  uniqueId,
}) {
  if (!applicationId || !applicationSecret || !uniqueId) {
    throw new Error(
      "Missing required parameters: applicationId, applicationSecret, uniqueId"
    );
  }

  try {
    // Request permissions first
    await askRuntimePermissionsIfNeeded();

    // Initialize the SDK
    const result = await PoiMapModule.initNavigationSDK(
      applicationId,
      applicationSecret,
      uniqueId
    );

    return result;
  } catch (error) {
    console.error("Error initializing Poilabs Navigation SDK:", error);
    throw error;
  }
}

/**
 * Prepare the SDK for store map operations
 * 
 * @returns {Promise<boolean>} - Success status
 */
export async function getReadyForStoreMap() {
  try {
    const result = await PoiMapModule.getReadyForStoreMap();
    return result;
  } catch (error) {
    console.error("Error preparing store map:", error);
    throw error;
  }
}

/**
 * Show one or more points on the map
 * 
 * @param {string|string[]} storeIds - Single store ID or array of store IDs to display
 * @returns {Promise<void>}
 */
export async function showPointOnMap(storeIds) {
  try {
    const ids = Array.isArray(storeIds) ? storeIds : [storeIds];
    await PoiMapModule.showPointOnMap(ids);
  } catch (error) {
    console.error("Error showing points on map:", error);
    throw error;
  }
}

/**
 * Get a route to a specific store
 * 
 * @param {string} storeId - Target store ID for navigation
 * @returns {Promise<void>}
 */
export async function getRouteTo(storeId) {
  try {
    await PoiMapModule.getRouteTo(storeId);
  } catch (error) {
    console.error("Error getting route:", error);
    throw error;
  }
}

/**
 * Start the positioning service
 * 
 * @returns {Promise<boolean>} - Success status
 */
export async function startPositioning() {
  try {
    const result = await PoiMapModule.startPositioning();
    return result;
  } catch (error) {
    console.error("Error starting positioning:", error);
    throw error;
  }
}

/**
 * Stop the positioning service
 * 
 * @returns {Promise<boolean>} - Success status
 */
export async function stopPositioning() {
  try {
    const result = await PoiMapModule.stopPositioning();
    return result;
  } catch (error) {
    console.error("Error stopping positioning:", error);
    throw error;
  }
}

// Export permission utilities
export {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
};

// Export the map view component with both named and default export
export const PoiMapView = PoiMapViewComponent;

// Default export
export default PoiMapViewComponent;