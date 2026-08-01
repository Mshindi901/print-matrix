import { FormEvent, useEffect, useState } from 'react';
import { Activity, FileText, PlusCircle, Printer as PrinterIcon, Users, X } from 'lucide-react';
import { apiService, getApiErrorMessage } from '../services/api';
import type { Printer, PrintAgent, User } from '../types';

type AdminStatistics = {
  totalUsers: number;
  activeUsers: number;
  totalPrinters: number;
  activePrinters: number;
  totalPrintJobs: number;
  jobsToday: number;
  jobsInQueue: number;
  averagePrintTime: string;
  successRate: string;
  totalPagesPrinted: number;
};

const emptyStatistics: AdminStatistics = {
  totalUsers: 0, activeUsers: 0, totalPrinters: 0, activePrinters: 0,
  totalPrintJobs: 0, jobsToday: 0, jobsInQueue: 0, averagePrintTime: '—', successRate: '—', totalPagesPrinted: 0,
};

export const AdminDashboardPage = () => {
  const [statistics, setStatistics] = useState<AdminStatistics>(emptyStatistics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printersLoading, setPrintersLoading] = useState(true);
  const [printersError, setPrintersError] = useState('');
  const [agents, setAgents] = useState<PrintAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState('');
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [savingPrinter, setSavingPrinter] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);
  const [printerError, setPrinterError] = useState('');
  const [agentError, setAgentError] = useState('');
  const [printerForm, setPrinterForm] = useState({
    name: '', location: '', ipAddress: '', agentId: '',
  });
  const [agentForm, setAgentForm] = useState({ location: '' });

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        const [statsResult, usersResult, printersResult, agentsResult] = await Promise.allSettled([
          apiService.admin.getDashboardStats(),
          apiService.admin.getAllUsers({ limit: 50 }),
          apiService.printers.list(),
          apiService.agents.list(),
        ]);

        if (isMounted) {
          if (statsResult.status === 'fulfilled') {
            setStatistics({ ...emptyStatistics, ...statsResult.value.data.statistics } as AdminStatistics);
          } else {
            setError('Unable to load admin statistics right now.');
          }

          if (usersResult.status === 'fulfilled') {
            console.log('Users response:', usersResult.value.data);
            setUsers(usersResult.value.data.data ?? []);
          } else {
            console.error('Users fetch failed:', usersResult.reason);
            setUsersError('Unable to load users right now.');
          }

          if (printersResult.status === 'fulfilled') {
            setPrinters(printersResult.value.data.printers ?? []);
          } else {
            setPrintersError('Unable to load printers right now.');
          }

          if (agentsResult.status === 'fulfilled') {
            setAgents(agentsResult.value.data.data ?? []);
          } else {
            setAgentsError('Unable to load agents right now.');
          }
        }
      } catch {
        if (isMounted) {
          setError('Unable to load admin statistics right now.');
          setUsersError('Unable to load users right now.');
          setPrintersError('Unable to load printers right now.');
          setAgentsError('Unable to load agents right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setUsersLoading(false);
          setPrintersLoading(false);
          setAgentsLoading(false);
        }
      }
    };

    void loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const cards = [
    { label: 'Total users', value: statistics.totalUsers, icon: Users },
    { label: 'Active users', value: statistics.activeUsers, icon: Activity },
    { label: 'Active printers', value: `${statistics.activePrinters} / ${statistics.totalPrinters}`, icon: PrinterIcon },
    { label: 'Jobs today', value: statistics.jobsToday, icon: FileText },
    { label: 'Jobs in queue', value: statistics.jobsInQueue, icon: FileText },
    { label: 'Total print jobs', value: statistics.totalPrintJobs, icon: FileText },
    { label: 'Success rate', value: statistics.successRate, icon: Activity },
    { label: 'Pages printed', value: statistics.totalPagesPrinted, icon: PrinterIcon },
  ];

  const addPrinter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPrinterError('');
    setSavingPrinter(true);

    try {
      await apiService.printers.create(printerForm);
      setShowAddPrinter(false);
      setPrinterForm({ name: '', location: '', ipAddress: '', agentId: '' });
    } catch (err: unknown) {
      setPrinterError(getApiErrorMessage(err));
    } finally {
      setSavingPrinter(false);
    }
  };

  const addAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAgentError('');
    setSavingAgent(true);

    try {
      const response = await apiService.agents.create(agentForm);
      setAgents((current) => [response.data.data, ...current]);
      setShowAddAgent(false);
      setAgentForm({ location: '' });
    } catch (err: unknown) {
      setAgentError(getApiErrorMessage(err));
    } finally {
      setSavingAgent(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">System-wide printing and usage overview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowAddAgent(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500">
            <PlusCircle className="h-4 w-4" /> Add print agent
          </button>
          <button type="button" onClick={() => setShowAddPrinter(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
            <PlusCircle className="h-4 w-4" /> Add printer
          </button>
        </div>
      </div>
      {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <Icon className="h-5 w-5 text-indigo-400" />
            <p className="mt-4 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
        Average print time: <span className="font-medium text-white">{loading ? '...' : statistics.averagePrintTime}</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Users</h2>
              <p className="mt-1 text-sm text-slate-400">All registered users in the system.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{users.length} users</span>
          </div>

          {usersLoading ? (
            <p className="text-sm text-slate-400">Loading users...</p>
          ) : usersError ? (
            <p className="text-sm text-rose-400">{usersError}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-3 font-medium">first_name</th>
                    <th className="pb-3 font-medium">last_name</th>
                    <th className="pb-3 font-medium">email</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">is_active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => {
                    const userRecord = user as User & Record<string, unknown>;
                    const firstName = (userRecord.firstName as string | undefined) || (userRecord.first_name as string | undefined) || '—';
                    const lastName = (userRecord.lastName as string | undefined) || (userRecord.last_name as string | undefined) || '—';
                    const phone = (userRecord.phone as string | undefined) || '—';
                    const isActive = userRecord.isActive ?? userRecord.is_active;
                    const statusLabel = isActive === true ? 'Active' : isActive === false ? 'Inactive' : '—';

                    return (
                      <tr key={user.userId} className="text-slate-300">
                        <td className="py-3 pr-3 font-medium text-white">{firstName}</td>
                        <td className="py-3 pr-3">{lastName}</td>
                        <td className="py-3 pr-3">{user.email || '—'}</td>
                        <td className="py-3 pr-3">{phone}</td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isActive === true ? 'bg-emerald-500/15 text-emerald-400' : isActive === false ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Agents</h2>
              <p className="mt-1 text-sm text-slate-400">Print agents created in the system.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{agents.length} agents</span>
          </div>

          {agentsLoading ? (
            <p className="text-sm text-slate-400">Loading agents...</p>
          ) : agentsError ? (
            <p className="text-sm text-rose-400">{agentsError}</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-slate-400">No agents found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Agent ID</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Location</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">API Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {agents.map((agent) => (
                    <tr key={String(agent.id)} className="text-slate-300">
                      <td className="py-3 px-4 font-medium text-white whitespace-nowrap">{String(agent.id)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{agent.location || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap break-all text-ellipsis">{agent.api_key || agent.apiKey || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Printers</h2>
              <p className="mt-1 text-sm text-slate-400">Printer inventory and current status.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{printers.length} printers</span>
          </div>

          {printersLoading ? (
            <p className="text-sm text-slate-400">Loading printers...</p>
          ) : printersError ? (
            <p className="text-sm text-rose-400">{printersError}</p>
          ) : printers.length === 0 ? (
            <p className="text-sm text-slate-400">No printers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Name</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Location</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">IP Address</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Agent Id</th>
                    <th className="pb-3 px-4 font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {printers.map((printer) => (
                    <tr key={printer.printerId} className="text-slate-300">
                      <td className="py-3 px-4 font-medium text-white whitespace-nowrap">{printer.name || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{printer.location || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{printer.ip_address || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{printer.agent_id || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{printer.status || 'unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showAddPrinter && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4">
          <form onSubmit={addPrinter} className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold text-white">Add printer</h2><p className="mt-1 text-sm text-slate-400">Register a printer for the system.</p></div>
              <button type="button" onClick={() => setShowAddPrinter(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {printerError && <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{printerError}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ['name', 'Printer name', 'text'], ['location', 'Location', 'text'], ['ipAddress', 'IP address', 'text'], ['agentId', 'Printer agent ID', 'text'],
              ] as const).map(([field, label, type]) => (
                <label key={field} className="text-sm text-slate-300"><span className="mb-1 block">{label}</span><input required type={type} value={printerForm[field]} onChange={(event) => setPrinterForm({ ...printerForm, [field]: event.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white" /></label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowAddPrinter(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={savingPrinter} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{savingPrinter ? 'Adding...' : 'Add printer'}</button></div>
          </form>
        </div>
      )}

      {showAddAgent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4">
          <form onSubmit={addAgent} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold text-white">Add print agent</h2><p className="mt-1 text-sm text-slate-400">Create a new print agent location.</p></div>
              <button type="button" onClick={() => setShowAddAgent(false)} className="p-1 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {agentError && <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{agentError}</div>}
            <label className="text-sm text-slate-300 block">
              <span className="mb-1 block">Agent location</span>
              <input
                required
                type="text"
                value={agentForm.location}
                onChange={(event) => setAgentForm({ location: event.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowAddAgent(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancel</button><button disabled={savingAgent} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{savingAgent ? 'Adding...' : 'Add agent'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
