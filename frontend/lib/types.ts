export type FieldType = "text" | "number" | "email" | "date" | "select" | "textarea";

export type AppField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
};

export type AppConfig = {
  name: string;
  description?: string;
  theme: {
    primary: string;
    accent: string;
  };
  entity: {
    name: string;
    plural: string;
    fields: AppField[];
  };
  notifications: {
    event: "record.created" | "record.updated" | "csv.imported";
    message: string;
  }[];
};

export type GeneratedApp = {
  id: string;
  name: string;
  slug: string;
  config: AppConfig;
  records?: DynamicRecord[];
  _count?: { records: number };
};

export type DynamicRecord = {
  id: string;
  data: Record<string, string | number>;
  createdAt: string;
};
