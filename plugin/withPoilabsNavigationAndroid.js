const {
  withDangerousMod,
  withAndroidManifest,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Android permissions
const ANDROID_PERMISSIONS = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.BLUETOOTH_CONNECT",
  "android.permission.BLUETOOTH_SCAN",
  "android.permission.BLUETOOTH",
  "android.permission.BLUETOOTH_ADMIN",
];

const ANDROID_RESOURCES = [
  {
    source: "fragment_poi_map.xml",
    destination: "layout/fragment_poi_map.xml",
  },
];

const ANDROID_MODULE_FILES = [
  "PoiMapFragment.java",
  "PoiMapModule.java",
  "PoiMapViewManager.java",
  "PoilabsPackage.java",
];

function addProjectRepositories(config, { mapboxToken, jitpackToken }) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const projBuild = path.join(root, "android/build.gradle");

      if (!fs.existsSync(projBuild)) {
        console.warn(
          "android/build.gradle not found, skipping repository setup"
        );
        return modConfig;
      }

      let text = fs.readFileSync(projBuild, "utf8");

      const repoBlock = `allprojects {
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
                password = '${mapboxToken}'
            }
        }
        maven {
            url "https://jitpack.io"
            credentials { username = '${jitpackToken}' }
        }
        maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local/' }
        jcenter() // Eski dependency'ler için
    }
}`;

      if (text.includes("allprojects {")) {
        text = text.replace(/allprojects\s*\{[\s\S]*?\n\}/m, repoBlock);
      } else {
        text += "\n" + repoBlock + "\n";
      }

      fs.writeFileSync(projBuild, text, "utf8");
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

      if (!fs.existsSync(appGradle)) {
        console.warn(
          "android/app/build.gradle not found, skipping gradle setup"
        );
        return modConfig;
      }

      let text = fs.readFileSync(appGradle, "utf8");

      if (!text.includes("compileSdkVersion 34")) {
        text = text.replace(/compileSdkVersion\s*\d+/, "compileSdkVersion 34");
      }

      if (!text.includes("minSdkVersion 24")) {
        text = text.replace(/minSdkVersion\s*\d+/, "minSdkVersion 24");
      }

      if (!text.includes("targetSdkVersion 34")) {
        text = text.replace(/targetSdkVersion\s*\d+/, "targetSdkVersion 34");
      }

      if (!text.includes("multiDexEnabled true")) {
        text = text.replace(
          /(defaultConfig\s*\{[\s\S]*?)(\n\s*})/,
          (match, content, ending) => {
            if (!content.includes("multiDexEnabled true")) {
              return content + "\n        multiDexEnabled true" + ending;
            }
            return match;
          }
        );
      }

      const compileOptions = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }`;

      if (!text.includes("compileOptions")) {
        text = text.replace(
          /(android\s*\{[\s\S]*?)(^\s*})$/m,
          `$1${compileOptions}\n$2`
        );
      }

      const dependencies = [
        "implementation 'androidx.multidex:multidex:2.0.1'",
        "implementation 'com.github.poiteam:Android-Navigation-SDK:4.4.1'",
        "implementation 'androidx.localbroadcastmanager:localbroadcastmanager:1.1.0'",
        "implementation 'androidx.fragment:fragment:1.6.2'",
      ];

      dependencies.forEach((dep) => {
        if (!text.includes(dep)) {
          text = text.replace(/(dependencies\s*\{)/, `$1\n    ${dep}`);
        }
      });

      fs.writeFileSync(appGradle, text, "utf8");
      return modConfig;
    },
  ]);
}

function addAndroidPermissions(config) {
  return withAndroidManifest(config, (mod) => {
    const { manifest } = mod.modResults;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    ANDROID_PERMISSIONS.forEach((permission) => {
      const exists = manifest["uses-permission"].some(
        (p) => p["$"]["android:name"] === permission
      );

      if (!exists) {
        manifest["uses-permission"].push({
          $: { "android:name": permission },
        });
      }
    });

    return mod;
  });
}

function addAndroidResources(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const resDir = path.join(root, "android/app/src/main/res");

      ANDROID_RESOURCES.forEach((resource) => {
        const destDir = path.dirname(path.join(resDir, resource.destination));
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
      });

      const layoutDir = path.join(resDir, "layout");
      if (!fs.existsSync(layoutDir)) {
        fs.mkdirSync(layoutDir, { recursive: true });
      }

      const fragmentLayoutContent = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/mapLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</FrameLayout>`;

      const fragmentLayoutPath = path.join(layoutDir, "fragment_poi_map.xml");
      fs.writeFileSync(fragmentLayoutPath, fragmentLayoutContent, "utf8");

      return modConfig;
    },
  ]);
}

