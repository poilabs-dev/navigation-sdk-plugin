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

With Expo, most configuration steps are handled automatically! Just add the plugin to your `app.json` or `app.config.js`:

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
npm install @poilabs-dev/navigation-sdk-plugin
or
yarn add @poilabs-dev/navigation-sdk-plugin
```

#### ⚠️ **iOS Additional Step Required**

Due to file size limitations, you need to manually add the MapboxMobileEvents framework:

1. **Download MapboxMobileEvents.xcframework**
   - Contact Poilabs support for the framework file
   - Or download from Mapbox's official releases

2. **Add to Xcode Project**
   - Open your `ios/{ProjectName}.xcworkspace` in Xcode
   - Drag `MapboxMobileEvents.xcframework` into your project
   - Select "Copy items if needed"
   - Add to both your main target and test target
   - In "Frameworks, Libraries, and Embedded Content" select "Embed & Sign"

3. **Run pod install**
   ```bash
   cd ios && pod install
   ```

#### iOS Configuration (Manual Setup)

1. **Add to Podfile**:
   ```ruby
   pod 'PoilabsNavigation', '4.4.1'
   ```

2. **Add Native Files**:
   Copy these files to your iOS project:
   - `NavigationView.swift`
   - `PoilabsMapManager.m` 
   - `PoilabsNavigationBridge.h`
   - `PoilabsNavigationBridge.m`

3. **Update Bridging Header**:
   Add to `{ProjectName}-Bridging-Header.h`:
   ```objc
   #import "PoilabsNavigationBridge.h"
   ```

4. **Add Permissions to Info.plist**:
   ```xml
   <key>MGLMapboxMetricsEnabledSettingShownInApp</key>
   <true/>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>Bu uygulama iç mekan navigasyonu için konum iznine ihtiyaç duyar</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>Bu uygulama arka planda navigasyon için konum iznine ihtiyaç duyar</string>
   <key>NSBluetoothPeripheralUsageDescription</key>
   <string>Beacon tarama için Bluetooth gereklidir</string>
   <key>NSBluetoothAlwaysUsageDescription</key>
   <string>Beacon tarama için Bluetooth gereklidir</string>
   <key>UIBackgroundModes</key>
   <array>
       <string>bluetooth-central</string>
       <string>location</string>
   </array>
   ```

5. **Add MapboxMobileEvents.xcframework** (same as Expo instructions above)

6. **Run pod install**:
   ```bash
   cd ios && pod install
   ```

#### Android Configuration (Manual Setup)

1. **Add repositories to project-level `build.gradle`**:
   ```gradle
   allprojects {
       repositories {
           google()
           mavenCentral()
           maven {
               url 'https://api.mapbox.com/downloads/v2/releases/maven'
               authentication {
                   basic(BasicAuthentication)
               }
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

2. **Update app-level `build.gradle`**:
   ```gradle
   android {
       compileSdkVersion 34
       defaultConfig {
           minSdkVersion 24
           multiDexEnabled true
       }
   }
   
   dependencies {
       implementation 'androidx.multidex:multidex:2.0.1'
       implementation 'com.github.poiteam:Android-Navigation-SDK:4.4.1'
   }
   ```

3. **Add permissions to `AndroidManifest.xml`**:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
   <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
   ```

4. **Add native modules and update `MainApplication.java`**

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

## 🔧 Troubleshooting

### iOS Issues

#### "NavigationView not found" Error
- Make sure `NavigationView.swift` is added to your Xcode project
- Check that the bridging header includes `PoilabsNavigationBridge.h`
- Verify that Swift files are properly compiled

#### MapboxMobileEvents Framework Missing
- Download the framework from Poilabs support
- Add it to your Xcode project with "Embed & Sign"
- Make sure it's added to all targets

#### Build Errors
```bash
cd ios && rm -rf Pods Podfile.lock
pod install
```

### Android Issues

#### Module Resolution Failed
- Check that JITPACK_TOKEN and MAPBOX_TOKEN are correctly set
- Verify repositories are added to project-level build.gradle
- Clean and rebuild: `./gradlew clean`

#### MultiDex Issues
- Ensure `multiDexEnabled true` is set
- Add `implementation 'androidx.multidex:multidx:2.0.1'`

### Common Issues

**Permission Errors**
- iOS: Check Info.plist permissions
- Android: Request runtime permissions before using SDK

**SDK Not Loading**
```javascript
// Check if module is available
import { NativeModules } from 'react-native';
console.log('Available modules:', Object.keys(NativeModules));
```

## 📚 API Reference

### Components

#### `PoiMapView`
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `applicationId` | string | - | **Required.** Application ID from Poilabs |
| `applicationSecret` | string | - | **Required.** Application secret from Poilabs |
| `uniqueId` | string | - | **Required.** Unique identifier |
| `language` | string | `"en"` | Map language ("en" or "tr") |
| `showOnMap` | string | - | Store ID to show initially |
| `getRouteTo` | string | - | Store ID to navigate to initially |
| `style` | object | `{flex: 1}` | Style object for the map view |

### Functions

#### `initNavigationSDK(config)`
```typescript
interface InitConfig {
  applicationId: string;
  applicationSecret: string;
  uniqueId: string;
}
```

#### `showPointOnMap(storeIds)`
```typescript
// Single store
await showPointOnMap('STORE_001');

// Multiple stores  
await showPointOnMap(['STORE_001', 'STORE_002']);
```

## 🔑 Getting Credentials

Contact Poilabs support to obtain:
- `APPLICATION_ID`
- `APPLICATION_SECRET`
- `UNIQUE_IDENTIFIER`  
- `MAPBOX_TOKEN`
- `JITPACK_TOKEN`
- `MapboxMobileEvents.xcframework` (for iOS)

## 📄 License

MIT

## 🆘 Support

- 📧 Contact Poilabs support team
- 🐛 Open a GitHub Issue
- 📖 Check troubleshooting section above