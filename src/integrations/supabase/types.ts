export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          meta: Json
          module: string
          record: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          meta?: Json
          module: string
          record?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          meta?: Json
          module?: string
          record?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          author_avatar: string | null
          author_bio: string | null
          author_slug: string | null
          category: string | null
          content: string
          cover_alt: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          faqs: Json
          id: string
          is_demo: boolean
          links: Json
          published_at: string | null
          reading_time: number | null
          related_slugs: string[]
          seo: Json
          show_breadcrumbs: boolean
          show_toc: boolean
          slug: string
          status: string
          subcategory: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_slug?: string | null
          category?: string | null
          content?: string
          cover_alt?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          id?: string
          is_demo?: boolean
          links?: Json
          published_at?: string | null
          reading_time?: number | null
          related_slugs?: string[]
          seo?: Json
          show_breadcrumbs?: boolean
          show_toc?: boolean
          slug: string
          status?: string
          subcategory?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          author_avatar?: string | null
          author_bio?: string | null
          author_slug?: string | null
          category?: string | null
          content?: string
          cover_alt?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          id?: string
          is_demo?: boolean
          links?: Json
          published_at?: string | null
          reading_time?: number | null
          related_slugs?: string[]
          seo?: Json
          show_breadcrumbs?: boolean
          show_toc?: boolean
          slug?: string
          status?: string
          subcategory?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_demo: boolean
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_demo?: boolean
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      cta_blocks: {
        Row: {
          button_icon: string | null
          button_label: string | null
          button_url: string | null
          created_at: string
          enabled: boolean
          eyebrow: string | null
          heading: string | null
          id: string
          image: string | null
          is_demo: boolean
          location: string
          position: number
          secondary_icon: string | null
          secondary_label: string | null
          secondary_url: string | null
          style: string
          text: string | null
        }
        Insert: {
          button_icon?: string | null
          button_label?: string | null
          button_url?: string | null
          created_at?: string
          enabled?: boolean
          eyebrow?: string | null
          heading?: string | null
          id?: string
          image?: string | null
          is_demo?: boolean
          location: string
          position?: number
          secondary_icon?: string | null
          secondary_label?: string | null
          secondary_url?: string | null
          style?: string
          text?: string | null
        }
        Update: {
          button_icon?: string | null
          button_label?: string | null
          button_url?: string | null
          created_at?: string
          enabled?: boolean
          eyebrow?: string | null
          heading?: string | null
          id?: string
          image?: string | null
          is_demo?: boolean
          location?: string
          position?: number
          secondary_icon?: string | null
          secondary_label?: string | null
          secondary_url?: string | null
          style?: string
          text?: string | null
        }
        Relationships: []
      }
      demo_customers: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          is_demo: boolean
          name: string
          orders_count: number
          tags: string[]
          total_spent: number
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          is_demo?: boolean
          name: string
          orders_count?: number
          tags?: string[]
          total_spent?: number
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          name?: string
          orders_count?: number
          tags?: string[]
          total_spent?: number
        }
        Relationships: []
      }
      demo_orders: {
        Row: {
          channel: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          financial_status: string
          fulfillment_status: string
          id: string
          is_demo: boolean
          items: number
          order_number: string
          total: number
        }
        Insert: {
          channel?: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          financial_status?: string
          fulfillment_status?: string
          id?: string
          is_demo?: boolean
          items?: number
          order_number: string
          total?: number
        }
        Update: {
          channel?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          financial_status?: string
          fulfillment_status?: string
          id?: string
          is_demo?: boolean
          items?: number
          order_number?: string
          total?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          enabled: boolean
          id: string
          is_demo: boolean
          position: number
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          is_demo?: boolean
          position?: number
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          is_demo?: boolean
          position?: number
          question?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          data: Json
          enabled: boolean
          ends_at: string | null
          id: string
          is_demo: boolean
          position: number
          starts_at: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          enabled?: boolean
          ends_at?: string | null
          id?: string
          is_demo?: boolean
          position?: number
          starts_at?: string | null
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          enabled?: boolean
          ends_at?: string | null
          id?: string
          is_demo?: boolean
          position?: number
          starts_at?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          caption: string | null
          category: string | null
          created_at: string
          id: string
          is_demo: boolean
          title: string | null
          url: string
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          title?: string | null
          url: string
        }
        Update: {
          alt?: string | null
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          badge: string | null
          column_group: string | null
          created_at: string
          description: string | null
          enabled: boolean
          icon: string | null
          id: string
          is_demo: boolean
          label: string
          location: string
          position: number
          url: string
        }
        Insert: {
          badge?: string | null
          column_group?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          is_demo?: boolean
          label: string
          location?: string
          position?: number
          url?: string
        }
        Update: {
          badge?: string | null
          column_group?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          is_demo?: boolean
          label?: string
          location?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_demo: boolean
          level: string
          link: string | null
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          level?: string
          link?: string | null
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          level?: string
          link?: string | null
          read?: boolean
          title?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_demo: boolean
          published_at: string | null
          seo: Json
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          published_at?: string | null
          seo?: Json
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          active: boolean
          created_at: string
          from_path: string
          id: string
          is_demo: boolean
          status_code: number
          to_path: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          from_path: string
          id?: string
          is_demo?: boolean
          status_code?: number
          to_path: string
        }
        Update: {
          active?: boolean
          created_at?: string
          from_path?: string
          id?: string
          is_demo?: boolean
          status_code?: number
          to_path?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          group_name: string
          key: string
          type: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          group_name?: string
          key: string
          type?: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string | null
          group_name?: string
          key?: string
          type?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_demo: boolean
          source: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_demo?: boolean
          source?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          source?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      purge_demo_data: { Args: never; Returns: Json }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "seo_manager"
        | "content_manager"
        | "order_manager"
        | "support_manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "editor",
        "seo_manager",
        "content_manager",
        "order_manager",
        "support_manager",
      ],
    },
  },
} as const
