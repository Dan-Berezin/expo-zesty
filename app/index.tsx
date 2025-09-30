// app/_layout.tsx
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {

  return (
   <Redirect href="/carousel" />
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#966FFF", // your desired splash color
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
});
