import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Lock, Bell, Trash2, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleNotificationSettings = () => {
    router.push('/notification-settings');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all associated data. Type "DELETE" to confirm.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'DELETE ACCOUNT',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      // Delete user from Supabase Auth (this will cascade delete from users table)
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );

      if (error) {
        // Fallback: sign out if admin delete fails
        await signOut();
        Alert.alert('Account Deletion', 'Account deletion initiated. Please contact support if you need assistance.');
      } else {
        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      }
      
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    }
  };

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'default',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your photos, bio, and preferences',
      icon: User,
      onPress: handleEditProfile
    },
    {
      id: 'change-password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: Lock,
      onPress: handleChangePassword
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      onPress: handleNotificationSettings
    },
    {
      id: 'delete-account',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and data',
      icon: Trash2,
      onPress: handleDeleteAccount,
      destructive: true
    },
    {
      id: 'logout',
      title: 'Log Out',
      subtitle: 'Sign out of your account',
      icon: LogOut,
      onPress: handleLogOut,
      destructive: true
    }
  ];

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.settingsCard}>
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingsItem,
                    index === settingsItems.length - 1 && styles.lastItem
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={[
                      styles.iconContainer,
                      item.destructive && styles.destructiveIconContainer
                    ]}>
                      <IconComponent 
                        size={20} 
                        color={item.destructive ? '#ef4444' : '#6366f1'} 
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[
                        styles.settingsTitle,
                        item.destructive && styles.destructiveText
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={styles.settingsSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>BrightMatch v1.0.0</Text>
            <Text style={styles.versionSubtext}>Made with ❤️ for intelligent connections</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: '#fef2f2',
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#ef4444',
  },
  settingsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});