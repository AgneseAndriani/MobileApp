import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const isWeb = Platform.OS === 'web';
  const maxWidth = 430; // come un iPhone

  return (
    <View style={styles.root}>
      <View style={[styles.content, isWeb && { width: maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee', // sfondo esterno grigino
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
});
