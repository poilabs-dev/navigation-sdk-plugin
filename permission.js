import { Platform, PermissionsAndroid, Alert } from "react-native";
import * as Location from "expo-location";

export async function askRuntimePermissionsIfNeeded() {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);
  } else {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") Alert.alert("Location permission required");
  }
}

export async function checkAllPermissions() {
  return true;
}

export async function startScanIfPermissionsGranted() {
  return true;
}
