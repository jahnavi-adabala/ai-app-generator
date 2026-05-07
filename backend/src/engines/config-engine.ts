import { z } from "zod";

const fieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "email", "date", "select", "textarea"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional()
});

export const appConfigSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  theme: z
    .object({
      primary: z.string().default("#2563eb"),
      accent: z.string().default("#16a34a")
    })
    .default({ primary: "#2563eb", accent: "#16a34a" }),
  entity: z.object({
    name: z.string().min(1),
    plural: z.string().min(1),
    fields: z.array(fieldSchema).min(1)
  }),
  notifications: z
    .array(
      z.object({
        event: z.enum(["record.created", "record.updated", "csv.imported"]),
        message: z.string().min(1)
      })
    )
    .default([])
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export function parseAppConfig(input: unknown): AppConfig {
  return appConfigSchema.parse(input);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateRecord(config: AppConfig, data: Record<string, unknown>) {
  const missing = config.entity.fields
    .filter((field) => field.required)
    .filter((field) => data[field.key] === undefined || data[field.key] === "")
    .map((field) => field.label);

  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  return config.entity.fields.reduce<Record<string, unknown>>((record, field) => {
    record[field.key] = data[field.key] ?? "";
    return record;
  }, {});
}
