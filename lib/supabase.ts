import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      persona_sessions: {
        Row: {
          id: string
          personas: any[]
          original_request: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          personas: any[]
          original_request: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          personas?: any[]
          original_request?: any
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          persona_id: string
          user_message: string
          persona_response: string
          created_at: string
        }
        Insert: {
          id?: string
          persona_id: string
          user_message: string
          persona_response: string
          created_at?: string
        }
        Update: {
          id?: string
          persona_id?: string
          user_message?: string
          persona_response?: string
          created_at?: string
        }
      }
      uploaded_files: {
        Row: {
          id: string
          filename: string
          file_type: string
          processed_data: any
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          file_type: string
          processed_data: any
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          file_type?: string
          processed_data?: any
          created_at?: string
        }
      }
      shared_personas: {
        Row: {
          id: string
          personas: any[]
          settings: any
          expires_at: string
          access_count: number
          last_accessed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          personas: any[]
          settings: any
          expires_at: string
          access_count?: number
          last_accessed?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          personas?: any[]
          settings?: any
          expires_at?: string
          access_count?: number
          last_accessed?: string | null
          created_at?: string
        }
      }
    }
  }
}
