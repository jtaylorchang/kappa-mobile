import { Platform } from 'react-native';
import { notificationAsync, NotificationFeedbackType, impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

export type TNotificationHaptic = NotificationFeedbackType;
export type TImpactHaptic = ImpactFeedbackStyle;

/**
 * Make a haptic notification.
 */
export const hapticNotification = (type: TNotificationHaptic = NotificationFeedbackType.Success) => {
  if (Platform.OS === 'ios') {
    notificationAsync(type);
  }
};

/**
 * Make a haptic impact.
 */
export const hapticImpact = (type: TImpactHaptic = ImpactFeedbackStyle.Light) => {
  if (Platform.OS === 'ios') {
    impactAsync(type);
  }
};
