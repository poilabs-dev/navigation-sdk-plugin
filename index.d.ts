declare module "@poilabs-dev/navigation-sdk-plugin" {
  interface InitConfig {
    applicationId: string;
    applicationSecret: string;
    uniqueId: string;
  }

  export function initNavigationSDK(config: InitConfig): Promise<boolean>;
  export function getReadyForStoreMap(): Promise<boolean>;
  export function showPointOnMap(storeIds: string[]): Promise<void>;
  export function getRouteTo(storeId: string): Promise<void>;

  export class PoiMapView extends React.Component<{
    language?: "en" | "tr";
    showOnMap?: string;
    getRouteTo?: string;
  }> {}

  export function askRuntimePermissionsIfNeeded(): Promise<void>;
  export function checkAllPermissions(): Promise<boolean>;
  export function startScanIfPermissionsGranted(): Promise<boolean>;
}
