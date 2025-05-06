import { NativeModules } from "react-native";
import {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
} from "./permission";

export async function initNavigationSDK({
  applicationId,
  applicationSecret,
  uniqueId,
}) {
  if (!applicationId || !applicationSecret || !uniqueId)
    throw new Error("Missing credentials");
  await askRuntimePermissionsIfNeeded();
  const { PoilabsNavigationModule } = NativeModules;
  return await PoilabsNavigationModule.initWithAppId(
    applicationId,
    applicationSecret,
    uniqueId
  );
}

export async function getReadyForStoreMap() {
  const { PoilabsNavigationModule } = NativeModules;
  return await PoilabsNavigationModule.getReadyForStoreMap();
}

export async function showPointOnMap(storeIds) {
  const { PoilabsNavigationModule } = NativeModules;
  return await PoilabsNavigationModule.showPointOnMap(storeIds);
}

export async function getRouteTo(storeId) {
  const { PoilabsNavigationModule } = NativeModules;
  return await PoilabsNavigationModule.getRouteTo(storeId);
}

export {
  askRuntimePermissionsIfNeeded,
  checkAllPermissions,
  startScanIfPermissionsGranted,
};
