import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const certificateChoices = ['Income Certificate', 'Caste Certificate', 'Residence Certificate', 'Other Certificate Types'];

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({ total: 0, underReview: 0, corrections: 0, approved: 0, recent: [] });
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [draft, setDraft] = useState({
    certificateType: 'Income Certificate',
    applicantDetails: { name: user?.name || '', email: user?.email || '', phone: '', address: '' },
    certDetails: { reason: '', village: '', purpose: '' },
    supportingDocuments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [summaryResponse, appResponse] = await Promise.all([
        api.get('/applications/dashboard'),
        api.get('/applications'),
      ]);
      setSummary(summaryResponse.data);
      setApplications(appResponse.data.applications || []);
    } catch (error) {
      setMessage('Unable to load your portal data right now.');
      setMessageIsError(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageIsError(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('certificateType', draft.certificateType);
      formData.append('applicantDetails', JSON.stringify(draft.applicantDetails));
      formData.append('certDetails', JSON.stringify(draft.certDetails));
      selectedFiles.forEach((file) => formData.append('supportingDocuments', file));

      const created = await api.post('/applications', formData);
      const app = created.data.application;
      await api.post(`/applications/${app._id}/submit`);
      setMessage(`Application submitted successfully. Reference: ${app.referenceNumber}`);
      setMessageIsError(false);
      setSelectedFiles([]);
      setDraft({
        certificateType: 'Income Certificate',
        applicantDetails: { name: user?.name || '', email: user?.email || '', phone: '', address: '' },
        certDetails: { reason: '', village: '', purpose: '' },
        supportingDocuments: [],
      });
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to submit your application. Please try again.');
      setMessageIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (selectedFiles.length + incomingFiles.length > 5) {
      setMessage('You can attach up to 5 documents per application.');
      setMessageIsError(true);
      return;
    }
    if (incomingFiles.some((file) => file.size > 10 * 1024 * 1024)) {
      setMessage('Each document must be 10 MB or smaller.');
      setMessageIsError(true);
      return;
    }

    setMessage('');
    setMessageIsError(false);
    setSelectedFiles((current) => [...current, ...incomingFiles]);
  };

  return (
    <div className="min-h-screen bg-slatewarm p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-500">Citizen portal</p>
            <h1 className="text-3xl font-bold text-navy">Welcome, {user?.name || 'Citizen'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sage/10 px-3 py-1 text-sm font-medium text-sage">Application tracking enabled</span>
            <button onClick={logout} className="rounded-xl border border-slate-200 px-4 py-2 font-medium">Logout</button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ['Total', summary.total],
            ['Under review', summary.underReview],
            ['Corrections', summary.corrections],
            ['Approved', summary.approved],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-navy">My applications</h2>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Download summary</button>
              </div>

              <div className="space-y-3">
                {applications.length === 0 ? (
                  <p className="text-slate-500">No applications yet. Start by submitting your first request.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app._id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <p className="text-sm text-slate-500">{app.referenceNumber}</p>
                          <h3 className="font-semibold text-navy">{app.certificateType}</h3>
                          <p className="mt-1 text-sm text-slate-500">Submitted on: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="rounded-full bg-sage/10 px-2 py-1 text-xs font-medium text-sage">{app.currentStatus}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-navy">Status timeline</h2>
              <div className="space-y-3">
                {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED'].map((status, index) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-navy text-white' : 'bg-sage/10 text-sage'}`}>
                      {index + 1}
                    </div>
                    <span className="text-sm text-slate-600">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-navy">Certificate application</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Certificate type</label>
                <select
                  value={draft.certificateType}
                  onChange={(e) => setDraft({ ...draft, certificateType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  {certificateChoices.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Applicant name</label>
                <input
                  value={draft.applicantDetails.name}
                  onChange={(e) => setDraft({ ...draft, applicantDetails: { ...draft.applicantDetails, name: e.target.value } })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    value={draft.applicantDetails.phone}
                    onChange={(e) => setDraft({ ...draft, applicantDetails: { ...draft.applicantDetails, phone: e.target.value } })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    value={draft.applicantDetails.email}
                    onChange={(e) => setDraft({ ...draft, applicantDetails: { ...draft.applicantDetails, email: e.target.value } })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Purpose</label>
                <input
                  value={draft.certDetails.purpose || ''}
                  onChange={(e) => setDraft({ ...draft, certDetails: { ...draft.certDetails, purpose: e.target.value } })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Village / locality</label>
                <input
                  value={draft.certDetails.village || ''}
                  onChange={(e) => setDraft({ ...draft, certDetails: { ...draft.certDetails, village: e.target.value } })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              </div>

              <div>
                <label htmlFor="supporting-documents" className="mb-1 block text-sm font-medium text-slate-700">Supporting documents</label>
                <input
                  id="supporting-documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelection}
                  className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-medium file:text-slate-700"
                />
                <p className="mt-1 text-xs text-slate-500">PDF, Word, JPG, PNG, or WEBP · up to 5 files · 10 MB each</p>
                {selectedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2" aria-label="Selected supporting documents">
                    {selectedFiles.map((file, index) => (
                      <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate">{file.name} <span className="text-slate-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span></span>
                        <button type="button" onClick={() => setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))} className="shrink-0 text-sm font-medium text-red-600" aria-label={`Remove ${file.name}`}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {message && <p aria-live="polite" className={`text-sm font-medium ${messageIsError ? 'text-red-600' : 'text-sage'}`}>{message}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-navy px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
