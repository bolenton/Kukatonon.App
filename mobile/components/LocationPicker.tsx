import { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { fonts } from '../constants/theme';

// Centered on Liberia
const LIBERIA_REGION: Region = {
  latitude: 6.4281,
  longitude: -9.4295,
  latitudeDelta: 4.5,
  longitudeDelta: 4.5,
};

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempPin, setTempPin] = useState<{ latitude: number; longitude: number } | null>(
    value ? { latitude: value.latitude, longitude: value.longitude } : null
  );
  const [tempName, setTempName] = useState(value?.name || '');

  function handleMapPress(e: MapPressEvent) {
    setTempPin(e.nativeEvent.coordinate);
  }

  function handleConfirm() {
    if (tempPin) {
      onChange({
        latitude: tempPin.latitude,
        longitude: tempPin.longitude,
        name: tempName.trim(),
      });
    }
    setShowModal(false);
  }

  function handleClear() {
    onChange(null);
    setTempPin(null);
    setTempName('');
    setShowModal(false);
  }

  function openPicker() {
    // Reset temp state to current value when opening
    setTempPin(value ? { latitude: value.latitude, longitude: value.longitude } : null);
    setTempName(value?.name || '');
    setShowModal(true);
  }

  return (
    <>
      {/* Trigger / Preview */}
      {value ? (
        <View style={[styles.preview, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={styles.previewMapContainer}>
            <MapView
              style={styles.previewMap}
              region={{
                latitude: value.latitude,
                longitude: value.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: value.latitude, longitude: value.longitude }} />
            </MapView>
          </View>
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { color: colors.text }]} numberOfLines={1}>
              {value.name || 'Location selected'}
            </Text>
            <Text style={[styles.previewCoords, { color: colors.textMuted }]}>
              {value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
            </Text>
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity onPress={openPicker} style={styles.previewBtn}>
              <MaterialIcons name="edit" size={18} color={colors.earth.gold} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={styles.previewBtn}>
              <MaterialIcons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.border }]}
          onPress={openPicker}
        >
          <MaterialIcons name="place" size={28} color={colors.textMuted} />
          <Text style={[styles.addButtonText, { color: colors.textMuted }]}>
            Add Event Location
          </Text>
          <Text style={[styles.addButtonHint, { color: colors.textMuted }]}>
            Tap to mark where events took place
          </Text>
        </TouchableOpacity>
      )}

      {/* Full-screen Map Modal */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          style={[styles.modal, { backgroundColor: colors.bg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.headerText }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.headerText }]}>Select Location</Text>
            <TouchableOpacity onPress={handleConfirm} disabled={!tempPin}>
              <Text style={[styles.modalDone, { color: tempPin ? colors.earth.gold : colors.textMuted }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instruction */}
          <View style={[styles.instruction, { backgroundColor: colors.earth.gold + '18' }]}>
            <MaterialIcons name="touch-app" size={18} color={colors.earth.gold} />
            <Text style={[styles.instructionText, { color: colors.text }]}>
              Tap the map to place a pin where the events took place
            </Text>
          </View>

          {/* Map */}
          <MapView
            style={styles.map}
            initialRegion={
              tempPin
                ? { ...tempPin, latitudeDelta: 0.5, longitudeDelta: 0.5 }
                : LIBERIA_REGION
            }
            onPress={handleMapPress}
          >
            {tempPin && <Marker coordinate={tempPin} />}
          </MapView>

          {/* Location name input */}
          {tempPin && (
            <View style={[styles.nameInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="label-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.nameInput, { color: colors.text }]}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Name this location (e.g. Monrovia, Nimba County)"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger button (when no location selected)
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  addButtonText: { fontSize: 14, fontWeight: '600' },
  addButtonHint: { fontSize: 11 },

  // Preview (when location is selected)
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  previewMapContainer: { width: 72, height: 72 },
  previewMap: { width: '100%', height: '100%' },
  previewInfo: { flex: 1, paddingHorizontal: 10 },
  previewName: { fontSize: 14, fontWeight: '600' },
  previewCoords: { fontSize: 11, marginTop: 2 },
  previewActions: { flexDirection: 'row', gap: 4, paddingRight: 8 },
  previewBtn: { padding: 6 },

  // Modal
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
  },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700' },
  modalDone: { fontSize: 16, fontWeight: '700' },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  instructionText: { fontSize: 13, flex: 1 },
  map: { flex: 1 },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    paddingBottom: 34,
  },
  nameInput: { flex: 1, fontSize: 15 },
});
