declare module "@poilabs-dev/navigation-sdk-plugin" {
  import React from 'react';
  import { ViewStyle } from 'react-native';

  interface InitConfig {
    applicationId: string;
    applicationSecret: string;
    uniqueId: string;
  }

  export interface PoiMapViewProps {
    language?: "en" | "tr";
    showOnMap?: string;
    getRouteTo?: string;
    style?: ViewStyle;
  }

  export function initNavigationSDK(config: InitConfig): Promise<boolean>;
  export function getReadyForStoreMap(): Promise<boolean>;
  export function showPointOnMap(storeIds: string | string[]): Promise<void>;
  export function getRouteTo(storeId: string): Promise<void>;

  export function askRuntimePermissionsIfNeeded(): Promise<void>;
  export function checkAllPermissions(): Promise<boolean>;
  export function startScanIfPermissionsGranted(): Promise<boolean>;

  export class PoiMapView extends React.Component<PoiMapViewProps> {}
  
  // Default export
  export default PoiMapView;
}