import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#10151b',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="role" />
      </Stack>
    </>
  );
} 