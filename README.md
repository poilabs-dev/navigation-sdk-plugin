# Poilabs Navigation SDK Plugin

A React Native and Expo plugin for integrating Poilabs Navigation SDK with indoor navigation capabilities.

## 🚀 Features

- ✅ Indoor navigation and mapping
- ✅ User location tracking
- ✅ Points of interest display
- ✅ Route finding and navigation
- ✅ iOS and Android support
- ✅ Full TypeScript support
- ✅ Easy Expo integration

## 📦 Installation

### Installation with Expo (Recommended)

With Expo, all configuration steps are handled automatically! Just add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "@poilabs-dev/navigation-sdk-plugin",
        {
          "mapboxToken": "YOUR_MAPBOX_TOKEN",
          "jitpackToken": "YOUR_JITPACK_TOKEN"
        }
      ]
    ]
  }
}
```

Then run:

```bash
npx expo install @poilabs-dev/navigation-sdk-plugin
```

That's it! The plugin will automatically:
- Add all required permissions to iOS and Android
- Configure Mapbox repositories
- Add necessary dependencies
- Set up all required configuration parameters

### React Native Installation (without Expo)

If you're not using Expo, you'll need to do some manual configuration:

```bash
npm install @poilabs-dev/navigation-sdk-plugin
```

#### iOS Configuration (Manual Setup)

Our plugin will handle some configuration automatically, but you'll need to:

1. Run pod install:

```bash
cd ios && pod install
```

> **Note**: All required permissions, the `PoilabsNavigation` pod, and other configuration settings are automatically added by the plugin during the build process.

#### Android Configuration (Manual Setup)

Our plugin will handle most configuration automatically, but you should verify:

1. Your project-level `android/build.gradle` has the correct repositories 
2. Your app-level `android/app/build.gradle` has the right settings:
   - `compileSdkVersion 34` or higher
   - `minSdkVersion 24` or higher
   - `multiDexEnabled true`

> **Note**: All required permissions, dependencies, and configurations are automatically added by the plugin during the build process.

## 🎯 Usage

### Basic Map Display

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PoiMapView } from '@poilabs-dev/navigation-sdk-plugin';

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <PoiMapView
        style={styles.map}
        applicationId="YOUR_APPLICATION_ID"
        applicationSecret="YOUR_APPLICATION_SECRET"
        uniqueId="YOUR_UNIQUE_IDENTIFIER"
        language="en"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
```

### Initialize SDK

```javascript
import {
  initNavigationSDK,
  getReadyForStoreMap,
  askRuntimePermissionsIfNeeded
} from '@poilabs-dev/navigation-sdk-plugin';

// Request permissions
await askRuntimePermissionsIfNeeded();

// Initialize SDK
const success = await initNavigationSDK({
  applicationId: 'YOUR_APPLICATION_ID',
  applicationSecret: 'YOUR_APPLICATION_SECRET',
  uniqueId: 'YOUR_UNIQUE_IDENTIFIER'
});

if (success) {
  // Prepare for store map operations
  await getReadyForStoreMap();
  console.log('SDK initialized successfully!');
}
```

### Show Points on Map

```javascript
import { showPointOnMap } from '@poilabs-dev/navigation-sdk-plugin';

// Show single point
await showPointOnMap('STORE_ID_1');

// Show multiple points
await showPointOnMap(['STORE_ID_1', 'STORE_ID_2', 'STORE_ID_3']);
```

### Get Route to Destination

```javascript
import { getRouteTo } from '@poilabs-dev/navigation-sdk-plugin';

// Navigate to a specific store
await getRouteTo('STORE_ID');
```

### Positioning Service

```javascript
import { startPositioning, stopPositioning } from '@poilabs-dev/navigation-sdk-plugin';

// Start positioning
const started = await startPositioning();

// Stop positioning
const stopped = await stopPositioning();
```

### Permission Checks

```javascript
import {
  checkAllPermissions,
  startScanIfPermissionsGranted
} from '@poilabs-dev/navigation-sdk-plugin';

// Check if all permissions are granted
const hasPermissions = await checkAllPermissions();

// Start scanning if permissions are granted
const scanStarted = await startScanIfPermissionsGranted();
```

## 📋 Complete Example

