export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          username: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'non-binary' | 'other' | null;
          seeking: 'men' | 'women' | 'both' | null;
          city: string | null;
          state: string | null;
          country: string | null;
          iq_score: number;
          eq_score: number;
          mbti_type: string | null;
          interests: string[] | null;
          intent: 'dating' | 'friendship' | null;
          bio: string | null;
          profile_photos: string[];
          profile_completed: boolean;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          name?: string | null;
          username?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'non-binary' | 'other' | null;
          seeking?: 'men' | 'women' | 'both' | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          iq_score?: number;
          eq_score?: number;
          mbti_type?: string | null;
          interests?: string[] | null;
          intent?: 'dating' | 'friendship' | null;
          bio?: string | null;
          profile_photos?: string[];
          profile_completed?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          username?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'non-binary' | 'other' | null;
          seeking?: 'men' | 'women' | 'both' | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          iq_score?: number;
          eq_score?: number;
          mbti_type?: string | null;
          interests?: string[] | null;
          intent?: 'dating' | 'friendship' | null;
          bio?: string | null;
          profile_photos?: string[];
          profile_completed?: boolean;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          swiper_id: string;
          swiped_id: string;
          direction: 'left' | 'right';
          created_at: string;
        };
        Insert: {
          id?: string;
          swiper_id: string;
          swiped_id: string;
          direction: 'left' | 'right';
          created_at?: string;
        };
        Update: {
          id?: string;
          swiper_id?: string;
          swiped_id?: string;
          direction?: 'left' | 'right';
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          created_at: string;
          last_message_at: string | null;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          created_at?: string;
          last_message_at?: string | null;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          created_at?: string;
          last_message_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      gender_type: 'male' | 'female' | 'non-binary' | 'other';
      intent_type: 'dating' | 'friendship';
      swipe_direction: 'left' | 'right';
      seeking_type: 'men' | 'women' | 'both';
    };
  };
}