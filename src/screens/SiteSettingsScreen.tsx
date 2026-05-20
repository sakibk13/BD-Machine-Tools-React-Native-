import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
// @ts-ignore
import { SUPPORT_EMAIL } from '@env';

const SiteSettingsScreen = ({ navigation }: any) => {
  const [copyright, setCopyright] = useState('© 2026 BD Machine Tools. All Rights Reserved.');
  const [address, setAddress] = useState('123 Industrial Area, Dhaka, Bangladesh');
  const [phone, setPhone] = useState('+880 1234-567890');
  const [email, setEmail] = useState(SUPPORT_EMAIL || 'info@bdmachinetools.com');
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    // Artificial delay as per spec
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Website settings updated successfully!');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Website Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Metadata</Text>
          <View style={styles.form}>
            <CustomInput
              label="Copyright Text (Footer)"
              placeholder="Enter copyright notice..."
              value={copyright}
              onChangeText={setCopyright}
            />
            <CustomInput
              label="Physical Address"
              placeholder="Enter business address..."
              value={address}
              onChangeText={setAddress}
              // @ts-ignore
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.form}>
            <CustomInput
              label="Support Hotline"
              placeholder="+880..."
              value={phone}
              onChangeText={setPhone}
              // @ts-ignore
              keyboardType="phone-pad"
            />
            <CustomInput
              label="Business Email"
              placeholder="admin@example.com"
              value={email}
              onChangeText={setEmail}
              // @ts-ignore
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <CustomButton 
          title="UPDATE SETTINGS" 
          onPress={handleUpdate} 
          loading={loading}
          style={styles.submitBtn}
        />
        
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={Colors.accent} />
          <Text style={styles.infoText}>
            These settings update global variables displayed on the website frontend and mobile app footers.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  form: { gap: 8 },
  submitBtn: { height: 60, borderRadius: 20 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.accent + '10',
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: Colors.accent,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default SiteSettingsScreen;
