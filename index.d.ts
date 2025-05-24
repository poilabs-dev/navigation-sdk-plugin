import { ComponentType } from 'react';
import { ViewProps } from 'react-native';

// PoiMapView Component Props
export interface PoiMapViewProps extends ViewProps {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
  language?: string;
  showOnMap?: string;
  getRouteTo?: string;
}

// SDK Configuration Interface
export interface InitConfig {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
}

// Plugin Configuration Interface
export interface PluginConfig {
  mapboxToken?: string;
  jitpackToken?: string;
}

// Component export - both named and default
export const PoiMapView: ComponentType<PoiMapViewProps>;
export default PoiMapView;

// Main SDK Functions
export function initNavigationSDK(config: InitConfig): Promise<boolean>;
export function getReadyForStoreMap(): Promise<boolean>;
export function showPointOnMap(storeIds: string | string[]): Promise<void>;
export function getRouteTo(storeId: string): Promise<void>;
export function startPositioning(): Promise<boolean>;
export function stopPositioning(): Promise<boolean>;

// Permission Functions
export function askRuntimePermissionsIfNeeded(): Promise<boolean>;
export function checkAllPermissions(): Promise<boolean>;
export function startScanIfPermissionsGranted(): Promise<boolean>;

// Plugin Export
export function withPoilabsVdNavigation(config: any, props?: PluginConfig): any;