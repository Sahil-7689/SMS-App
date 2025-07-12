import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground() {
  return <View style={{ backgroundColor: '#23262F', flex: 1 }} />;
}

export function useBottomTabOverflow() {
  return 0;
}
