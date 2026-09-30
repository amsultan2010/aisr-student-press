// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: { added_at: string; email: string }
        Insert: { added_at?: string; email: string }
        Update: { added_at?: string; email?: string }
        Relationships: []
      }
      article_authors: {
        Row: { article_id: string; position: number; staff_id: string }
        Insert: { article_id: string; position?: number; staff_id: string }
        Update: { article_id?: string; position?: number; staff_id?: string }
        Relationships: [
          {
            foreignKeyName: "article_authors_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_authors_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: { article_id: string; tag_id: string }
        Insert: { article_id: string; tag_id: string }
        Update: { article_id?: string; tag_id?: string }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: { article_id: string; id: number; viewed_at: string; visitor: string }
        Insert: { article_id: string; id?: never; viewed_at?: string; visitor: string }
        Update: { article_id?: string; id?: never; viewed_at?: string; visitor?: string }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          body: Json
          body_text: string
          cover_alt: string
          cover_caption: string
          cover_credit: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          dek: string
          id: string
          in_ticker: boolean
          is_editors_pick: boolean
          is_lead: boolean
          is_placeholder: boolean
          published_at: string | null
          reading_minutes: number
          search: unknown
          section_id: number
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          body?: Json
          body_text?: string
          cover_alt?: string
          cover_caption?: string
          cover_credit?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          dek?: string
          id?: string
          in_ticker?: boolean
          is_editors_pick?: boolean
          is_lead?: boolean
          is_placeholder?: boolean
          published_at?: string | null
          reading_minutes?: number
          search?: unknown
          section_id: number
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          body?: Json
          body_text?: string
          cover_alt?: string
          cover_caption?: string
          cover_credit?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          dek?: string
          id?: string
          in_ticker?: boolean
          is_editors_pick?: boolean
          is_lead?: boolean
          is_placeholder?: boolean
          published_at?: string | null
          reading_minutes?: number
          search?: unknown
          section_id?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: { description: string; id: number; name: string; short_name: string; slug: string; sort_order: number }
        Insert: { description?: string; id?: never; name: string; short_name: string; slug: string; sort_order?: number }
        Update: { description?: string; id?: never; name?: string; short_name?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      staff: {
        Row: {
          bio: string
          created_at: string
          grade: string | null
          id: string
          instagram: string | null
          is_active: boolean
          is_placeholder: boolean
          name: string
          photo_url: string | null
          role: string
          role_group: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          grade?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          is_placeholder?: boolean
          name: string
          photo_url?: string | null
          role?: string
          role_group?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          grade?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean
          is_placeholder?: boolean
          name?: string
          photo_url?: string | null
          role?: string
          role_group?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          attachment_path: string | null
          created_at: string
          email: string
          grade: string | null
          id: string
          kind: string
          message: string
          name: string
          section_slug: string | null
          status: string
          title: string
        }
        Insert: {
          attachment_path?: string | null
          created_at?: string
          email: string
          grade?: string | null
          id?: string
          kind: string
          message: string
          name: string
          section_slug?: string | null
          status?: string
          title?: string
        }
        Update: {
          attachment_path?: string | null
          created_at?: string
          email?: string
          grade?: string | null
          id?: string
          kind?: string
          message?: string
          name?: string
          section_slug?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_section_slug_fkey"
            columns: ["section_slug"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["slug"]
          },
        ]
      }
      tags: {
        Row: { created_at: string; id: string; name: string; slug: string }
        Insert: { created_at?: string; id?: string; name: string; slug: string }
        Update: { created_at?: string; id?: string; name?: string; slug?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      record_view: {
        Args: { p_article_id: string; p_visitor: string }
        Returns: undefined
      }
      views_by_day: {
        Args: { p_days?: number }
        Returns: { day: string; views: number }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicTables = Database["public"]["Tables"]
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"]
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"]
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"]
