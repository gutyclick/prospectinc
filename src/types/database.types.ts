// Instantánea tipada derivada de la migración inicial. Regenerar con
// `pnpm supabase:types` cuando la base local esté activa.
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json | undefined };

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};
type Base = { id: string; owner_id: string; created_at: string };
type Updated = { updated_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        },
        "id" | "email"
      >;
      searches: Table<
        Base &
          Updated & {
            query: string;
            location: string;
            result_limit: number;
            sources: string[];
            opportunity_filter: string | null;
            status: Database["public"]["Enums"]["search_status"];
            results_count: number;
            opportunities_count: number;
            external_run_id: string | null;
            error_message: string | null;
            started_at: string | null;
            completed_at: string | null;
          },
        "owner_id" | "query" | "location" | "result_limit" | "sources"
      >;
      prospects: Table<
        Base &
          Updated & {
            search_id: string | null;
            google_place_id: string | null;
            business_name: string;
            niche: string;
            primary_type: string | null;
            formatted_address: string | null;
            city: string | null;
            country: string | null;
            latitude: number | null;
            longitude: number | null;
            website_url: string | null;
            google_maps_url: string | null;
            rating: number | null;
            reviews_count: number | null;
            website_status: Database["public"]["Enums"]["website_status"];
            opportunity_score: number;
            commercial_status: Database["public"]["Enums"]["commercial_status"];
            recommended_offer: string | null;
            ai_summary: string | null;
          },
        "owner_id" | "business_name" | "niche"
      >;
      contact_points: Table<
        Base & {
          prospect_id: string;
          type: Database["public"]["Enums"]["contact_point_type"];
          value: string;
          normalized_value: string;
          source_url: string;
          is_public: boolean;
          confidence: number;
          verification_status: Database["public"]["Enums"]["verification_status"];
          do_not_contact: boolean;
          first_detected_at: string;
          last_verified_at: string | null;
        },
        | "owner_id"
        | "prospect_id"
        | "type"
        | "value"
        | "normalized_value"
        | "source_url"
      >;
      website_audits: Table<
        Base & {
          prospect_id: string;
          status: Database["public"]["Enums"]["audit_status"];
          final_url: string | null;
          http_status: number | null;
          uses_https: boolean | null;
          has_viewport: boolean | null;
          has_contact_form: boolean | null;
          has_whatsapp: boolean | null;
          has_booking: boolean | null;
          has_social_links: boolean | null;
          title: string | null;
          meta_description: string | null;
          copyright_year: number | null;
          broken_links_count: number | null;
          facts: Json;
          screenshot_path: string | null;
          error_message: string | null;
          analyzed_at: string | null;
        },
        "owner_id" | "prospect_id"
      >;
      ai_analyses: Table<
        Base & {
          prospect_id: string;
          analysis_type: string;
          model: string;
          prompt_version: string;
          input_hash: string;
          structured_output: Json;
          input_tokens: number | null;
          output_tokens: number | null;
        },
        | "owner_id"
        | "prospect_id"
        | "analysis_type"
        | "model"
        | "prompt_version"
        | "input_hash"
        | "structured_output"
      >;
      proposals: Table<
        Base &
          Updated & {
            prospect_id: string;
            service: string;
            price: number;
            currency: string;
            status: Database["public"]["Enums"]["proposal_status"];
            summary: string;
            included_items: string[];
            recommended_angle: string;
            delivery_time: string;
            call_to_action: string;
            gmail_draft_id: string | null;
            gmail_thread_id: string | null;
            sent_at: string | null;
            accepted_at: string | null;
          },
        | "owner_id"
        | "prospect_id"
        | "service"
        | "price"
        | "summary"
        | "included_items"
        | "recommended_angle"
        | "delivery_time"
        | "call_to_action"
      >;
      conversations: Table<
        Base &
          Updated & {
            prospect_id: string;
            proposal_id: string | null;
            channel: Database["public"]["Enums"]["conversation_channel"];
            status: Database["public"]["Enums"]["conversation_status"];
            intent: string | null;
            last_activity_at: string;
            next_action: string | null;
            follow_up_at: string | null;
          },
        "owner_id" | "prospect_id" | "channel"
      >;
      messages: Table<
        Base & {
          conversation_id: string;
          direction: Database["public"]["Enums"]["message_direction"];
          channel: Database["public"]["Enums"]["conversation_channel"];
          external_message_id: string | null;
          subject: string | null;
          body: string;
          occurred_at: string;
        },
        | "owner_id"
        | "conversation_id"
        | "direction"
        | "channel"
        | "body"
        | "occurred_at"
      >;
      activities: Table<
        Base & {
          prospect_id: string | null;
          type: string;
          description: string;
          metadata: Json;
        },
        "owner_id" | "type" | "description"
      >;
      exclusion_list: Table<
        Base & {
          contact_type: Database["public"]["Enums"]["contact_point_type"];
          normalized_value: string;
          reason: string | null;
        },
        "owner_id" | "contact_type" | "normalized_value"
      >;
      integration_connections: Table<
        Base &
          Updated & {
            provider: string;
            status: Database["public"]["Enums"]["integration_status"];
            encrypted_access_token: string | null;
            encrypted_refresh_token: string | null;
            token_expires_at: string | null;
            scopes: string[];
            metadata: Json;
          },
        "owner_id" | "provider"
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      search_status:
        "borrador" | "pendiente" | "analizando" | "completada" | "fallida";
      website_status:
        | "sin-sitio"
        | "desactualizado"
        | "solo-redes"
        | "basico"
        | "optimizado"
        | "desconocido";
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
      verification_status: "pendiente" | "verificado" | "invalido";
      audit_status: "pendiente" | "analizando" | "completada" | "fallida";
      proposal_status:
        | "borrador"
        | "lista"
        | "enviada"
        | "aceptada"
        | "negociacion"
        | "descartada";
      conversation_channel: "correo" | "whatsapp" | "telefono";
      conversation_status:
        | "sin-contactar"
        | "esperando-respuesta"
        | "respondio"
        | "seguimiento"
        | "negociacion"
        | "ganada"
        | "cerrada";
      message_direction: "entrante" | "saliente";
      integration_status: "pendiente" | "conectada" | "error" | "revocada";
    };
    CompositeTypes: Record<string, never>;
  };
};
