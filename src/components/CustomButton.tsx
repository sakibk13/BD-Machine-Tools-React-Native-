import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: any;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

const CustomButton = ({ title, onPress, loading, style, variant = 'primary' }: CustomButtonProps) => {
  const isOutline = variant === 'outline';
  
  const getContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline && { color: Colors.primary }
        ]}>
          {title}
        </Text>
      )}
    </View>
  );

  if (isOutline) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={loading}
        style={[styles.button, styles.outline, style]}
        activeOpacity={0.7}
      >
        {getContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      style={[styles.button, styles.shadow, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={variant === 'danger' ? [Colors.error, '#D32F2F'] : Colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {getContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  outline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default CustomButton;
