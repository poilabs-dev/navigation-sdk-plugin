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
export default withPoilabsVdNavigation;

// Module Declaration
declare module '@poilabs-dev/navigation-sdk-plugin' {
  export * from './index';
}