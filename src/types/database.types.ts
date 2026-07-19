export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          metadata: Json;
          owner_id: string;
          prospect_id: string | null;
          type: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          metadata?: Json;
          owner_id: string;
          prospect_id?: string | null;
          type: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          metadata?: Json;
          owner_id?: string;
          prospect_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      ai_analyses: {
        Row: {
          analysis_type: string;
          created_at: string;
          id: string;
          input_hash: string;
          input_tokens: number | null;
          model: string;
          output_tokens: number | null;
          owner_id: string;
          prompt_version: string;
          prospect_id: string;
          structured_output: Json;
        };
        Insert: {
          analysis_type: string;
          created_at?: string;
          id?: string;
          input_hash: string;
          input_tokens?: number | null;
          model: string;
          output_tokens?: number | null;
          owner_id: string;
          prompt_version: string;
          prospect_id: string;
          structured_output: Json;
        };
        Update: {
          analysis_type?: string;
          created_at?: string;
          id?: string;
          input_hash?: string;
          input_tokens?: number | null;
          model?: string;
          output_tokens?: number | null;
          owner_id?: string;
          prompt_version?: string;
          prospect_id?: string;
          structured_output?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "ai_analyses_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_analyses_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      contact_points: {
        Row: {
          confidence: number;
          created_at: string;
          do_not_contact: boolean;
          first_detected_at: string;
          id: string;
          is_public: boolean;
          last_verified_at: string | null;
          normalized_value: string;
          owner_id: string;
          prospect_id: string;
          source_url: string;
          type: Database["public"]["Enums"]["contact_point_type"];
          value: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          confidence?: number;
          created_at?: string;
          do_not_contact?: boolean;
          first_detected_at?: string;
          id?: string;
          is_public?: boolean;
          last_verified_at?: string | null;
          normalized_value: string;
          owner_id: string;
          prospect_id: string;
          source_url: string;
          type: Database["public"]["Enums"]["contact_point_type"];
          value: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          confidence?: number;
          created_at?: string;
          do_not_contact?: boolean;
          first_detected_at?: string;
          id?: string;
          is_public?: boolean;
          last_verified_at?: string | null;
          normalized_value?: string;
          owner_id?: string;
          prospect_id?: string;
          source_url?: string;
          type?: Database["public"]["Enums"]["contact_point_type"];
          value?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "contact_points_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_points_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      conversations: {
        Row: {
          channel: Database["public"]["Enums"]["conversation_channel"];
          created_at: string;
          draft_response: string;
          follow_up_at: string | null;
          id: string;
          intent: string | null;
          last_activity_at: string;
          next_action: string | null;
          owner_id: string;
          proposal_id: string | null;
          prospect_id: string;
          status: Database["public"]["Enums"]["conversation_status"];
          updated_at: string;
        };
        Insert: {
          channel: Database["public"]["Enums"]["conversation_channel"];
          created_at?: string;
          draft_response?: string;
          follow_up_at?: string | null;
          id?: string;
          intent?: string | null;
          last_activity_at?: string;
          next_action?: string | null;
          owner_id: string;
          proposal_id?: string | null;
          prospect_id: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          updated_at?: string;
        };
        Update: {
          channel?: Database["public"]["Enums"]["conversation_channel"];
          created_at?: string;
          draft_response?: string;
          follow_up_at?: string | null;
          id?: string;
          intent?: string | null;
          last_activity_at?: string;
          next_action?: string | null;
          owner_id?: string;
          proposal_id?: string | null;
          prospect_id?: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_proposal_owner_fk";
            columns: ["owner_id", "proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["owner_id", "id"];
          },
          {
            foreignKeyName: "conversations_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      exclusion_list: {
        Row: {
          contact_type: Database["public"]["Enums"]["contact_point_type"];
          created_at: string;
          id: string;
          normalized_value: string;
          owner_id: string;
          reason: string | null;
        };
        Insert: {
          contact_type: Database["public"]["Enums"]["contact_point_type"];
          created_at?: string;
          id?: string;
          normalized_value: string;
          owner_id: string;
          reason?: string | null;
        };
        Update: {
          contact_type?: Database["public"]["Enums"]["contact_point_type"];
          created_at?: string;
          id?: string;
          normalized_value?: string;
          owner_id?: string;
          reason?: string | null;
        };
        Relationships: [];
      };
      integration_connections: {
        Row: {
          created_at: string;
          encrypted_access_token: string | null;
          encrypted_refresh_token: string | null;
          id: string;
          metadata: Json;
          owner_id: string;
          provider: string;
          scopes: string[];
          status: Database["public"]["Enums"]["integration_status"];
          token_expires_at: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          encrypted_access_token?: string | null;
          encrypted_refresh_token?: string | null;
          id?: string;
          metadata?: Json;
          owner_id: string;
          provider: string;
          scopes?: string[];
          status?: Database["public"]["Enums"]["integration_status"];
          token_expires_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          encrypted_access_token?: string | null;
          encrypted_refresh_token?: string | null;
          id?: string;
          metadata?: Json;
          owner_id?: string;
          provider?: string;
          scopes?: string[];
          status?: Database["public"]["Enums"]["integration_status"];
          token_expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          channel: Database["public"]["Enums"]["conversation_channel"];
          conversation_id: string;
          created_at: string;
          direction: Database["public"]["Enums"]["message_direction"];
          external_message_id: string | null;
          id: string;
          occurred_at: string;
          owner_id: string;
          subject: string | null;
        };
        Insert: {
          body: string;
          channel: Database["public"]["Enums"]["conversation_channel"];
          conversation_id: string;
          created_at?: string;
          direction: Database["public"]["Enums"]["message_direction"];
          external_message_id?: string | null;
          id?: string;
          occurred_at: string;
          owner_id: string;
          subject?: string | null;
        };
        Update: {
          body?: string;
          channel?: Database["public"]["Enums"]["conversation_channel"];
          conversation_id?: string;
          created_at?: string;
          direction?: Database["public"]["Enums"]["message_direction"];
          external_message_id?: string | null;
          id?: string;
          occurred_at?: string;
          owner_id?: string;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_conversation_owner_fk";
            columns: ["owner_id", "conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          accepted_at: string | null;
          call_to_action: string;
          created_at: string;
          currency: string;
          delivery_time: string;
          gmail_draft_id: string | null;
          gmail_thread_id: string | null;
          id: string;
          included_items: string[];
          owner_id: string;
          price: number;
          prospect_id: string;
          recommended_angle: string;
          sent_at: string | null;
          service: string;
          status: Database["public"]["Enums"]["proposal_status"];
          summary: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          call_to_action: string;
          created_at?: string;
          currency?: string;
          delivery_time: string;
          gmail_draft_id?: string | null;
          gmail_thread_id?: string | null;
          id?: string;
          included_items: string[];
          owner_id: string;
          price: number;
          prospect_id: string;
          recommended_angle: string;
          sent_at?: string | null;
          service: string;
          status?: Database["public"]["Enums"]["proposal_status"];
          summary: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          call_to_action?: string;
          created_at?: string;
          currency?: string;
          delivery_time?: string;
          gmail_draft_id?: string | null;
          gmail_thread_id?: string | null;
          id?: string;
          included_items?: string[];
          owner_id?: string;
          price?: number;
          prospect_id?: string;
          recommended_angle?: string;
          sent_at?: string | null;
          service?: string;
          status?: Database["public"]["Enums"]["proposal_status"];
          summary?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      prospects: {
        Row: {
          ai_summary: string | null;
          business_name: string;
          city: string | null;
          commercial_status: Database["public"]["Enums"]["commercial_status"];
          country: string | null;
          created_at: string;
          detected_opportunities: string[];
          formatted_address: string | null;
          google_maps_url: string | null;
          google_place_id: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          niche: string;
          opportunity_score: number;
          owner_id: string;
          primary_type: string | null;
          rating: number | null;
          recommended_offer: string | null;
          reviews_count: number | null;
          search_id: string | null;
          updated_at: string;
          website_status: Database["public"]["Enums"]["website_status"];
          website_url: string | null;
        };
        Insert: {
          ai_summary?: string | null;
          business_name: string;
          city?: string | null;
          commercial_status?: Database["public"]["Enums"]["commercial_status"];
          country?: string | null;
          created_at?: string;
          detected_opportunities?: string[];
          formatted_address?: string | null;
          google_maps_url?: string | null;
          google_place_id?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          niche: string;
          opportunity_score?: number;
          owner_id: string;
          primary_type?: string | null;
          rating?: number | null;
          recommended_offer?: string | null;
          reviews_count?: number | null;
          search_id?: string | null;
          updated_at?: string;
          website_status?: Database["public"]["Enums"]["website_status"];
          website_url?: string | null;
        };
        Update: {
          ai_summary?: string | null;
          business_name?: string;
          city?: string | null;
          commercial_status?: Database["public"]["Enums"]["commercial_status"];
          country?: string | null;
          created_at?: string;
          detected_opportunities?: string[];
          formatted_address?: string | null;
          google_maps_url?: string | null;
          google_place_id?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          niche?: string;
          opportunity_score?: number;
          owner_id?: string;
          primary_type?: string | null;
          rating?: number | null;
          recommended_offer?: string | null;
          reviews_count?: number | null;
          search_id?: string | null;
          updated_at?: string;
          website_status?: Database["public"]["Enums"]["website_status"];
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prospects_search_id_fkey";
            columns: ["search_id"];
            isOneToOne: false;
            referencedRelation: "searches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prospects_search_owner_fk";
            columns: ["owner_id", "search_id"];
            isOneToOne: false;
            referencedRelation: "searches";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
      searches: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          external_run_id: string | null;
          id: string;
          location: string;
          opportunities_count: number;
          opportunity_filter: string | null;
          owner_id: string;
          query: string;
          result_limit: number;
          results_count: number;
          sources: string[];
          started_at: string | null;
          status: Database["public"]["Enums"]["search_status"];
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          external_run_id?: string | null;
          id?: string;
          location: string;
          opportunities_count?: number;
          opportunity_filter?: string | null;
          owner_id: string;
          query: string;
          result_limit: number;
          results_count?: number;
          sources: string[];
          started_at?: string | null;
          status?: Database["public"]["Enums"]["search_status"];
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          external_run_id?: string | null;
          id?: string;
          location?: string;
          opportunities_count?: number;
          opportunity_filter?: string | null;
          owner_id?: string;
          query?: string;
          result_limit?: number;
          results_count?: number;
          sources?: string[];
          started_at?: string | null;
          status?: Database["public"]["Enums"]["search_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      website_audits: {
        Row: {
          analyzed_at: string | null;
          broken_links_count: number | null;
          copyright_year: number | null;
          created_at: string;
          error_message: string | null;
          facts: Json;
          final_url: string | null;
          has_booking: boolean | null;
          has_contact_form: boolean | null;
          has_social_links: boolean | null;
          has_viewport: boolean | null;
          has_whatsapp: boolean | null;
          http_status: number | null;
          id: string;
          meta_description: string | null;
          owner_id: string;
          prospect_id: string;
          screenshot_path: string | null;
          status: Database["public"]["Enums"]["audit_status"];
          title: string | null;
          uses_https: boolean | null;
        };
        Insert: {
          analyzed_at?: string | null;
          broken_links_count?: number | null;
          copyright_year?: number | null;
          created_at?: string;
          error_message?: string | null;
          facts?: Json;
          final_url?: string | null;
          has_booking?: boolean | null;
          has_contact_form?: boolean | null;
          has_social_links?: boolean | null;
          has_viewport?: boolean | null;
          has_whatsapp?: boolean | null;
          http_status?: number | null;
          id?: string;
          meta_description?: string | null;
          owner_id: string;
          prospect_id: string;
          screenshot_path?: string | null;
          status?: Database["public"]["Enums"]["audit_status"];
          title?: string | null;
          uses_https?: boolean | null;
        };
        Update: {
          analyzed_at?: string | null;
          broken_links_count?: number | null;
          copyright_year?: number | null;
          created_at?: string;
          error_message?: string | null;
          facts?: Json;
          final_url?: string | null;
          has_booking?: boolean | null;
          has_contact_form?: boolean | null;
          has_social_links?: boolean | null;
          has_viewport?: boolean | null;
          has_whatsapp?: boolean | null;
          http_status?: number | null;
          id?: string;
          meta_description?: string | null;
          owner_id?: string;
          prospect_id?: string;
          screenshot_path?: string | null;
          status?: Database["public"]["Enums"]["audit_status"];
          title?: string | null;
          uses_https?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "website_audits_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "website_audits_prospect_owner_fk";
            columns: ["owner_id", "prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["owner_id", "id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_manual_prospect: { Args: { payload: Json }; Returns: string };
      import_demo_data: { Args: never; Returns: number };
      mark_response_sent: {
        Args: { conversation_id: string; response_body: string };
        Returns: undefined;
      };
      transition_conversation: {
        Args: {
          action_text?: string;
          commercial_state: Database["public"]["Enums"]["commercial_status"];
          conversation_id: string;
          conversation_state: Database["public"]["Enums"]["conversation_status"];
          follow_up_time?: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      audit_status: "pendiente" | "analizando" | "completada" | "fallida";
      commercial_status:
        | "nuevo"
        | "analizando"
        | "calificado"
        | "alta-prioridad"
        | "propuesta-lista"
        | "contactado"
        | "respondio"
        | "seguimiento"
        | "negociacion"
        | "ganado"
        | "descartado";
      contact_point_type:
        | "email"
        | "phone"
        | "whatsapp"
        | "contact_form"
        | "instagram"
        | "facebook";
      conversation_channel: "correo" | "whatsapp" | "telefono";
      conversation_status:
        | "sin-contactar"
        | "esperando-respuesta"
        | "respondio"
        | "seguimiento"
        | "negociacion"
        | "ganada"
        | "cerrada";
      integration_status: "pendiente" | "conectada" | "error" | "revocada";
      message_direction: "entrante" | "saliente";
      proposal_status:
        | "borrador"
        | "lista"
        | "enviada"
        | "aceptada"
        | "negociacion"
        | "descartada";
      search_status:
        "borrador" | "pendiente" | "analizando" | "completada" | "fallida";
      verification_status: "pendiente" | "verificado" | "invalido";
      website_status:
        | "sin-sitio"
        | "desactualizado"
        | "solo-redes"
        | "basico"
        | "optimizado"
        | "desconocido";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      audit_status: ["pendiente", "analizando", "completada", "fallida"],
      commercial_status: [
        "nuevo",
        "analizando",
        "calificado",
        "alta-prioridad",
        "propuesta-lista",
        "contactado",
        "respondio",
        "seguimiento",
        "negociacion",
        "ganado",
        "descartado",
      ],
      contact_point_type: [
        "email",
        "phone",
        "whatsapp",
        "contact_form",
        "instagram",
        "facebook",
      ],
      conversation_channel: ["correo", "whatsapp", "telefono"],
      conversation_status: [
        "sin-contactar",
        "esperando-respuesta",
        "respondio",
        "seguimiento",
        "negociacion",
        "ganada",
        "cerrada",
      ],
      integration_status: ["pendiente", "conectada", "error", "revocada"],
      message_direction: ["entrante", "saliente"],
      proposal_status: [
        "borrador",
        "lista",
        "enviada",
        "aceptada",
        "negociacion",
        "descartada",
      ],
      search_status: [
        "borrador",
        "pendiente",
        "analizando",
        "completada",
        "fallida",
      ],
      verification_status: ["pendiente", "verificado", "invalido"],
      website_status: [
        "sin-sitio",
        "desactualizado",
        "solo-redes",
        "basico",
        "optimizado",
        "desconocido",
      ],
    },
  },
} as const;
