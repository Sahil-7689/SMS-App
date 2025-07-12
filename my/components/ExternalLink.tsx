import React from 'react';
import { Text, Linking, Pressable } from 'react-native';

export default function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Pressable onPress={() => Linking.openURL(href)}>
      <Text style={{ color: 'blue' }}>{children || href}</Text>
    </Pressable>
  );
}
