import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../constants/AuthContext';
import { colors as sc, fonts } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ visible, onClose }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setEmail('');
      setPassword('');
      setLoading(false);
      onClose();
    }
  }

  function handleClose() {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdropPress} onPress={handleClose} />
        <View style={styles.container}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <MaterialIcons name="admin-panel-settings" size={32} color={sc.earth.gold} />
            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>Sign in to manage stories</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@kukatonon.app"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={sc.earth.darkest} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: sc.earth.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: sc.earth.darkest,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelText: {
    color: '#888',
    fontSize: 15,
  },
});
