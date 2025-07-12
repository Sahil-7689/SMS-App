import React from 'react';
import { View, Text } from 'react-native';

export default function Collapsible({ children }: { children: React.ReactNode }) {
  return <View>{children || <Text>Collapsible Placeholder</Text>}</View>;
}
