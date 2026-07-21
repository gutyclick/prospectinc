import { describe, expectTypeOf, it } from "vitest";

import type { Database } from "./database.types";

describe("tipos generados de base de datos", () => {
  it("expone filas e inserciones tipadas", () => {
    type ProspectRow = Database["public"]["Tables"]["prospects"]["Row"];
    type ContactInsert =
      Database["public"]["Tables"]["contact_points"]["Insert"];
    type CacheInsert =
      Database["public"]["Tables"]["place_discovery_cache"]["Insert"];
    type AuditRow = Database["public"]["Tables"]["website_audits"]["Row"];

    expectTypeOf<ProspectRow["owner_id"]>().toEqualTypeOf<string>();
    expectTypeOf<ProspectRow["opportunity_score"]>().toEqualTypeOf<number>();
    expectTypeOf<ContactInsert["source_url"]>().toEqualTypeOf<string>();
    expectTypeOf<ContactInsert["source_type"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<CacheInsert["expires_at"]>().toEqualTypeOf<string>();
    expectTypeOf<AuditRow["initial_url"]>().toEqualTypeOf<string | null>();
  });
});
