import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  seeking?: 'men' | 'women' | 'both';
  country?: string;
  state?: string;
  city?: string;
  iq_score: number;
  eq_score: number;
  mbti_type?: string;
  interests?: string[];
  intent?: 'dating' | 'friendship';
  bio?: string;
  profile_photos: string[];
  profile_completed?: boolean;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  seeking?: 'men' | 'women' | 'both';
  country?: string;
  state?: string;
  city?: string;
  iq_score?: number;
  eq_score?: number;
  mbti_type?: string;
  interests?: string[];
  intent?: 'dating' | 'friendship';
  bio?: string;
  profile_photos?: string[];
  profile_completed?: boolean;
}

export interface UserProfileUpdate {
  email?: string;
  name?: string;
  username?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  seeking?: 'men' | 'women' | 'both';
  country?: string;
  state?: string;
  city?: string;
  iq_score?: number;
  eq_score?: number;
  mbti_type?: string;
  interests?: string[];
  intent?: 'dating' | 'friendship';
  bio?: string;
  profile_photos?: string[];
  profile_completed?: boolean;
}

export interface SwipeInsert {
  swiper_id: string;
  swiped_id: string;
  direction: 'left' | 'right';
}

export interface MessageInsert {
  match_id: string;
  sender_id: string;
  content: string;
}

