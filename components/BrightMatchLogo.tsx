import React from 'react';
import { Image, StyleSheet, ImageStyle } from 'react-native';

interface BrightMatchLogoProps {
  size?: number;
  style?: ImageStyle;
}

export default function BrightMatchLogo({ size = 64, style }: BrightMatchLogoProps) {
  return (
    <Image
      source={require('@/assets/images/BrightMatch logo.png')}
      style={[
        styles.logo,
        { width: size, height: size },
        style
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});