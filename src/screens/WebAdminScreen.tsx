import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';
// @ts-ignore
import { ADMIN_URL } from '@env';

const WebAdminScreen = () => {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: ADMIN_URL }} 
        style={styles.webview}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webview: {
    flex: 1,
  },
});

export default WebAdminScreen;
