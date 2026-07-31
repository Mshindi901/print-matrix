import { useEffect, useState } from 'react';
import { FileText, CircleAlert } from 'lucide-react';
import { apiService } from '../services/api';
import type { PrintJob } from '../types';

export const PrintJobsPage = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const response = await apiService.printJobs.list();
        if (isMounted) {
          setJobs(response.data.jobs || []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load print jobs from the server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Print Jobs</h1>
        <p className="text-slate-400 text-sm mt-1">Review active and completed print requests</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="grid grid-cols-6 gap-3 bg-slate-950/70 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
          <span>Job</span>
          <span>Printer</span>
          <span>Status</span>
          <span>Copies</span>
          <span>Color</span>
          <span>Pages</span>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-slate-400">Loading print jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="px-4 py-8 text-slate-400">No print jobs found.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.jobId} className="grid grid-cols-6 gap-3 px-4 py-4 border-t border-slate-800 text-sm text-slate-200">
              <span className="truncate"><FileText className="inline h-4 w-4 mr-2 text-indigo-400" />{job.jobId}</span>
              <span>{job.printerName || job.printerId}</span>
              <span className="capitalize">{job.status}</span>
              <span>{job.copies}</span>
              <span className="capitalize">{job.colorMode}</span>
              <span>{job.pageRange ?? '-'}</span>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300 flex items-center gap-2">
        <CircleAlert className="h-4 w-4 text-amber-400" />
        This page uses the documented print-jobs API and will render live data once the backend is reachable.
      </div>
    </div>
  );
};
