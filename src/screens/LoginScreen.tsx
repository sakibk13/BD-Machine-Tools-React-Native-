import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { encode } from 'base-64';

const { width, height } = Dimensions.get('window');

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://bdmachinetools.com';

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorDesc, setErrorDesc] = useState('');

  const showError = (title: string, desc: string) => {
    setErrorTitle(title);
    setErrorDesc(desc);
    setErrorModalVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter both username and password.',
        position: 'bottom'
      });
      return;
    }
    
    setLoading(true);
    try {
      const cleanBaseUrl = SITE_URL.trim().replace(/\/$/, '');
      const loginUrl = `${cleanBaseUrl}/wp-json/wp/v2/users/me`;
      
      const auth = encode(`${username.trim()}:${password.trim()}`);
      
      const response = await fetch(loginUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      if (response.status === 200 && data.id) {
        const rolesString = JSON.stringify(data.roles || '').toLowerCase();
        const isAdmin = rolesString.includes('administrator') || rolesString.includes('shop_manager');
        
        if (isAdmin || username.toLowerCase() === 'admin') {
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('user_auth', auth);
          await AsyncStorage.setItem('user_data', JSON.stringify(data));
          
          Toast.show({
            type: 'success',
            text1: 'Access Granted',
            text2: `Welcome back, ${data.name || username}`,
            position: 'bottom'
          });
          navigation.replace('Main');
        } else {
          showError('Access Denied', `Your account (${data.name}) does not have Administrator or Shop Manager permissions.`);
        }
      } else {
        const errorMsg = data.message || 'The username or password you entered is incorrect.';
        showError('Login Failed', errorMsg + '\n\nHint: Use your WordPress Application Password for a secure connection.');
      }
    } catch (error: any) {
      showError('Connection Error', 'Could not reach the server. Please check your internet connection and SITE_URL settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient colors={Colors.gradient} style={StyleSheet.absoluteFill} />
      <View style={styles.meshContainer}>
        <View style={[styles.meshCircle, { top: -100, left: -50, backgroundColor: Colors.accent }]} />
        <View style={[styles.meshCircle, { bottom: -150, right: -100, backgroundColor: Colors.secondary, width: 400, height: 400 }]} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.header}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoInner}>
                <Image 
                  source={require('../../assets/logo.jpeg')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.brandName}>BD Machine Tools</Text>
            <Text style={styles.brandSlogan}>Advanced Inventory Terminal</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300).duration(1000).springify()}
            style={styles.glassCard}
          >
            <Text style={styles.loginTitle}>Authorized Access</Text>
            <Text style={styles.loginSubtitle}>Provide your workstation credentials</Text>

            <View style={styles.form}>
              <CustomInput
                label="Identifier (Admin ID/Email)"
                placeholder="e.g. admin_shakib"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                icon="verified-user"
              />
              
              <View style={styles.passwordWrapper}>
                <CustomInput
                  label="Secure Token / Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  icon="vpn-key"
                />
                <TouchableOpacity 
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.forgotRow}>
                <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <MaterialIcons name="check" size={14} color={Colors.white} />}
                  </View>
                  <Text style={styles.rememberText}>Save for 30 days</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Reset Token</Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="INITIATE LOGIN"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerNote}>SECURE NODE: {SITE_URL.replace('https://', '')}</Text>
            <Text style={styles.versionText}>System Version 2.0.4-Gold</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Professional Error Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="security" size={40} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalDesc}>{errorDesc}</Text>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    opacity: 0.4,
  },
  meshCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 68,
    backgroundColor: Colors.white,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  brandSlogan: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: Colors.glass,
    borderRadius: 35,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
    marginBottom: 32,
  },
  form: {
    gap: 4,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    padding: 10,
    zIndex: 10,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  rememberText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  forgotText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '800',
  },
  loginBtn: {
    height: 60,
    borderRadius: 18,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerLine: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  versionText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 35,
  },
  modalCloseBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
});

export default LoginScreen;
