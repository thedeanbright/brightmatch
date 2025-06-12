import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Mail, MessageCircle, Heart, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    newMatches: true,
    newMessages: true,
    profileViews: false,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationSections = [
    {
      title: 'General Notifications',
      icon: Bell,
      items: [
        {
          key: 'pushNotifications' as keyof typeof settings,
          title: 'Push Notifications',
          description: 'Receive notifications on your device',
          icon: Bell
        },
        {
          key: 'emailNotifications' as keyof typeof settings,
          title: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: Mail
        }
      ]
    },
    {
      title: 'Dating Activity',
      icon: Heart,
      items: [
        {
          key: 'newMatches' as keyof typeof settings,
          title: 'New Matches',
          description: 'When someone likes you back',
          icon: Heart
        },
        {
          key: 'newMessages' as keyof typeof settings,
          title: 'New Messages',
          description: 'When you receive a new message',
          icon: MessageCircle
        },
        {
          key: 'profileViews' as keyof typeof settings,
          title: 'Profile Views',
          description: 'When someone views your profile',
          icon: Users
        }
      ]
    },
    {
      title: 'Email Preferences',
      icon: Mail,
      items: [
        {
          key: 'weeklyDigest' as keyof typeof settings,
          title: 'Weekly Digest',
          description: 'Summary of your weekly activity',
          icon: Mail
        },
        {
          key: 'marketingEmails' as keyof typeof settings,
          title: 'Marketing Emails',
          description: 'Tips, features, and promotions',
          icon: Mail
        }
      ]
    },
    {
      title: 'Sound & Vibration',
      icon: Bell,
      items: [
        {
          key: 'soundEnabled' as keyof typeof settings,
          title: 'Sound',
          description: 'Play sound for notifications',
          icon: Bell
        },
        {
          key: 'vibrationEnabled' as keyof typeof settings,
          title: 'Vibration',
          description: 'Vibrate for notifications',
          icon: Bell
        }
      ]
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Customize how and when you want to receive notifications from BrightMatch.
            </Text>
          </View>

          {notificationSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <View key={sectionIndex} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <SectionIcon size={20} color="white" />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                
                <View style={styles.settingsCard}>
                  {section.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    return (
                      <View
                        key={item.key}
                        style={[
                          styles.settingItem,
                          itemIndex === section.items.length - 1 && styles.lastItem
                        ]}
                      >
                        <View style={styles.settingLeft}>
                          <View style={styles.iconContainer}>
                            <ItemIcon size={20} color="#6366f1" />
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.settingTitle}>{item.title}</Text>
                            <Text style={styles.settingDescription}>{item.description}</Text>
                          </View>
                        </View>
                        <Switch
                          value={settings[item.key]}
                          onValueChange={() => handleToggle(item.key)}
                          trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                          thumbColor={settings[item.key] ? '#ffffff' : '#f3f4f6'}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Note: These are mock settings for demonstration. In a production app, these would be connected to a real notification system.
            </Text>
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
  description: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
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
  settingLeft: {
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
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});