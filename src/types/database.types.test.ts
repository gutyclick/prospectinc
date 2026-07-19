import { describe, expectTypeOf, it } from "vitest";

import type { Database } from "./database.types";

describe("tipos generados de base de datos", () => {
  it("expone filas e inserciones tipadas", () => {
    type ProspectRow = Database["public"]["Tables"]["prospects"]["Row"];
    type ContactInsert =
      Database["public"]["Tables"]["contact_points"]["Insert"];

    expectTypeOf<ProspectRow["owner_id"]>().toEqualTypeOf<string>();
    expectTypeOf<ProspectRow["opportunity_score"]>().toEqualTypeOf<number>();
    expectTypeOf<ContactInsert["source_url"]>().toEqualTypeOf<string>();
  });
});
