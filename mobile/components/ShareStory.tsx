import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Share,
  StyleSheet,
  Pressable,
} from 'react-native';
import QRCodeSvg from 'react-native-qrcode-svg';

// Type workaround for React 19 compatibility
const QRCode = QRCodeSvg as unknown as React.ComponentType<{
  value: string;
  size: number;
  color: string;
  backgroundColor: string;
}>;
import { colors, fonts } from '../constants/theme';

const WEB_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

interface ShareStoryProps {
  storyId: string;
  storySlug: string;
  honoreeName: string;
}

export default function ShareStory({ storyId, storySlug, honoreeName }: ShareStoryProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const webUrl = `${WEB_BASE}/stories/${storySlug}`;
  const deepLinkUrl = `kukatonon://story/${storyId}`;
  // QR encodes a universal link that falls back to web if app not installed
  const qrUrl = `${WEB_BASE}/stories/${storySlug}?ref=qr`;

  async function handleShareLink() {
    setShowMenu(false);
    try {
      await Share.share({
        message: `In memory of ${honoreeName} — read their story on Kukatonon: ${webUrl}`,
        url: webUrl,
      });
    } catch {
      // User cancelled
    }
  }

  function handleShowQR() {
    setShowMenu(false);
    setShowQR(true);
  }

  return (
    <>
      {/* Share button */}
      <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.shareButton}>
        <Text style={styles.shareIcon}>{'\u2197'}</Text>
      </TouchableOpacity>

      {/* Share menu modal */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Share Story</Text>
            <Text style={styles.menuSubtitle}>In memory of {honoreeName}</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleShareLink}>
              <Text style={styles.menuItemIcon}>{'\u{1F517}'}</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Share Link</Text>
                <Text style={styles.menuItemDesc}>Send via messages, email, or social media</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShowQR}>
              <Text style={styles.menuItemIcon}>{'\u25A3'}</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Show QR Code</Text>
                <Text style={styles.menuItemDesc}>Let someone scan to open this story</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMenu(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* QR modal */}
      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowQR(false)}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Scan to Read</Text>
            <Text style={styles.qrSubtitle}>In memory of {honoreeName}</Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrUrl}
                size={220}
                color={colors.earth.darkest}
                backgroundColor={colors.white}
              />
            </View>
            <Text style={styles.qrHint}>
              Opens in the Kukatonon app or browser
            </Text>
            <TouchableOpacity style={styles.qrClose} onPress={() => setShowQR(false)}>
              <Text style={styles.qrCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.earth.gold + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: colors.earth.gold,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  menuTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    color: colors.earth.dark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.earth.warm,
    opacity: 0.7,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  menuItemIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.earth.dark,
  },
  menuItemDesc: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 1,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: colors.gray[500],
    fontWeight: '500',
  },
  qrContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  qrTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.earth.dark,
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: colors.earth.warm,
    opacity: 0.7,
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  qrHint: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 16,
    textAlign: 'center',
  },
  qrClose: {
    marginTop: 20,
    backgroundColor: colors.earth.gold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  qrCloseText: {
    color: colors.earth.darkest,
    fontSize: 15,
    fontWeight: '600',
  },
});
