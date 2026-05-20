import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';

const ADMIN_URL = process.env.EXPO_PUBLIC_ADMIN_URL || 'https://bdmachinetools.com/wp-admin/';

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
