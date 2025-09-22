import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
 
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          total_shields_received: number
          total_rewards_earned: number
          nft_count: number
          post_count: number
          follower_count: number
          following_count: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          total_shields_received?: number
          total_rewards_earned?: number
          nft_count?: number
          post_count?: number
          follower_count?: number
          following_count?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          total_shields_received?: number
          total_rewards_earned?: number
          nft_count?: number
          post_count?: number
          follower_count?: number
          following_count?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_urls: string[] | null
          shields_count: number
          comment_count: number
          share_count: number
          view_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_urls?: string[] | null
          shields_count?: number
          comment_count?: number
          share_count?: number
          view_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_urls?: string[] | null
          shields_count?: number
          comment_count?: number
          share_count?: number
          view_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shields: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          post_id: string
          parent_comment_id: string | null
          content: string
          shields_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          parent_comment_id?: string | null
          content: string
          shields_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          parent_comment_id?: string | null
          content?: string
          shields_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_shields: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
      }
      nfts: {
        Row: {
          id: string
          user_id: string
          mint_address: string
          name: string
          description: string | null
          image_url: string | null
          metadata_url: string | null
          collection_name: string | null
          rarity_rank: number | null
          floor_price: number | null
          acquired_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mint_address: string
          name: string
          description?: string | null
          image_url?: string | null
          metadata_url?: string | null
          collection_name?: string | null
          rarity_rank?: number | null
          floor_price?: number | null
          acquired_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mint_address?: string
          name?: string
          description?: string | null
          image_url?: string | null
          metadata_url?: string | null
          collection_name?: string | null
          rarity_rank?: number | null
          floor_price?: number | null
          acquired_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          reward_type: string
          amount: number
          description: string
          transaction_signature: string | null
          claimed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_type: string
          amount: number
          description: string
          transaction_signature?: string | null
          claimed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_type?: string
          amount?: number
          description?: string
          transaction_signature?: string | null
          claimed_at?: string | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          requirement_type: string
          requirement_value: number
          reward_amount: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url?: string | null
          requirement_type: string
          requirement_value: number
          reward_amount?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string | null
          requirement_type?: string
          requirement_value?: number
          reward_amount?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      user_leaderboard: {
        Row: {
          id: string
          username: string
          display_name: string | null
          total_shields_received: number
          post_count: number
          follower_count: number
          nft_count: number
          total_rewards_earned: number
        }
      }
      post_feed: {
        Row: {
          id: string
          content: string
          image_urls: string[] | null
          shields_count: number
          comment_count: number
          created_at: string
          username: string
          display_name: string | null
          avatar_url: string | null
          is_verified: boolean
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase)
}
