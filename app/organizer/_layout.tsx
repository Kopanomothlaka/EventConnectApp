import React from 'react';
import { Stack } from 'expo-router';

export default function OrganizerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-event" />
      <Stack.Screen name="edit-event" />
    </Stack>
  );
} 