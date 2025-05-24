import { NativeModules } from "react-native";
import {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
} from "./permission";

const { PoiMapModule } = NativeModules;

if (!PoiMapModule) {
  console.error(
    "PoiMapModule not found. Make sure the native module is properly installed and linked."
  );
}

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
    await askRuntimePermissionsIfNeeded();

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

export async function getReadyForStoreMap() {
  try {
    const result = await PoiMapModule.getReadyForStoreMap();
    return result;
  } catch (error) {
    console.error("Error preparing store map:", error);
    throw error;
  }
}

export async function showPointOnMap(storeIds) {
  try {
    const ids = Array.isArray(storeIds) ? storeIds : [storeIds];
    await PoiMapModule.showPointOnMap(ids);
  } catch (error) {
    console.error("Error showing points on map:", error);
    throw error;
  }
}

export async function getRouteTo(storeId) {
  try {
    await PoiMapModule.getRouteTo(storeId);
  } catch (error) {
    console.error("Error getting route:", error);
    throw error;
  }
}

export async function startPositioning() {
  try {
    const result = await PoiMapModule.startPositioning();
    return result;
  } catch (error) {
    console.error("Error starting positioning:", error);
    throw error;
  }
}

export async function stopPositioning() {
  try {
    const result = await PoiMapModule.stopPositioning();
    return result;
  } catch (error) {
    console.error("Error stopping positioning:", error);
    throw error;
  }
}

export {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
};