export const databaseService = {
  // User operations with proper error handling and logging
  async createUser(userData: UserProfileInsert): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Creating user with data:', userData);
    
    try {
      // Use upsert to prevent duplicate key violations
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error) {
        console.error('Error creating user:', error);
        return { data: null, error };
      }

      console.log('User created successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error creating user:', err);
      return { data: null, error: err };
    }
  },

  async updateUser(userId: string, updates: UserProfileUpdate): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating user:', userId, 'with data:', updates);
    
    try {
      // First check if user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user existence:', checkError);
        return { data: null, error: checkError };
      }

      if (!existingUser) {
        console.log('User does not exist, creating new user profile');
        // User doesn't exist, create it
        const createData: UserProfileInsert = {
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return this.createUser(createData);
      }

      // User exists, update it
      const { data, error } = await supabase
        .from('users')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating user:', error);
        return { data: null, error };
      }

      console.log('User updated successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error updating user:', err);
      return { data: null, error: err };
    }
  },

  async getUserById(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Fetching user by ID:', userId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully
      
      if (error) {
        console.error('Error fetching user:', error);
        
        // If user doesn't exist, try to create a basic profile
        if (error.code === 'PGRST116' || !data) {
          console.log('User profile not found, attempting to create basic profile');
          
          // Get user info from auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser && authUser.id === userId) {
            const basicUserData: UserProfileInsert = {
              id: authUser.id,
              email: authUser.email || undefined,
              username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
              bio: null,
              iq_score: 0,
              eq_score: 0,
              mbti_type: null,
              intent: null,
              profile_photos: [],
              profile_completed: false
            };
            
            console.log('Creating basic user profile:', basicUserData);
            const { data: newUser, error: createError } = await this.createUser(basicUserData);
            if (createError) {
              console.error('Failed to create basic user profile:', createError);
              return { data: null, error: createError };
            }
            
            console.log('Created basic user profile:', newUser);
            return { data: newUser, error: null };
          }
        }
        
        return { data: null, error };
      }
      
      console.log('User fetched successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching user:', err);
      return { data: null, error: err };
    }
  },

  async getUserByUsername(username: string): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Fetching user by username:', username);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user by username:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error fetching user by username:', err);
      return { data: null, error: err };
    }
  },

  // Discovery and matching
  async getDiscoveryUsers(currentUserId: string, limit: number = 10): Promise<{ data: UserProfile[] | null; error: any }> {
    console.log('Fetching discovery users for:', currentUserId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId)
        .eq('profile_completed', true)
        .not('intent', 'is', null)
        .limit(limit);

      if (error) {
        console.error('Error fetching discovery users:', error);
      }

      return { data, error };
    } catch (err) {
      console.error('Unexpected error fetching discovery users:', err);
      return { data: null, error: err };
    }
  },

  async findMatches(currentUserId: string): Promise<{ data: UserProfile[] | null; error: any }> {
    console.log('Finding matches for user:', currentUserId);
    
    try {
      const { data: currentUser, error: userError } = await this.getUserById(currentUserId);
      if (userError || !currentUser) {
        console.error('Error fetching current user for matching:', userError);
        return { data: null, error: userError };
      }

      // Find users with compatible preferences
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId)
        .eq('profile_completed', true)
        .not('intent', 'is', null);

      // Filter by intent compatibility
      if (currentUser.intent) {
        query = query.eq('intent', currentUser.intent);
      }

      // Filter by location if available
      if (currentUser.city && currentUser.state) {
        query = query.eq('city', currentUser.city).eq('state', currentUser.state);
      }

      // Filter by seeking preferences
      if (currentUser.seeking && currentUser.gender) {
        if (currentUser.seeking === 'men') {
          query = query.eq('gender', 'male');
        } else if (currentUser.seeking === 'women') {
          query = query.eq('gender', 'female');
        }
        // For 'both', no additional filter needed
      }

      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('Error finding matches:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error finding matches:', err);
      return { data: null, error: err };
    }
  },

  // Photo operations
  async uploadPhoto(userId: string, file: File): Promise<{ data: string | null; error: any }> {
    console.log('Uploading photo for user:', userId);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading photo:', error);
        return { data: null, error };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('Photo uploaded successfully:', publicUrl);
      return { data: publicUrl, error: null };
    } catch (err) {
      console.error('Unexpected error uploading photo:', err);
      return { data: null, error: err };
    }
  },

  async updateUserPhotos(userId: string, photos: string[]): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating user photos for:', userId);
    return this.updateUser(userId, { profile_photos: photos });
  },

  // Bio operations
  async updateUserBio(userId: string, bio: string): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating user bio for:', userId);
    return this.updateUser(userId, { bio });
  },

  // MBTI type update
  async updateMBTIType(userId: string, mbtiType: string): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating MBTI type for:', userId);
    return this.updateUser(userId, { mbti_type: mbtiType });
  },

  // Test scores update
  async updateTestScores(userId: string, iqScore: number, eqScore: number): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating test scores for:', userId);
    return this.updateUser(userId, { iq_score: iqScore, eq_score: eqScore });
  },

  // Intent update
  async updateIntent(userId: string, intent: 'dating' | 'friendship'): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating intent for:', userId);
    return this.updateUser(userId, { intent });
  },

  // Username update
  async updateUsername(userId: string, username: string): Promise<{ data: UserProfile | null; error: any }> {
    console.log('Updating username for:', userId);
    return this.updateUser(userId, { username });
  },

  // Get all users for leaderboard
  async getLeaderboard(limit: number = 50): Promise<{ data: UserProfile[] | null; error: any }> {
    console.log('Fetching leaderboard with limit:', limit);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('profile_completed', true)
        .gt('iq_score', 0)
        .gt('eq_score', 0)
        .order('iq_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      }

      return { data, error };
    } catch (err) {
      console.error('Unexpected error fetching leaderboard:', err);
      return { data: null, error: err };
    }
  },

  // Swipe operations
  async recordSwipe(swipeData: SwipeInsert): Promise<{ data: any; error: any }> {
    console.log('Recording swipe:', swipeData);
    
    try {
      const { data, error } = await supabase
        .from('swipes')
        .upsert(swipeData, { 
          onConflict: 'swiper_id,swiped_id',
          ignoreDuplicates: false 
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error recording swipe:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error recording swipe:', err);
      return { data: null, error: err };
    }
  },

  // Match operations
  async createMatch(user1Id: string, user2Id: string): Promise<{ data: any; error: any }> {
    console.log('Creating match between:', user1Id, 'and', user2Id);
    
    try {
      // Ensure consistent ordering (smaller ID first)
      const [userId1, userId2] = [user1Id, user2Id].sort();
      
      const { data, error } = await supabase
        .from('matches')
        .upsert({
          user1_id: userId1,
          user2_id: userId2
        }, { 
          onConflict: 'user1_id,user2_id',
          ignoreDuplicates: true 
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error creating match:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error creating match:', err);
      return { data: null, error: err };
    }
  },

  async getUserMatches(userId: string): Promise<{ data: any[] | null; error: any }> {
    console.log('Fetching matches for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:users!matches_user1_id_fkey(*),
          user2:users!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user matches:', error);
        return { data: null, error };
      }

      // Transform data to include other_user
      const transformedData = data?.map(match => ({
        ...match,
        other_user: match.user1_id === userId ? match.user2 : match.user1
      }));

      console.log('Fetched user matches:', transformedData?.length || 0);
      return { data: transformedData, error: null };
    } catch (err) {
      console.error('Unexpected error fetching user matches:', err);
      return { data: null, error: err };
    }
  },

  // Messaging operations
  async sendMessage(messageData: MessageInsert): Promise<{ data: any; error: any }> {
    console.log('Sending message:', messageData);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .maybeSingle();

      // Update match last_message_at
      if (data && !error) {
        await supabase
          .from('matches')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', messageData.match_id);
      }

      if (error) {
        console.error('Error sending message:', error);
      }

      return { data, error };
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      return { data: null, error: err };
    }
  },

  async getMatchMessages(matchId: string): Promise<{ data: any[] | null; error: any }> {
    console.log('Fetching messages for match:', matchId);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching match messages:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error fetching match messages:', err);
      return { data: null, error: err };
    }
  },

  async markMessagesAsRead(matchId: string, userId: string): Promise<{ data: any; error: any }> {
    console.log('Marking messages as read for match:', matchId, 'user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('match_id', matchId)
        .neq('sender_id', userId);
      
      if (error) {
        console.error('Error marking messages as read:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error marking messages as read:', err);
      return { data: null, error: err };
    }
  }
};