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

// Android resources to copy
const ANDROID_RESOURCES = [
  {
    source: "fragment_poi_map.xml",
    destination: "layout/fragment_poi_map.xml",
  },
];

// Android module files
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
          maven { url 'https://oss.jfrog.org/artifactory/oss-snapshot-local/' }`;

      if (!text.includes("api.mapbox.com/downloads")) {
        text = text.replace(
          /allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?\}/,
          repoBlock
        );
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

      if (!fs.existsSync(appGradle)) {
        console.warn(
          "android/app/build.gradle not found, skipping gradle setup"
        );
        return modConfig;
      }

      let text = fs.readFileSync(appGradle, "utf8");

      // Compile SDK version
      if (!text.includes("compileSdkVersion 34")) {
        text = text.replace(/compileSdkVersion\s*\d+/, "compileSdkVersion 34");
      }

      // Min SDK version
      if (!text.includes("minSdkVersion 24")) {
        text = text.replace(/minSdkVersion\s*\d+/, "minSdkVersion 24");
      }

      // MultiDex
      if (!text.includes("multiDexEnabled true")) {
        text = text.replace(
          /defaultConfig\s*\{([\s\S]*?)\}/,
          (match, inner) => {
            if (!inner.includes("multiDexEnabled true")) {
              return match.replace(
                /applicationId [^\n]+/,
                "$&\n        multiDexEnabled true"
              );
            }
            return match;
          }
        );
      }

      // Dependencies
      const dependencies = [
        "implementation 'androidx.multidex:multidex:2.0.1'",
        "implementation 'com.github.poiteam:Android-Navigation-SDK:4.4.1'",
      ];

      dependencies.forEach((dep) => {
        if (!text.includes(dep)) {
          text = text.replace(
            /dependencies\s*\{/,
            `dependencies {\n    ${dep}`
          );
        }
      });

      fs.writeFileSync(appGradle, text);
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

      // Ensure all resource directories exist
      ANDROID_RESOURCES.forEach((resource) => {
        const destDir = path.dirname(path.join(resDir, resource.destination));
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
      });

      // Copy resource files
      const templateDir = path.join(__dirname, "..", "src", "android");
      ANDROID_RESOURCES.forEach((resource) => {
        const srcFile = path.join(templateDir, resource.source);
        const destFile = path.join(resDir, resource.destination);

        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, destFile);
          console.log(`Copied Android resource: ${destFile}`);
        } else {
          console.warn(`Source file not found: ${srcFile}`);
        }
      });

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

      // Copy native modules
      const templateDir = path.join(__dirname, "..", "src", "android");

      ANDROID_MODULE_FILES.forEach((file) => {
        const srcFile = path.join(templateDir, file);
        const destFile = path.join(srcDir, file);

        if (fs.existsSync(srcFile)) {
          let content = fs.readFileSync(srcFile, "utf8");
          content = content.replace(/__PACKAGE_NAME__/g, packageName);
          fs.writeFileSync(destFile, content, "utf8");
          console.log(`Copied Android module file: ${destFile}`);
        } else {
          console.warn(`Source file not found: ${srcFile}`);
        }
      });

      // Update MainApplication.java
      const mainAppPath = path.join(srcDir, "MainApplication.java");
      if (fs.existsSync(mainAppPath)) {
        let content = fs.readFileSync(mainAppPath, "utf8");

        // Add import
        if (!content.includes(`import ${packageName}.PoilabsPackage;`)) {
          content = content.replace(
            /(import.*?;)(\s*\n\s*public class)/,
            `$1\nimport ${packageName}.PoilabsPackage;$2`
          );
        }

        // Add package to list
        if (!content.includes("new PoilabsPackage()")) {
          content = content.replace(
            /(return packages;)/,
            `packages.add(new PoilabsPackage());\n        $1`
          );
        }

        fs.writeFileSync(mainAppPath, content, "utf8");
        console.log(`Updated MainApplication.java in ${mainAppPath}`);
      } else {
        console.warn(`MainApplication.java not found at ${mainAppPath}`);
      }

      return modConfig;
    },
  ]);
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
      
      if (!content.includes("android.enableJetifier=true")) {
        content += "\nandroid.enableJetifier=true\n";
        fs.writeFileSync(propertiesPath, content, "utf8");
        console.log("Added android.enableJetifier=true to gradle.properties");
      }
      
      if (!content.includes("android.useAndroidX=true")) {
        content += "\nandroid.useAndroidX=true\n";
        fs.writeFileSync(propertiesPath, content, "utf8");
        console.log("Added android.useAndroidX=true to gradle.properties");
      }

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
