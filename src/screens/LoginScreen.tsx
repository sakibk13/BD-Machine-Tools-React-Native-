import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { encode } from 'base-64';

const { width } = Dimensions.get('window');

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
        text1: 'Error',
        text2: 'Please enter your ID and password.',
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
          if (rememberMe) {
            await AsyncStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
          } else {
            await AsyncStorage.removeItem('rememberedUser');
          }

          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('user_auth', auth);
          await AsyncStorage.setItem('user_data', JSON.stringify(data));
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: `Welcome, ${data.name || username}`,
            position: 'bottom'
          });
          navigation.replace('Main');
        } else {
          showError('Access Denied', `You do not have permission to access this app.`);
        }
      } else {
        const errorMsg = data.message || 'Login failed.';
        showError('Login Failed', errorMsg);
      }
    } catch (error: any) {
      showError('Connection Error', 'Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRemembered = async () => {
      const saved = await AsyncStorage.getItem('rememberedUser');
      if (saved) {
        const { username, password } = JSON.parse(saved);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
      }
    };
    loadRemembered();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <View style={styles.logoOuterCircle}>
              <View style={styles.logoInnerCircle}>
                <Image 
                  source={require('../../assets/logo.jpg')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.brandTitle}>BD MACHINE TOOLS</Text>
            <Text style={styles.brandTagline}>INVENTORY SYSTEM</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.loginHeader}>Login</Text>
            <Text style={styles.loginSubheader}>Sign in to manage your products</Text>

            <View style={styles.inputGap}>
              <CustomInput
                label="User ID"
                placeholder="Username"
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
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={22} color={Colors.accent} />
                </TouchableOpacity>
              </View>

              <View style={styles.rememberRow}>
                <TouchableOpacity 
                  style={styles.checkboxRow} 
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <MaterialIcons 
                    name={rememberMe ? "check-box" : "check-box-outline-blank"} 
                    size={22} 
                    color={rememberMe ? Colors.primary : Colors.textMuted} 
                  />
                  <Text style={styles.rememberText}>Remember Me</Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="LOGIN"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerNote}>SECURE CONNECTION</Text>
            <Text style={styles.versionText}>v3.1.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="error-outline" size={44} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalDesc}>{errorDesc}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scrollContent: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 40, justifyContent: 'center' },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  logoInnerCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: Colors.white,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: '100%', height: '100%' },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
    marginTop: 5,
    letterSpacing: 3,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 35,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  loginHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 5,
  },
  loginSubheader: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  inputGap: {
    gap: 15,
  },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 15, bottom: 15, padding: 10, zIndex: 10 },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginBtn: { 
    height: 60, 
    borderRadius: 18, 
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  footer: { marginTop: 40, alignItems: 'center' },
  footerNote: { fontSize: 10, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '900', letterSpacing: 2 },
  versionText: { fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 30, padding: 35, alignItems: 'center' },
  modalIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.error + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 10 },
  modalDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalCloseBtn: { width: '100%', height: 60, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  modalCloseBtnText: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
});

export default LoginScreen;
