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

### Installation with Expo

Add the plugin to your `app.json` or `app.config.js`:

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

### React Native Installation (without Expo)

```bash
npm install @poilabs-dev/navigation-sdk-plugin
```

#### iOS Configuration

Add to your `ios/Podfile`:

```ruby
pod 'PoilabsNavigation'
```

#### Android Configuration

Add repositories to your project-level `android/build.gradle`:

```gradle
allprojects {
    repositories {
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication { basic(BasicAuthentication) }
            credentials {
                username = 'mapbox'
                password = 'YOUR_MAPBOX_TOKEN'
            }
        }
        maven {
            url "https://jitpack.io"
            credentials { username = 'YOUR_JITPACK_TOKEN' }
        }
        maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local/' }
    }
}
```
## 🎯 Usage

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

## 📋 API Reference

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