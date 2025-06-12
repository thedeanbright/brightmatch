import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { databaseService } from '@/lib/database';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let blob: Blob;
      
      if (Platform.OS === 'web') {
        // For web, fetch the URI and convert to blob
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        // For mobile, create FormData
        const formData = new FormData();
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        formData.append('file', {
          uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        // Upload using FormData for mobile
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, formData, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        const newPhotos = [...photos, publicUrl];
        onPhotosChange(newPhotos);

        // Update user profile with new photos
        await databaseService.updateUserPhotos(user.id, newPhotos);

        Alert.alert('Success', 'Photo uploaded successfully!');
        setUploading(false);
        return;
      }

      // Web upload logic
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const newPhotos = [...photos, publicUrl];
      onPhotosChange(newPhotos);

      // Update user profile with new photos
      await databaseService.updateUserPhotos(user.id, newPhotos);

      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const photoToRemove = photos[index];
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user profile
      await databaseService.updateUserPhotos(user.id, newPhotos);

      // Delete from storage
      const fileName = photoToRemove.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('profile-photos')
          .remove([`${user.id}/${fileName}`]);
      }
    } catch (error) {
      console.error('Remove photo error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos ({photos.length}/{maxPhotos})</Text>
      <Text style={styles.subtitle}>Add photos to make your profile stand out</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <Text style={styles.uploadingText}>Uploading...</Text>
            ) : (
              <>
                <Plus size={32} color="#667eea" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 120,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: 100,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    marginTop: 4,
  },
  uploadingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
});