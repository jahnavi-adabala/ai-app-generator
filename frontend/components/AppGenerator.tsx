"use client";

import { Bell, Code2, Database, LogOut, Plus, RefreshCw, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { sampleConfig } from "@/lib/sample-config";
import { AppConfig, DynamicRecord, GeneratedApp } from "@/lib/types";

type Notice = {
  id: string;
  message: string;
  type: string;
  read: boolean;
};

type Props = {
  onLogout: () => void;
};

export function AppGenerator({ onLogout }: Props) {
  const [configText, setConfigText] = useState(JSON.stringify(sampleConfig, null, 2));
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [selected, setSelected] = useState<GeneratedApp | null>(null);
  const [notifications, setNotifications] = useState<Notice[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  const config = useMemo(() => {
    try {
      return JSON.parse(configText) as AppConfig;
    } catch {
      return null;
    }
  }, [configText]);

  async function load() {
    const [loadedApps, loadedNotifications] = await Promise.all([
      api<GeneratedApp[]>("/api/apps"),
      api<Notice[]>("/api/notifications")
    ]);
    setApps(loadedApps);
    setNotifications(loadedNotifications);
    if (!selected && loadedApps[0]) {
      openApp(loadedApps[0].id);
    }
  }

  async function openApp(id: string) {
    const app = await api<GeneratedApp>(`/api/apps/${id}`);
    setSelected(app);
    setForm({});
  }

  async function generateApp() {
    if (!config) {
      setStatus("JSON config is invalid.");
      return;
    }
    const app = await api<GeneratedApp>("/api/apps", {
      method: "POST",
      body: JSON.stringify({ config })
    });
    setStatus(`${app.name} generated.`);
    await load();
    await openApp(app.id);
  }

  async function addRecord(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;

    await api<DynamicRecord>(`/api/apps/${selected.id}/records`, {
      method: "POST",
      body: JSON.stringify({ data: form })
    });
    setStatus(`${selected.config.entity.name} added.`);
    await openApp(selected.id);
    await load();
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.[0]) return;
    const data = new FormData();
    data.append("file", event.target.files[0]);

    const result = await api<{ imported: number }>(`/api/apps/${selected.id}/import-csv`, {
      method: "POST",
      body: data
    });
    setStatus(`Imported ${result.imported} rows.`);
    await openApp(selected.id);
    await load();
  }

  function logout() {
    localStorage.removeItem("token");
    onLogout();
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold">AI App Generator</h1>
            <p className="text-sm text-slate-600">JSON config to full CRUD app</p>
          </div>
          <button
            onClick={logout}
            className="focus-ring flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-5 py-5 lg:grid-cols-[360px_1fr_300px]">
        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Code2 size={18} /> Config
              </h2>
              <button
                onClick={generateApp}
                className="focus-ring flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white"
              >
                <Plus size={15} /> Generate
              </button>
            </div>
            <textarea
              value={configText}
              onChange={(event) => setConfigText(event.target.value)}
              className="focus-ring h-[520px] w-full resize-none rounded-md border border-line bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-100"
              spellCheck={false}
            />
          </section>
        </aside>

        <section className="space-y-5">
          <div className="rounded-lg border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Database size={18} /> Generated Apps
              </h2>
              <button
                onClick={() => load().catch((error) => setStatus(error.message))}
                className="focus-ring rounded-md border border-line p-2"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  className={`focus-ring rounded-md border p-3 text-left ${
                    selected?.id === app.id ? "border-blue-600 bg-blue-50" : "border-line"
                  }`}
                >
                  <p className="font-semibold">{app.name}</p>
                  <p className="text-sm text-slate-600">{app._count?.records ?? 0} records</p>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="rounded-lg border border-line bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-slate-600">{selected.config.description}</p>
                </div>
                <label className="focus-ring flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold">
                  <Upload size={16} /> Import CSV
                  <input type="file" accept=".csv" onChange={importCsv} className="hidden" />
                </label>
              </div>

              <form onSubmit={addRecord} className="mb-5 grid gap-3 rounded-md bg-panel p-3 md:grid-cols-2">
                {selected.config.entity.fields.map((field) => (
                  <label key={field.key} className="text-sm font-medium">
                    {field.label}
                    {field.type === "select" ? (
                      <select
                        value={form[field.key] || ""}
                        onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                        className="focus-ring mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
                        required={field.required}
                      >
                        <option value="">Select</option>
                        {field.options?.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={form[field.key] || ""}
                        onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                        className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={form[field.key] || ""}
                        onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                        className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
                        required={field.required}
                      />
                    )}
                  </label>
                ))}
                <button className="focus-ring rounded-md bg-teal-700 px-4 py-2 font-semibold text-white md:self-end">
                  Add {selected.config.entity.name}
                </button>
              </form>

              <div className="overflow-auto rounded-md border border-line">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      {selected.config.entity.fields.map((field) => (
                        <th key={field.key} className="border-b border-line px-3 py-2">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.records?.map((record) => (
                      <tr key={record.id}>
                        {selected.config.entity.fields.map((field) => (
                          <td key={field.key} className="border-b border-line px-3 py-2">
                            {String(record.data[field.key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Bell size={18} /> Notifications
            </h2>
            <div className="space-y-2">
              {notifications.map((notice) => (
                <div key={notice.id} className="rounded-md border border-line bg-panel p-3">
                  <p className="text-sm font-medium">{notice.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{notice.type}</p>
                </div>
              ))}
            </div>
          </section>
          {status && (
            <p className="rounded-lg border border-line bg-white p-3 text-sm text-slate-700">{status}</p>
          )}
        </aside>
      </div>
    </main>
  );
}