See the [Example.js](./Example.js) file for a complete implementation example.

## 📚 API Reference

### Components

#### `PoiMapView`

A React component that displays the indoor map.

**Props:**
- `applicationId` (string): Application ID provided by Poilabs
- `applicationSecret` (string): Application secret key
- `uniqueId` (string): Unique identifier for the application
- `language` (string, optional): Language for the map UI ("en" or "tr", default: "en")
- `showOnMap` (string, optional): Store ID to show on map initially
- `getRouteTo` (string, optional): Store ID to navigate to initially
- `style` (object, optional): Style object for the map view

### Functions

#### `initNavigationSDK(config: InitConfig): Promise<boolean>`
Initializes the Poilabs Navigation SDK.

**Parameters:**
- `config.applicationId`: Application ID provided by Poilabs
- `config.applicationSecret`: Application secret key
- `config.uniqueId`: Unique identifier for the application

#### `getReadyForStoreMap(): Promise<boolean>`
Prepares the SDK for store map operations.

#### `showPointOnMap(storeIds: string | string[]): Promise<void>`
Shows point(s) on the map.

**Parameters:**
- `storeIds`: Single store ID or array of store IDs to display

#### `getRouteTo(storeId: string): Promise<void>`
Gets a route to the specified store.

**Parameters:**
- `storeId`: Target store ID for navigation

#### `startPositioning(): Promise<boolean>`
Starts the positioning service.

#### `stopPositioning(): Promise<boolean>`
Stops the positioning service.

#### `askRuntimePermissionsIfNeeded(): Promise<boolean>`
Requests required runtime permissions.

#### `checkAllPermissions(): Promise<boolean>`
Checks if all required permissions are granted.

## 🔑 Getting Credentials

To use this SDK, you need to obtain the following credentials from Poilabs:

1. `APPLICATION_ID`
2. `APPLICATION_SECRET_KEY`
3. `UNIQUE_IDENTIFIER`
4. `MAPBOX_TOKEN`
5. `JITPACK_TOKEN`

Please contact Poilabs support to get these credentials.

## 🛠️ Development

### Minimum Requirements

- **Android**: API Level 24 (Android 7.0), Compile SDK 34
- **iOS**: iOS 11.0+
- **React Native**: 0.60+
- **Expo**: 47.0.0+

### Troubleshooting

#### Android Build Issues
- Check `compileSdkVersion` and `minSdkVersion` values
- Ensure MultiDex support is enabled
- Verify repositories are correctly added

#### iOS Build Issues
- Check pod installation: `cd ios && pod install`
- Ensure bridging header file exists
- Verify Xcode project settings

#### Common Issues

**Module not found errors:**
```bash
# Clear cache and reinstall
npx expo install --fix
# or for React Native
npx react-native clean
```

**Permission errors:**
- Ensure all required permissions are added to platform-specific files
- Test permission flow on physical devices

## 📚 Examples

### Basic Setup Example

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import {
  initNavigationSDK,
  getReadyForStoreMap,
  showPointOnMap,
  askRuntimePermissionsIfNeeded
} from '@poilabs-dev/navigation-sdk-plugin';

export default function NavigationExample() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      // Request permissions
      await askRuntimePermissionsIfNeeded();
      
      // Initialize SDK
      const success = await initNavigationSDK({
        applicationId: 'YOUR_APP_ID',
        applicationSecret: 'YOUR_SECRET',
        uniqueId: 'YOUR_UNIQUE_ID'
      });

      if (success) {
        await getReadyForStoreMap();
        setIsReady(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize SDK');
    }
  };

  const showStore = async () => {
    if (isReady) {
      await showPointOnMap('STORE_001');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text>SDK Status: {isReady ? 'Ready' : 'Initializing...'}</Text>
      <Button 
        title="Show Store" 
        onPress={showStore} 
        disabled={!isReady} 
      />
    </View>
  );
}
```

## 📄 License

MIT

## 🆘 Support

For any issues or questions:
- Open a GitHub Issue
- Contact Poilabs support team
- Check the troubleshooting section above

## 📝 Changelog

### v1.0.9
- Initial stable release
- iOS and Android support
- TypeScript definitions added
- Expo plugin support
- Complete API documentation