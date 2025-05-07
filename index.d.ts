export interface InitConfig {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
}

export function initNavigationSDK(config: InitConfig): Promise<boolean>;
export function getReadyForStoreMap(): Promise<boolean>;
export function showPointOnMap(storeIds: string | string[]): Promise<void>;
export function getRouteTo(storeId: string): Promise<void>;

export function askRuntimePermissionsIfNeeded(): Promise<void>;
export function checkAllPermissions(): Promise<boolean>;
export function startScanIfPermissionsGranted(): Promise<boolean>;

export interface PoiMapViewProps {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
  language?: 'en' | 'tr';
  showOnMap?: string;
  getRouteTo?: string;
  style?: any;
}

import React from 'react';
export class PoiMapView extends React.Component<PoiMapViewProps> {}
export default PoiMapView;