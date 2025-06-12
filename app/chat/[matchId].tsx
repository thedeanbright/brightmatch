import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Sparkles } from 'lucide-react-native';
import { Database } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import ImageCarousel from '@/components/ImageCarousel';
import { databaseService } from '@/lib/database';
import { generateAIIcebreaker } from '@/utils/ai';

type Message = Database['public']['Tables']['messages']['Row'];

export default function ChatScreen() {
  const router = useRouter();
  const { matchId, userName, userPhoto } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!matchId || typeof matchId !== 'string') return;

    try {
      const { data, error } = await databaseService.getMatchMessages(matchId);
      
      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
      
      // Mark messages as read
      if (user) {
        await databaseService.markMessagesAsRead(matchId, user.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !matchId || typeof matchId !== 'string') return;

    setSending(true);
    try {
      const { data, error } = await databaseService.sendMessage({
        match_id: matchId,
        sender_id: user.id,
        content: newMessage.trim()
      });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      if (data) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const generateIcebreaker = async () => {
    if (!user) return;

    try {
      // For demo purposes, generate a simple icebreaker
      const icebreakers = [
        "What's been the highlight of your week so far?",
        "I'd love to hear more about your interests! What got you into them?",
        "Your profile really caught my eye - tell me something interesting about yourself!",
        "What's your favorite way to spend a weekend?",
        "I noticed we have some things in common - what's your story?"
      ];

      const randomIcebreaker = icebreakers[Math.floor(Math.random() * icebreakers.length)];
      setNewMessage(randomIcebreaker);
    } catch (error) {
      console.error('Error generating icebreaker:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = formatDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            {userPhoto && (
              <ImageCarousel 
                images={[userPhoto as string]} 
                style={styles.headerAvatar}
                showControls={false}
                aspectRatio={1}
              />
            )}
            <Text style={styles.headerName}>{userName}</Text>
          </View>

          <TouchableOpacity style={styles.icebreakerButton} onPress={generateIcebreaker}>
            <Sparkles size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading messages...</Text>
              </View>
            ) : Object.keys(messageGroups).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Start the conversation!</Text>
                <Text style={styles.emptySubtext}>Say hello to your new match</Text>
              </View>
            ) : (
              Object.entries(messageGroups).map(([date, dateMessages]) => (
                <View key={date}>
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateText}>{date}</Text>
                  </View>
                  
                  {dateMessages.map((message) => {
                    const isMyMessage = message.sender_id === user?.id;
                    
                    return (
                      <View
                        key={message.id}
                        style={[
                          styles.messageContainer,
                          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isMyMessage ? styles.myMessageText : styles.theirMessageText
                            ]}
                          >
                            {message.content}
                          </Text>
                        </View>
                        <Text style={styles.messageTime}>
                          {formatTime(message.created_at)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  icebreakerButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  myMessageText: {
    color: 'white',
  },
  theirMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    marginHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(102, 126, 234, 0.5)',
  },
});