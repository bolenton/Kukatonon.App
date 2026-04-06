import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Haptics are iOS/Android only — on web or unsupported devices the calls
// become no-ops. Every wrapper swallows errors so haptics never break the UI.

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export function tapLight() {
  if (!isSupported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function tapMedium() {
  if (!isSupported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function tapHeavy() {
  if (!isSupported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

export function selectionTick() {
  if (!isSupported) return;
  Haptics.selectionAsync().catch(() => {});
}

export function notifySuccess() {
  if (!isSupported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function notifyWarning() {
  if (!isSupported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

export function notifyError() {
  if (!isSupported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
