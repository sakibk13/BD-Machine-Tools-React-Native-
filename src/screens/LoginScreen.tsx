import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={Colors.gradient} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Animated.View entering={FadeInUp.duration(1000).springify()}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.jpeg')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200).duration(800)}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to manage your inventory</Text>
            </Animated.View>
          </View>

          <Animated.View 
            entering={FadeInDown.delay(400).duration(800).springify()}
            style={styles.formContainer}
          >
            <CustomInput
              label="Email or Username"
              placeholder="admin@bdmt.com"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              icon="person"
            />
            
            <View style={styles.passwordWrapper}>
              <CustomInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="lock"
              />
              <TouchableOpacity 
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  size={22} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <MaterialIcons name="check" size={14} color={Colors.white} />}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title="SIGN IN"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
            <Text style={styles.footerNote}>© 2026 BD Machine Tools. Advanced Admin Terminal v1.2</Text>
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
              <MaterialIcons name="report-problem" size={40} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalDesc}>{errorDesc}</Text>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>GOT IT</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80, // Perfect circle
    backgroundColor: Colors.white,
    padding: 15, // Padding ensures the logo doesn't touch the circle edges
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 40,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    padding: 10,
    zIndex: 10,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  loginBtn: {
    height: 64,
    borderRadius: 20,
  },
  footer: {
    marginTop: 40,
  },
  footerNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
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
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  modalCloseBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
});

export default LoginScreen;
