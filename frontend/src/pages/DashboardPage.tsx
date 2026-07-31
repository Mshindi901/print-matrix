import { useEffect, useState } from 'react';
import { FileClock, PlusCircle, Send } from 'lucide-react';
import { apiService } from '../services/api';
import type { PrintJob } from '../types';

export const DashboardPage = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const jobsResponse = await apiService.printJobs.list();

        if (isMounted) {
          setJobs(jobsResponse.data.jobs || []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load your printing overview right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadOverview();
    return () => { isMounted = false; };
  }, []);

  const activeJobs = jobs.filter((job) => job.status === 'queued' || job.status === 'printing');
  const recentJobs = jobs.slice(0, 5);

  const cards = [
    { label: 'My print jobs', value: jobs.length, icon: FileClock },
    { label: 'Jobs in progress', value: activeJobs.length, icon: Send },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Printing</h1>
          <p className="mt-1 text-sm text-slate-400">Your recent print activity and current jobs.</p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById('new-print-job')?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          New print job
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{loading ? '...' : value}</p>
              </div>
              <div className="rounded-xl bg-indigo-600/10 p-2 text-indigo-400"><Icon className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="font-semibold text-white">Recent print jobs</h2>
        </div>
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-400">Loading your print jobs...</p>
        ) : recentJobs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">You have not submitted any print jobs yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentJobs.map((job) => (
              <div key={job.jobId} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-200">{job.fileName || job.jobId}</p>
                  <p className="mt-1 text-slate-400">{job.printerName || job.printerId}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${job.status === 'completed' || job.status === 'printing' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
