import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="carousel" options={{ headerShown: false }} />
      <Stack.Screen name="clickers" options={{ headerShown: false }} />
    </Stack>
  );
}
