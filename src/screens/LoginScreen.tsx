import React, { useState } from 'react';
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
          showError('Access Denied', `Your account does not have Admin permissions.`);
        }
      } else {
        const errorMsg = data.message || 'Login failed.';
        showError('Login Failed', errorMsg);
      }
    } catch (error: any) {
      showError('Connection Error', 'Could not reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.brandSlogan}>Admin Hub</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.loginTitle}>Authorized Access</Text>
            
            <View style={styles.form}>
              <CustomInput
                label="Admin ID"
                placeholder="admin"
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
                  <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color={Colors.textSecondary} />
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
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="report-problem" size={40} color={Colors.error} />
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalDesc}>{errorDesc}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, justifyContent: 'center', paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoWrapper: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  logoInner: { width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.white, padding: 35, justifyContent: 'center', alignItems: 'center' },
  logo: { width: '100%', height: '100%' },
  brandName: { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  brandSlogan: { fontSize: 10, fontWeight: '700', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  glassCard: { backgroundColor: Colors.white, borderRadius: 30, padding: 25, elevation: 10 },
  loginTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 25 },
  form: { gap: 10 },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 15, bottom: 20, padding: 10, zIndex: 10 },
  loginBtn: { height: 56, borderRadius: 15, marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  modalContent: { width: '100%', backgroundColor: Colors.white, borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginVertical: 10 },
  modalDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  modalCloseBtn: { width: '100%', height: 50, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  modalCloseBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },
});

export default LoginScreen;
