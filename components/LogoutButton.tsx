import React from 'react';
import { TouchableOpacity, Alert, StyleSheet, Text, Platform } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

interface LogoutButtonProps {
  size?: number;
  color?: string;
  style?: any;
  showText?: boolean;
  textStyle?: any;
}

export default function LogoutButton({ 
  size = 20, 
  color = Colors.textSecondary,
  style,
  showText = false,
  textStyle
}: LogoutButtonProps) {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('LogoutButton pressed');
              await signOut();
              console.log('signOut finished');
              // Fallback: force navigation to login
              router.replace('/auth/login');
              // Only use window.location.href on web
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={handleLogout}
    >
      <LogOut size={size} color={color} />
      {showText && (
        <Text style={[styles.text, { color }, textStyle]}>Logout</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  text: {
    ...Typography.body,
    fontWeight: '500',
  },
}); 