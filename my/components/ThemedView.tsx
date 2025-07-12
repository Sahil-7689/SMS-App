import React from 'react';
import { View } from 'react-native';

export default function ThemedView({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: '#181A20', flex: 1 }}>{children}</View>;
}
