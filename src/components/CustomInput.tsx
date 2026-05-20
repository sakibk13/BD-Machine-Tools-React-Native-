import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface CustomInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

const CustomInput = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  autoCapitalize,
  icon,
  keyboardType,
  multiline,
  numberOfLines
}: CustomInputProps) => {
  const focusValue = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusValue.value,
        [0, 1],
        [Colors.border, Colors.primary]
      ),
      borderWidth: withTiming(focusValue.value ? 2 : 1.5),
      transform: [{ scale: withTiming(focusValue.value ? 1.01 : 1) }],
      backgroundColor: interpolateColor(
        focusValue.value,
        [0, 1],
        [Colors.inputBackground, Colors.white]
      ),
    };
  });

  const onFocus = () => {
    focusValue.value = withTiming(1, { duration: 250 });
  };

  const onBlur = () => {
    focusValue.value = withTiming(0, { duration: 250 });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputWrapper, animatedContainerStyle, multiline && styles.multilineWrapper]}>
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={20} 
            color={focusValue.value ? Colors.primary : Colors.textSecondary} 
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  multilineWrapper: {
    height: 'auto',
    minHeight: 120,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  multilineInput: {
    height: 100,
  },
});

export default CustomInput;
