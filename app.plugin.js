const {
  withDangerousMod,
  withAndroidManifest,
  withInfoPlist,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Android permissions for location & bluetooth
const ANDROID_PERMISSIONS = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.BLUETOOTH_CONNECT",
  "android.permission.BLUETOOTH_SCAN",
];

function addProjectRepositories(config, { mapboxToken, jitpackToken }) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projBuild = path.join(root, "android/build.gradle");
      let text = fs.readFileSync(projBuild, "utf8");

      const repoBlock = `allprojects {
    repositories {
      // Mapbox
      maven {
        url 'https://api.mapbox.com/downloads/v2/releases/maven'
        authentication { basic(BasicAuthentication) }
        credentials {
          username = 'mapbox'
          password = '${mapboxToken}'
        }
      }
      // JitPack
      maven {
        url "https://jitpack.io"
        credentials { username = '${jitpackToken}' }
      }
      // OSS snapshots
      maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local/' }
    }
  }`;
      if (!text.includes("api.mapbox.com/downloads")) {
        text = text.replace(/allprojects[\s\S]*?\}/, repoBlock);
        fs.writeFileSync(projBuild, text, "utf8");
      }
      return modConfig;
    },
  ]);
}

function addAppGradleSettings(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const appGradle = path.join(root, "android/app/build.gradle");
      let text = fs.readFileSync(appGradle, "utf8");

      text = text.replace(/compileSdkVersion\s*\d+/, "compileSdkVersion 34");
      text = text.replace(/defaultConfig \{([\s\S]*?)\}/, (match, inner) => {
        let cfg = inner;
        if (!/multiDexEnabled true/.test(cfg)) {
          cfg = cfg.replace(
            /applicationId [^\n]+/,
            "$&\n        multiDexEnabled true"
          );
        }
        if (!/minSdkVersion 24/.test(cfg)) {
          cfg = cfg.replace(/minSdkVersion \d+/, "minSdkVersion 24");
        }
        return `defaultConfig {${cfg}}`;
      });

      if (!text.includes("androidx.multidex:multidex:2.0.1")) {
        text = text.replace(
          /dependencies \{/,
          (match) =>
            `${match}\n    implementation 'androidx.multidex:multidex:2.0.1'`
        );
      }

      if (!text.includes("Android-Navigation-SDK")) {
        text = text.replace(
          /dependencies \{/,
          (match) =>
            `${match}\n    implementation 'com.github.poiteam:Android-Navigation-SDK:4.4.1'`
        );
      }

      fs.writeFileSync(appGradle, text);
      return modConfig;
    },
  ]);
}

function addAndroidPermissions(config) {
  return withAndroidManifest(config, (mod) => {
    const { manifest } = mod.modResults;
    const uses = manifest["uses-permission"] || [];
    ANDROID_PERMISSIONS.forEach((name) => {
      if (!uses.some((p) => p["$"]["android:name"] === name)) {
        uses.push({ $: { "android:name": name } });
      }
    });
    manifest["uses-permission"] = uses;
    return mod;
  });
}

function addIOSInfoPlist(config) {
  return withInfoPlist(config, (mod) => {
    const plist = mod.modResults;
    plist.MGLMapboxMetricsEnabledSettingShownInApp = true;
    plist.NSLocationWhenInUseUsageDescription = "Needed for indoor navigation";
    plist.NSLocationAlwaysUsageDescription = "Needed for background navigation";
    plist.NSBluetoothPeripheralUsageDescription =
      "Bluetooth required for beacon ranging";
    plist.NSBluetoothAlwaysUsageDescription =
      "Bluetooth required for beacon ranging";
    return mod;
  });
}

function addIOSPods(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfile = path.join(
        modConfig.modRequest.projectRoot,
        "ios/Podfile"
      );
      let text = fs.readFileSync(podfile, "utf8");
      if (!text.includes("pod 'PoilabsNavigation'")) {
        text = text.replace(
          /target ['"].+['"] do/,
          (match) => `${match}\n  pod 'PoilabsNavigation'`
        );
      }
      fs.writeFileSync(podfile, text);
      return modConfig;
    },
  ]);
}

