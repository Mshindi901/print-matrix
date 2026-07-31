import { useEffect, useState } from 'react';
import { Printer, CircleAlert } from 'lucide-react';
import { apiService } from '../services/api';
import type { Printer as PrinterType } from '../types';

export const PrintersPage = () => {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPrinters = async () => {
      try {
        const response = await apiService.printers.list();
        if (isMounted) {
          setPrinters(response.data.printers || []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load printers from the server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPrinters();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Printers</h1>
        <p className="text-slate-400 text-sm mt-1">Status and capacity overview for all registered devices</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
            Loading printers...
          </div>
        ) : printers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
            No printers found.
          </div>
        ) : (
          printers.map((printer) => (
            <div key={printer.printerId} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                    <Printer className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{printer.name}</h2>
                    <p className="text-xs text-slate-400">{printer.model}</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400 capitalize">
                  {printer.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex justify-between"><span>Location</span><span>{printer.location}</span></div>
                <div className="flex justify-between"><span>Queue</span><span>{printer.currentQueue}</span></div>
                <div className="flex justify-between"><span>Max Pages</span><span>{printer.maxPages}</span></div>
                <div className="flex justify-between"><span>IP</span><span>{printer.ipAddress}</span></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300 flex items-center gap-2">
        <CircleAlert className="h-4 w-4 text-amber-400" />
        Device cards are connected to the printers endpoint and will populate automatically when the API is reachable.
      </div>
    </div>
  );
};
