import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PersonalityDimension {
  dimension: string;
  percentage: number;
}

interface PersonalityChartProps {
  dimensions: PersonalityDimension[];
}

export default function PersonalityChart({ dimensions }: PersonalityChartProps) {
  return (
    <View style={styles.container}>
      {dimensions.map((item, index) => (
        <View key={index} style={styles.dimensionRow}>
          <Text style={styles.dimensionLabel}>{item.dimension}</Text>
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.barFill, 
                  { width: `${item.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.percentageText}>{item.percentage}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
    minWidth: 35,
    textAlign: 'right',
  },
});