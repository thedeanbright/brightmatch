import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { LOCATION_DATA, Country, State } from '@/utils/locationData';

interface LocationSelectorProps {
  selectedCountry: string;
  selectedState: string;
  selectedCity: string;
  onLocationChange: (country: string, state: string, city: string) => void;
}

export default function LocationSelector({
  selectedCountry,
  selectedState,
  selectedCity,
  onLocationChange
}: LocationSelectorProps) {
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Update available states when country changes
  useEffect(() => {
    const country = LOCATION_DATA.find(c => c.name === selectedCountry);
    if (country) {
      setAvailableStates(country.states);
      // Reset state and city if country changed
      if (selectedState && !country.states.find(s => s.name === selectedState)) {
        onLocationChange(selectedCountry, '', '');
      }
    } else {
      setAvailableStates([]);
    }
  }, [selectedCountry]);

  // Update available cities when state changes
  useEffect(() => {
    const state = availableStates.find(s => s.name === selectedState);
    if (state) {
      setAvailableCities(state.cities);
      // Reset city if state changed
      if (selectedCity && !state.cities.includes(selectedCity)) {
        onLocationChange(selectedCountry, selectedState, '');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedState, availableStates]);

  const handleCountrySelect = (country: Country) => {
    onLocationChange(country.name, '', '');
    setShowCountryModal(false);
  };

  const handleStateSelect = (state: State) => {
    onLocationChange(selectedCountry, state.name, '');
    setShowStateModal(false);
  };

  const handleCitySelect = (city: string) => {
    onLocationChange(selectedCountry, selectedState, city);
    setShowCityModal(false);
  };

  const renderDropdown = (
    title: string,
    value: string,
    placeholder: string,
    onPress: () => void,
    disabled: boolean = false
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{title} *</Text>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={disabled ? '#ccc' : '#666'} />
      </TouchableOpacity>
    </View>
  );

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: any[],
    onSelect: (item: any) => void,
    selectedValue: string,
    getDisplayText: (item: any) => string,
    getValue: (item: any) => string
  ) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {items.map((item, index) => {
              const isSelected = getValue(item) === selectedValue;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                    {getDisplayText(item)}
                  </Text>
                  {isSelected && <Check size={20} color="#6366f1" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderDropdown(
        'Country',
        selectedCountry,
        'Select your country',
        () => setShowCountryModal(true)
      )}

      {renderDropdown(
        'State/Province',
        selectedState,
        'Select your state/province',
        () => setShowStateModal(true),
        !selectedCountry || availableStates.length === 0
      )}

      {renderDropdown(
        'City',
        selectedCity,
        'Select your city',
        () => setShowCityModal(true),
        !selectedState || availableCities.length === 0
      )}

      {/* Country Modal */}
      {renderModal(
        showCountryModal,
        () => setShowCountryModal(false),
        'Select Country',
        LOCATION_DATA,
        handleCountrySelect,
        selectedCountry,
        (country: Country) => country.name,
        (country: Country) => country.name
      )}

      {/* State Modal */}
      {renderModal(
        showStateModal,
        () => setShowStateModal(false),
        'Select State/Province',
        availableStates,
        handleStateSelect,
        selectedState,
        (state: State) => state.name,
        (state: State) => state.name
      )}

      {/* City Modal */}
      {renderModal(
        showCityModal,
        () => setShowCityModal(false),
        'Select City',
        availableCities.map(city => ({ name: city })),
        (cityObj: { name: string }) => handleCitySelect(cityObj.name),
        selectedCity,
        (cityObj: { name: string }) => cityObj.name,
        (cityObj: { name: string }) => cityObj.name
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dropdownDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'white',
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#f8f9ff',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#6366f1',
    fontFamily: 'Inter-SemiBold',
  },
});