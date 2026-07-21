import { z } from "zod";

import { searchFormSchema } from "./search-form-schema";

export const discoveryRequestSchema = searchFormSchema.extend({
  confirmRepeated: z.preprocess((value) => value === true, z.boolean()),
});
