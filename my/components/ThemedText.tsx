import React from 'react';
import { Text } from 'react-native';

export default function ThemedText({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: '#fff' }}>{children}</Text>;
}
