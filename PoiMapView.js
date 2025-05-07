import React, { useEffect, useRef } from 'react';
import { requireNativeComponent, UIManager, findNodeHandle, Platform } from 'react-native';

const NativeMap = Platform.select({
  ios: requireNativeComponent('PoilabsNavigationMap'),
  android: requireNativeComponent('PoiMapViewManager'),
});

const PoiMapView = ({
  applicationId,
  applicationSecret,
  uniqueId,
  language = 'en',
  showOnMap,
  getRouteTo,
  style,
  ...rest
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const id = findNodeHandle(ref.current);
      UIManager.dispatchViewManagerCommand(
        id,
        // @ts-ignore
        UIManager.PoiMapViewManager.Commands.create.toString(),
        [id]
      );
    }
  }, []);

  return (
    <NativeMap
      ref={ref}
      applicationId={applicationId}
      applicationSecret={applicationSecret}
      uniqueId={uniqueId}
      language={language}
      showOnMap={showOnMap}
      getRouteTo={getRouteTo}
      style={[{ flex: 1 }, style]}
      {...rest}
    />
  );
};

export default PoiMapView;