function addAndroidNativeModules(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const packageName =
        config.android?.package ||
        config.android?.packageName ||
        `com.${config.slug}`;

      const packagePath = packageName.replace(/\./g, "/");
      const srcDir = path.join(root, "android/app/src/main/java", packagePath);

      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }

      const templateDir = path.join(__dirname, "..", "src", "android");

      ANDROID_MODULE_FILES.forEach((file) => {
        const srcFile = path.join(templateDir, file);
        const destFile = path.join(srcDir, file);

        if (fs.existsSync(srcFile)) {
          let content = fs.readFileSync(srcFile, "utf8");
          content = content.replace(/__PACKAGE_NAME__/g, packageName);
          fs.writeFileSync(destFile, content, "utf8");
        } else {
          console.warn(`Source file not found: ${srcFile}`);
        }
      });

      return modConfig;
    },
  ]);
}

function updateMainApplication(root, packageName) {
  const findMainApplication = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        const result = findMainApplication(path.join(dir, file.name));
        if (result) return result;
      } else if (file.name === "MainApplication.java") {
        return path.join(dir, file.name);
      }
    }
    return null;
  };

  const mainAppPath = findMainApplication(
    path.join(root, "android/app/src/main/java")
  );

  if (!mainAppPath) {
    return;
  }

  let content = fs.readFileSync(mainAppPath, "utf8");

  if (!content.includes(`import ${packageName}.PoilabsPackage;`)) {
    content = content.replace(
      /(import.*?;[\s\S]*?)(public class)/,
      `$1import ${packageName}.PoilabsPackage;\n\n$2`
    );
  }

  if (!content.includes("new PoilabsPackage()")) {
    content = content.replace(
      /(return packages;)/,
      `packages.add(new PoilabsPackage());\n        $1`
    );
  }

  fs.writeFileSync(mainAppPath, content, "utf8");
}

function addAndroidProperties(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const root = modConfig.modRequest.projectRoot;
      const propertiesPath = path.join(root, "android/gradle.properties");

      if (!fs.existsSync(propertiesPath)) {
        console.warn("android/gradle.properties not found, creating it");
        fs.writeFileSync(propertiesPath, "", "utf8");
      }

      let content = fs.readFileSync(propertiesPath, "utf8");

      const properties = [
        "android.enableJetifier=true",
        "android.useAndroidX=true",
        "org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m",
      ];

      properties.forEach((prop) => {
        if (!content.includes(prop)) {
          content += `\n${prop}\n`;
        }
      });

      fs.writeFileSync(propertiesPath, content, "utf8");
      return modConfig;
    },
  ]);
}

function withPoilabsNavigationAndroid(config, props = {}) {
  const { mapboxToken = "MAPBOX_TOKEN", jitpackToken = "JITPACK_TOKEN" } =
    props;

  config = addProjectRepositories(config, { mapboxToken, jitpackToken });
  config = addAppGradleSettings(config);
  config = addAndroidPermissions(config);
  config = addAndroidResources(config);
  config = addAndroidNativeModules(config);
  config = addAndroidProperties(config);

  return config;
}

module.exports = withPoilabsNavigationAndroid;
