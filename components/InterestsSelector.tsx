import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { INTERESTS_LIST } from '@/utils/locationData';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
}

export default function InterestsSelector({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10
}: InterestsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInterests = INTERESTS_LIST.filter(interest =>
    interest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Remove interest
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < maxSelections) {
      // Add interest if under limit
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    onInterestsChange(selectedInterests.filter(i => i !== interest));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Select Your Interests ({selectedInterests.length}/{maxSelections})
      </Text>
      <Text style={styles.subtitle}>
        Choose up to {maxSelections} interests that represent you
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search interests..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      </View>

      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>Selected Interests:</Text>
          <View style={styles.selectedContainer}>
            {selectedInterests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={styles.selectedChip}
                onPress={() => handleRemoveInterest(interest)}
              >
                <Text style={styles.selectedChipText}>{interest}</Text>
                <X size={16} color="white" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Available Interests */}
      <ScrollView style={styles.interestsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.interestsGrid}>
          {filteredInterests.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            const isDisabled = !isSelected && selectedInterests.length >= maxSelections;
            
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  isSelected && styles.interestChipSelected,
                  isDisabled && styles.interestChipDisabled
                ]}
                onPress={() => handleInterestToggle(interest)}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.interestChipText,
                  isSelected && styles.interestChipTextSelected,
                  isDisabled && styles.interestChipTextDisabled
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedInterests.length >= maxSelections && (
        <View style={styles.limitMessage}>
          <Text style={styles.limitText}>
            You've reached the maximum of {maxSelections} interests. Remove some to add others.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  selectedSection: {
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 12,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  interestsContainer: {
    flex: 1,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestChipSelected: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  interestChipDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  interestChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  interestChipTextSelected: {
    color: '#6366f1',
  },
  interestChipTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  limitMessage: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  limitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});