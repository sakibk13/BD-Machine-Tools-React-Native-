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
      // Create Basic Auth header from user's WordPress credentials
      const auth = encode(`${username}:${password}`);
      
      // We verify the credentials by calling the 'users/me' endpoint
      const response = await fetch(`${SITE_URL}/wp-json/wp/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 200 && (data.roles.includes('administrator') || data.roles.includes('shop_manager'))) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        // Store credentials for the session to be used by the API utility
        await AsyncStorage.setItem('user_auth', auth);
        await AsyncStorage.setItem('user_data', JSON.stringify(data));
        
        Toast.show({
          type: 'success',
          text1: 'Access Granted',
          text2: `Welcome back, ${data.name}`,
          position: 'bottom'
        });
        navigation.replace('Main');
      } else if (response.status === 200) {
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'Only Admins can access this hub.',
          position: 'bottom'
        });
      } else {
        console.log('Login failed status:', response.status, data);
        Alert.alert(
          'Login Failed',
          'Invalid credentials. \n\nTIP: If your site has extra security, please use an "Application Password" from your WordPress profile (Users > Profile > Application Passwords).',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Could not connect to the site. Please check your internet.',
        position: 'bottom'
      });
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
});

export default LoginScreen;
