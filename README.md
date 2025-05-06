# Poilabs Navigation SDK Plugin

An Expo plugin and React Native module for integrating the Poilabs Navigation SDK for indoor navigation in your app.

## Features

- Indoor navigation and mapping
- User location tracking
- Points of interest display
- Route finding
- Support for both iOS and Android platforms
- Full TypeScript definitions
- Easy Expo integration

## Installation

### Using Expo

```bash
npx expo install @poilabs-dev/navigation-sdk-plugin
```

Then add the plugin to your `app.json` or `app.config.js`:

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

### Using React Native (without Expo)

```bash
npm install @poilabs-dev/navigation-sdk-plugin
```

For iOS, add the following to your Podfile:

```ruby
pod 'PoilabsNavigation'
```

For Android, add the repositories in your project-level build.gradle:

```gradle
allprojects {
    repositories {
        // Mapbox
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication { basic(BasicAuthentication) }
            credentials {
                username = 'mapbox'
                password = 'YOUR_MAPBOX_TOKEN'
            }
        }
        // JitPack
        maven {
            url "https://jitpack.io"
            credentials { username = 'YOUR_JITPACK_TOKEN' }
        }
        // OSS snapshots
        maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local/' }
    }
}
```

And add the dependency in your app-level build.gradle:

```gradle
dependencies {
    implementation 'com.github.poiteam:Android-Navigation-SDK:4.4.1'
}
```

## Required Permissions

### iOS
Add these to your Info.plist:

```xml
<key>MGLMapboxMetricsEnabledSettingShownInApp</key>
<true/>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Needed for indoor navigation</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Needed for background navigation</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Bluetooth required for beacon ranging</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Bluetooth required for beacon ranging</string>
```

### Android
Add these to your AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
```

## Usage

### Initialization

```javascript
import { initNavigationSDK, PoiMapView } from '@poilabs-dev/navigation-sdk-plugin';

// Initialize the SDK with your credentials
await initNavigationSDK({
  applicationId: 'YOUR_APPLICATION_ID',
  applicationSecret: 'YOUR_APPLICATION_SECRET',
  uniqueId: 'YOUR_UNIQUE_IDENTIFIER'
});

// Request runtime permissions if needed
import { askRuntimePermissionsIfNeeded } from '@poilabs-dev/navigation-sdk-plugin';
await askRuntimePermissionsIfNeeded();
```

### Display the Map

```jsx
import { PoiMapView } from '@poilabs-dev/navigation-sdk-plugin';

function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      <PoiMapView 
        language="en" 
        style={{ flex: 1 }} 
      />
    </View>
  );
}
```

### Show a Point on the Map

```javascript
import { showPointOnMap } from '@poilabs-dev/navigation-sdk-plugin';

// Show a single point
showPointOnMap('STORE_ID_1');

// Or show multiple points
showPointOnMap(['STORE_ID_1', 'STORE_ID_2', 'STORE_ID_3']);
```

### Get a Route to a Destination

```javascript
import { getRouteTo } from '@poilabs-dev/navigation-sdk-plugin';

// Navigate to a specific store
getRouteTo('STORE_ID');
```

### Display Map with Initial Point or Route

```jsx
import { PoiMapView } from '@poilabs-dev/navigation-sdk-plugin';

function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Show a specific point when map loads */}
      <PoiMapView 
        language="en"
        showOnMap="STORE_ID" 
        style={{ flex: 1 }} 
      />
      
      {/* Or navigate to a specific point when map loads */}
      <PoiMapView 
        language="en"
        getRouteTo="STORE_ID" 
        style={{ flex: 1 }} 
      />
    </View>
  );
}
```

## Getting Credentials

To use this SDK, you need to obtain the following credentials from Poilabs:

1. `APPLICATION_ID`
2. `APPLICATION_SECRET_KEY`
3. `UNIQUE_IDENTIFIER`
4. `MAPBOX_TOKEN`
5. `JITPACK_TOKEN`

Please contact Poilabs for these credentials.

## API Reference

### Components

#### `PoiMapView`

React component that displays the indoor map.

Props:
- `language`: Language for the map UI ("en" or "tr")
- `showOnMap`: Store ID to show on the map
- `getRouteTo`: Store ID to navigate to
- `style`: Style object for the map container

### Functions

#### `initNavigationSDK({ applicationId, applicationSecret, uniqueId })`

Initializes the Poilabs Navigation SDK with your credentials.

#### `getReadyForStoreMap()`

Prepares the SDK for map operations.

#### `showPointOnMap(storeIds)`

Shows one or more points on the map. Accepts a single store ID or an array of store IDs.

#### `getRouteTo(storeId)`

Gets a route to the specified store.

#### `askRuntimePermissionsIfNeeded()`

Requests location and Bluetooth permissions if needed.

#### `checkAllPermissions()`

Checks if all required permissions are granted.

#### `startScanIfPermissionsGranted()`

Starts Bluetooth scanning if permissions are granted.

## License

MIT

## Support

For any issues or questions, please create an issue on GitHub or contact Poilabs support.