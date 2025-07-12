import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ViewStyle, StyleProp } from 'react-native';

interface IconSymbolProps {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function IconSymbol({ name, size = 24, color = '#000', style }: IconSymbolProps) {
  return <FontAwesome name={name} size={size} color={color} style={style} />;
}
