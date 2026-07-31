import { useEffect, useState } from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await apiService.admin.getSystemSettings();
        if (isMounted) {
          setSettings(response.data.settings || {});
        }
      } catch {
        if (isMounted) {
          setError('Unable to load system settings.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const settingsEntries = Object.entries(settings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">System tuning and configuration summary</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">System Configuration</h2>
            <p className="text-sm text-slate-400">Fetched from the backend settings endpoint</p>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading settings...</div>
        ) : settingsEntries.length === 0 ? (
          <div className="text-slate-400">No settings returned from the server.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {settingsEntries.map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  {key}
                </div>
                <div className="mt-2 text-sm text-white break-all">{String(value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
