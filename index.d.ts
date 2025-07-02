import { ComponentType } from "react";
import { ViewProps } from "react-native";

export interface PoiMapViewProps extends ViewProps {
  applicationId?: string;
  applicationSecret?: string;
  uniqueId?: string;
  language?: string;
  showPointOnMap?: string;
  getRouteTo?: string;
}

export interface InitConfig {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
}

export interface PluginConfig {
  mapboxToken?: string;
  jitpackToken?: string;
}

export const PoiMapView: ComponentType<PoiMapViewProps>;
export default PoiMapView;

export function initNavigationSDK(config: InitConfig): Promise<boolean>;
export function getReadyForStoreMap(): Promise<boolean>;
export function showPointOnMap(storeIds: string[]): Promise<void>;
export function showSinglePointOnMap(storeId: string): Promise<void>;
export function getRouteTo(storeId: string): Promise<void>;
export function getRouteToWithPromise(storeId: string): Promise<void>;
export function startPositioning(): Promise<boolean>;
export function stopPositioning(): Promise<boolean>;
export function restartMap(language: string): Promise<void>;

export function askRuntimePermissionsIfNeeded(): Promise<boolean>;
export function checkAllPermissions(): Promise<boolean>;
export function startScanIfPermissionsGranted(): Promise<boolean>;
