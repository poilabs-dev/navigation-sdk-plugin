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

```bash
npx expo prebuild
```

Due to file size limitations, you need to manually add the MapboxMobileEvents framework:

**1. Download MapboxMobileEvents.xcframework**

Navigate to your iOS project directory and run:

```bash
cd ios
curl -L -o repo.zip https://github.com/poiteam/react-native-ios-poilabs-navigation-integration/archive/refs/heads/main.zip
unzip -q repo.zip
cp -R react-native-ios-poilabs-navigation-integration-main/ios/MapboxMobileEvents.xcframework .
rm -rf react-native-ios-poilabs-navigation-integration-main repo.zip
cd ..
```

**2. Configure Framework in Xcode**

- Select your project in Project Navigator
- Go to your app target
- Navigate to "General" tab
- Scroll down to "Frameworks, Libraries, and Embedded Content" section
- Find `MapboxMobileEvents.xcframework` in the list
- Change its setting from "Do Not Embed" to "Embed & Sign"

#### iOS Configuration (Manual Setup)

1. **Add Native Files**:
   For iOS, you need to ensure the plugin files are properly included in your Xcode project:

   Open your Xcode project
   In Xcode, verify that the PoilabsModule files are added to your project
   Check that the files appear in the "Build Phases > Compile Sources" section
   Find + button and click. Then you should "add other".

   - `NavigationView.swift`
   - `PoilabsMapManager.m`
   - `PoilabsNavigationBridge.h`
   - `PoilabsNavigationBridge.m`

2. **Add MapboxMobileEvents.xcframework** (same as Expo instructions above)

3. **Run pod install**:

```bash
cd ios && pod install
```

#### Android Configuration (Manuel Setup)

Android Setup
Find the getPackages() method in MainApplication.kt and add the PoilabsPackage:

```bash
 override fun getPackages(): List<ReactPackage> {
   val packages = PackageList(this).packages
     // add this line
   packages.add(PoilabsPackage())
   return packages
 }
```

Clean and rebuild your Android project:

```bash
 cd android
 ./gradlew clean
 cd ..
 npx expo run:android
```

## 🎯 Usage

### Basic Map Display

```jsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { PoiMapView } from "@poilabs-dev/navigation-sdk-plugin";

const MapScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <PoiMapView
        style={styles.map}
        applicationId="YOUR_APPLICATION_ID"
        applicationSecret="YOUR_APPLICATION_SECRET"
        uniqueId="YOUR_UNIQUE_IDENTIFIER"
        language="en"
      />
    </SafeAreaView>
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
  askRuntimePermissionsIfNeeded,
} from "@poilabs-dev/navigation-sdk-plugin";

// Request permissions
await askRuntimePermissionsIfNeeded();

// Initialize SDK
const success = await initNavigationSDK({
  applicationId: "YOUR_APPLICATION_ID",
  applicationSecret: "YOUR_APPLICATION_SECRET",
  uniqueId: "YOUR_UNIQUE_IDENTIFIER",
});

if (success) {
  await getReadyForStoreMap();
  console.log("SDK initialized successfully!");
}
```

### Show Points on Map

```javascript
import { showPointOnMap } from "@poilabs-dev/navigation-sdk-plugin";

// Show single point
await showPointOnMap("STORE_ID_1");

// Show multiple points
await showPointOnMap(["STORE_ID_1", "STORE_ID_2", "STORE_ID_3"]);
```

### Get Route to Destination

```javascript
import { getRouteTo } from "@poilabs-dev/navigation-sdk-plugin";

// Navigate to a specific store
await getRouteTo("STORE_ID");
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
- Clean and rebuild:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npx expo run:android
  ```

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
import { NativeModules } from "react-native";
console.log("Available modules:", Object.keys(NativeModules));
```

## 📚 API Reference

### Components

#### `PoiMapView`

| Prop                | Type   | Default     | Description                                   |
| ------------------- | ------ | ----------- | --------------------------------------------- |
| `applicationId`     | string | -           | **Required.** Application ID from Poilabs     |
| `applicationSecret` | string | -           | **Required.** Application secret from Poilabs |
| `uniqueId`          | string | -           | **Required.** Unique identifier               |
| `language`          | string | `"en"`      | Map language ("en" or "tr")                   |
| `showOnMap`         | string | -           | Store ID to show initially                    |
| `getRouteTo`        | string | -           | Store ID to navigate to initially             |
| `style`             | object | `{flex: 1}` | Style object for the map view                 |

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
await showPointOnMap("STORE_001");

// Multiple stores
await showPointOnMap(["STORE_001", "STORE_002"]);
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
