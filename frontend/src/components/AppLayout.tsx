// src/components/AppLayout.tsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Printer, FileText, BarChart3, Menu, X, PlusCircle, ShieldCheck, LogOut } from 'lucide-react';
import { apiService, clearAuthSession, getApiErrorMessage } from '../services/api';
import type { Printer as PrinterType } from '../types';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [refreshingOptions, setRefreshingOptions] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [notification] = useState<{ tone: 'success' | 'error'; message: string } | null>(() => {
    const message = sessionStorage.getItem('authMessage');
    if (message) {
      sessionStorage.removeItem('authMessage');
      return { tone: 'success', message };
    }
    return null;
  });
  const [availablePrinters, setAvailablePrinters] = useState<PrinterType[]>([]);
  const [availableFiles, setAvailableFiles] = useState<Array<Record<string, unknown>>>([]);
  const [jobForm, setJobForm] = useState({
    printerId: '',
    fileId: '',
    copies: 1,
    colorMode: 'bw' as 'color' | 'bw' | 'grayscale',
    pageRange: '',
    notes: '',
  });

  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null') as Record<string, unknown> | null;
      const role = typeof user?.role === 'string' ? user.role.toLowerCase() : undefined;
      if (role === 'admin') {
        return true;
      }

      if (Array.isArray(user?.roles)) {
        return user.roles.some((value) => typeof value === 'string' && value.toLowerCase().includes('admin'));
      }

      return user?.isAdmin === true;
    } catch {
      return false;
    }
  })();

  // Extract role or user name dynamically from stored session/user object
  const userDisplayLabel = (() => {
    try {
      // 1. Try reading directly from 'user' or nested inside 'authSession'
      const rawUser = localStorage.getItem('user');
      const rawSession = localStorage.getItem('authSession');

      let user: Record<string, unknown> | null = null;

      if (rawUser) {
        user = JSON.parse(rawUser) as Record<string, unknown>;
      } else if (rawSession) {
        const session = JSON.parse(rawSession) as Record<string, unknown>;
        user = (session.user as Record<string, unknown>) || null;
      }

      if (!user) return 'User';

      // 2. Check for 'role' inside user object ("role": "admin")
      const rawRole = typeof user.role === 'string' ? user.role : undefined;

      // 3. Check for name properties if available
      const name =
        (typeof user.firstName === 'string' && user.firstName) ||
        (typeof user.first_name === 'string' && user.first_name) ||
        (typeof user.name === 'string' && user.name) ||
        (typeof user.username === 'string' && user.username);

      if (name) return name;

      if (rawRole) {
        // Capitalize: "admin" -> "Admin", "user" -> "User"
        return rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
      }

      return 'User';
    } catch {
      return 'User';
    }
  })();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Jobs', href: '/print-jobs', icon: FileText },
    ...(isAdmin ? [{ name: 'Printers', href: '/printers', icon: Printer }, { name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const loadModalOptions = async () => {
    setLoadingOptions(true);
    setFormError('');

    try {
      const [printersResponse, filesResponse] = await Promise.all([
        apiService.printers.list(),
        apiService.files.list(),
      ]);

      setAvailablePrinters(printersResponse.data.printers || []);
      setAvailableFiles(filesResponse.data.files || []);

      if (printersResponse.data.printers?.length) {
        const firstPrinter = printersResponse.data.printers[0] as unknown as Record<string, unknown>;
        const selectedPrinterId = String(firstPrinter.printerId || firstPrinter.id || firstPrinter._id || '');
        setJobForm((current) => ({ ...current, printerId: selectedPrinterId }));
      }

      if (filesResponse.data.files?.length) {
        const firstFile = filesResponse.data.files[0] as unknown as Record<string, unknown>;
        const selectedFileId = String(firstFile.fileId || firstFile.id || firstFile._id || '');
        setJobForm((current) => ({ ...current, fileId: selectedFileId }));
      }
    } catch {
      setFormError('Unable to load available printers or files right now.');
    } finally {
      setLoadingOptions(false);
      setRefreshingOptions(false);
    }
  };

  const openCreateJobModal = () => {
    setShowCreateJobModal(true);
    void loadModalOptions();
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    const firstPrinter = availablePrinters[0] as unknown as Record<string, unknown> | undefined;
    const activePrinterId = jobForm.printerId || String(firstPrinter?.printerId || firstPrinter?.id || firstPrinter?._id || '');

    const firstFile = availableFiles[0] as unknown as Record<string, unknown> | undefined;
    const activeFileId = jobForm.fileId || String(firstFile?.fileId || firstFile?.id || firstFile?._id || '');

    if (!activePrinterId || !activeFileId) {
      setFormError('Please select a valid printer and file.');
      setSubmitting(false);
      return;
    }
    try {

      console.log('Sending printerId:', activePrinterId, 'fileId:', activeFileId);
      const response = await apiService.printJobs.create({
        printerId: activePrinterId,
        fileId: activeFileId,
        copies: jobForm.copies,
        colorMode: jobForm.colorMode,
        pageRange: jobForm.pageRange || undefined,
        notes: jobForm.notes || undefined,
      });

      if (response.data.success) {
        setFormSuccess(response.data.message || 'Print job created successfully.');

        const firstPrinter = availablePrinters[0] as unknown as Record<string, unknown> | undefined;
        const firstFile = availableFiles[0] as unknown as Record<string, unknown> | undefined;

        setJobForm({
          printerId: String(firstPrinter?.printerId || firstPrinter?.id || firstPrinter?._id || ''),
          fileId: String(firstFile?.fileId || firstFile?.id || firstFile?._id || ''),
          copies: 1,
          colorMode: 'bw',
          pageRange: '',
          notes: '',
        });
      }
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err) || 'Unable to create the print job right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingFile(true);
    setFormError('');
    setFormSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.files.upload(formData);

      if (response.data.success) {
        setAvailableFiles((current) => [
          ...(current ?? []),
          {
            fileId: response.data.fileId,
            fileName: response.data.fileName,
            uploadedAt: response.data.uploadedAt,
          },
        ]);

        setJobForm((current) => ({
          ...current,
          fileId: response.data.fileId,
        }));

        setFormSuccess(response.data.message || 'File uploaded successfully.');
      }
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err) || 'Unable to upload the selected file.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex overflow-hidden font-sans">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Printer className="h-6 w-6" />
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PrintFlow
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            id="new-print-job"
            type="button"
            onClick={openCreateJobModal}
            className="sr-only"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Print Job</span>
          </button>

          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-200 capitalize">{userDisplayLabel}</p>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      {showCreateJobModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-[0_20px_90px_rgba(2,6,23,0.9)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Create Print Job</h2>
                <p className="text-sm text-slate-400">Send a new print request to the backend.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefreshingOptions(true);
                    void loadModalOptions();
                  }}
                  className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
                  disabled={loadingOptions || refreshingOptions}
                >
                  {refreshingOptions ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <span className="mb-1 block">Printer</span>
                  <select
                    required
                    value={jobForm.printerId}
                    onChange={(e) => setJobForm({ ...jobForm, printerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    disabled={loadingOptions || availablePrinters.length === 0}
                  >
                    {availablePrinters.map((printer) => {
                      const p = printer as unknown as Record<string, unknown>;
                      const id = String(p.printerId || p.id || p._id || '');
                      return (
                        <option key={id} value={id}>
                          {String(p.name || 'Printer')} ({String(p.location || 'Unknown')})
                        </option>
                      );
                  })}
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  <span className="mb-1 block">File</span>
                  <select
                    required
                    value={jobForm.fileId}
                    onChange={(e) => setJobForm({ ...jobForm, fileId: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    disabled={loadingOptions || availableFiles.length === 0}
                  >
                    {availableFiles.length === 0 ? (
                      <option value="">No uploaded files yet</option>
                    ) : (
                      availableFiles.map((file) => {
                        const f = file as unknown as Record<string, unknown>;
                        const id = String(f.fileId || f.id || f._id || '');
                        const name = String(f.fileName || f.filename || f.originalName || f.name || id || 'Unnamed file');
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })
                    )}
                  </select>
                </label>

                <label className="text-sm text-slate-300">
                  <span className="mb-1 block">Copies</span>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.copies}
                    onChange={(e) => setJobForm({ ...jobForm, copies: Number(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  <span className="mb-1 block">Color Mode</span>
                  <select
                    value={jobForm.colorMode}
                    onChange={(e) => setJobForm({ ...jobForm, colorMode: e.target.value as 'color' | 'bw' | 'grayscale' })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="bw">BW</option>
                    <option value="color">Color</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-sm font-medium text-slate-200 mb-2">Upload a file for this job</div>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-300">
                  <span>{uploadingFile ? 'Uploading...' : 'Choose file to upload'}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
              </div>

              <label className="block text-sm text-slate-300">
                <span className="mb-1 block">Page Range</span>
                <input
                  value={jobForm.pageRange}
                  onChange={(e) => setJobForm({ ...jobForm, pageRange: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  placeholder="1-10"
                />
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-1 block">Notes</span>
                <textarea
                  rows={3}
                  value={jobForm.notes}
                  onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  placeholder="Optional instructions"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateJobModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        {notification && (
          <div className={`mx-6 mt-4 rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${
            notification.tone === 'error'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
          }`}>
            <div className="flex items-start gap-3">
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
