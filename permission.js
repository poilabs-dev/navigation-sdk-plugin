import { Platform, PermissionsAndroid, Alert } from "react-native";

const REQUIRED_ANDROID_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
];

export async function askRuntimePermissionsIfNeeded() {
  if (Platform.OS === "android") {
    try {
      const grants = await PermissionsAndroid.requestMultiple(
        REQUIRED_ANDROID_PERMISSIONS
      );

      const deniedPermissions = Object.keys(grants).filter(
        (permission) =>
          grants[permission] !== PermissionsAndroid.RESULTS.GRANTED
      );

      if (deniedPermissions.length > 0) {
        console.warn("Some permissions were denied:", deniedPermissions);
        Alert.alert(
          "İzinler Gerekli",
          "Bu uygulama konum ve Bluetooth izinlerine ihtiyaç duyar. Lütfen ayarlardan izinleri etkinleştirin.",
          [{ text: "Tamam" }]
        );
      }

      return deniedPermissions.length === 0;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  } else if (Platform.OS === "ios") {
    return true;
  }

  return true;
}

export async function checkAllPermissions() {
  if (Platform.OS === "android") {
    try {
      for (const permission of REQUIRED_ANDROID_PERMISSIONS) {
        const granted = await PermissionsAndroid.check(permission);
        if (!granted) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }

  return true;
}

export async function startScanIfPermissionsGranted() {
  const hasPermissions = await checkAllPermissions();

  if (!hasPermissions) {
    console.warn("Permissions not granted, cannot start scan");
    return false;
  }

  return true;
}
