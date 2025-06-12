import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface ImageCarouselProps {
  images: string[];
  style?: any;
  showControls?: boolean;
  aspectRatio?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageCarousel({ 
  images, 
  style, 
  showControls = true, 
  aspectRatio = 1.2 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, style, { aspectRatio }]}>
        <View style={styles.placeholder}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg' }}
            style={styles.image}
          />
        </View>
      </View>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  return (
    <View style={[styles.container, style, { aspectRatio }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(newIndex);
        }}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={[styles.image, { width: screenWidth - 40 }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {showControls && images.length > 1 && (
        <>
          <TouchableOpacity style={styles.leftControl} onPress={goToPrevious}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.rightControl} onPress={goToNext}>
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.indicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    flex: 1,
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftControl: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  rightControl: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  indicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
});