function addIOSNativeModules(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projectName = modConfig.modRequest.projectName;
      const destDir = path.join(root, "ios", projectName);

      const srcDir = path.join(__dirname, "templates", "ios");
      const files = [
        "NavigationView.swift",
        "PoilabsMapManager.m",
        "PoilabsNavigationBridge.h",
        "PoilabsNavigationBridge.m",
        "PoilabsNavigationModule.m",
      ];

      for (const file of files) {
        const src = path.join(srcDir, file);
        const out = path.join(destDir, file);

        let content = fs.readFileSync(src, "utf8");
        content = content.replace(/__PROJECT_NAME__/g, projectName);

        fs.writeFileSync(out, content, "utf8");
      }

      // Ensure Swift bridging header exists
      const bridgingHeaderPath = path.join(destDir, `${projectName}-Bridging-Header.h`);
      if (!fs.existsSync(bridgingHeaderPath)) {
        const bridgingHeader = `//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
`;
        fs.writeFileSync(bridgingHeaderPath, bridgingHeader, "utf8");
      }

      return modConfig;
    },
  ]);
}

function addAndroidNativeModules(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const pkgName =
        config.android?.package || config.android?.packageName || config.slug;
      const pkgPath = pkgName.replace(/\./g, "/");
      const dest = path.join(root, "android/app/src/main/java", pkgPath);

      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

      const templateDir = path.join(__dirname, "templates", "android");
      const files = [
        "PoilabsPackage.java",
        "PoiMapModule.java",
        "PoiMapViewManager.java",
        "PoiMapFragment.java",
        "PoilabsNavigationModule.java",
      ];

      for (const file of files) {
        const src = path.join(templateDir, file);
        let content = fs.readFileSync(src, "utf8");
        content = content.replace(/__PACKAGE_NAME__/g, pkgName);
        fs.writeFileSync(path.join(dest, file), content, "utf8");
      }

      // Create layout resource directory if not exists
      const layoutDir = path.join(root, "android/app/src/main/res/layout");
      if (!fs.existsSync(layoutDir)) fs.mkdirSync(layoutDir, { recursive: true });

      // Create layout file
      const layoutPath = path.join(layoutDir, "fragment_poi_map.xml");
      const layoutContent = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/mapLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
        
</FrameLayout>`;
      fs.writeFileSync(layoutPath, layoutContent, "utf8");

      // Update MainApplication.java to register the package
      const mainAppPath = path.join(dest, "MainApplication.java");
      if (fs.existsSync(mainAppPath)) {
        let mainAppContent = fs.readFileSync(mainAppPath, "utf8");
        
        // If the package is not already registered
        if (!mainAppContent.includes("new PoilabsPackage()")) {
          // Add import
          if (!mainAppContent.includes(`import ${pkgName}.PoilabsPackage;`)) {
            const importIndex = mainAppContent.lastIndexOf("import ");
            const importEndIndex = mainAppContent.indexOf(";", importIndex);
            mainAppContent = mainAppContent.substring(0, importEndIndex + 1) + 
                            `\nimport ${pkgName}.PoilabsPackage;` + 
                            mainAppContent.substring(importEndIndex + 1);
          }
          
          // Add package to getPackages()
          mainAppContent = mainAppContent.replace(
            /protected List<ReactPackage> getPackages\(\) \{[\s\S]*?return packages;\s*\}/,
            (match) => {
              return match.replace(
                /return packages;/,
                "packages.add(new PoilabsPackage());\n        return packages;"
              );
            }
          );
          
          fs.writeFileSync(mainAppPath, mainAppContent, "utf8");
        }
      }

      return modConfig;
    },
  ]);
}

const pkg = { name: "@poilabs-dev/navigation-sdk-plugin", version: "1.0.0" };
module.exports = createRunOncePlugin(
  (config, props = {}) => {
    // Ensure default tokens if not provided
    const { mapboxToken = "MAPBOX_TOKEN", jitpackToken = "JITPACK_TOKEN" } = props;
    
    config = addProjectRepositories(config, { mapboxToken, jitpackToken });
    config = addAppGradleSettings(config);
    config = addAndroidPermissions(config);
    config = addIOSInfoPlist(config);
    config = addIOSPods(config);
    config = addIOSNativeModules(config);
    config = addAndroidNativeModules(config);
    return config;
  },
  pkg.name,
  pkg.version
);