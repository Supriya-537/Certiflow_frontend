import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);

  const loadData = async () => {
    const response = await api.get('/applications');
    setApplications(response.data.applications || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (applicationId, status, explanation, reason) => {
    await api.post(`/applications/${applicationId}/review`, {
      status,
      explanation,
      reason,
    });
    loadData();
  };

  const downloadDocument = async (application, document) => {
    const response = await api.get(
      `/applications/${application._id}/documents/${encodeURIComponent(document.filePath)}`,
      { responseType: 'blob' }
    );
    const downloadUrl = URL.createObjectURL(response.data);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = document.originalName;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const stats = [
    { label: 'Assigned', value: applications.length },
    { label: 'Pending review', value: applications.filter((app) => app.currentStatus === 'SUBMITTED' || app.currentStatus === 'UNDER_REVIEW').length },
    { label: 'Corrections', value: applications.filter((app) => app.currentStatus === 'ADDITIONAL_INFORMATION_REQUIRED').length },
    { label: 'Decisions', value: applications.filter((app) => app.currentStatus === 'APPROVED' || app.currentStatus === 'REJECTED').length },
  ];

  return (
    <div className="min-h-screen bg-slatewarm p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm text-slate-500">Officer portal</p>
            <h1 className="text-3xl font-bold text-navy">Application review desk</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sage/10 px-3 py-1 text-sm font-medium text-sage">{user?.name}</span>
            <button onClick={logout} className="rounded-xl border border-slate-200 px-4 py-2 font-medium">Logout</button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-navy">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">No assigned applications.</div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-slate-500">{app.referenceNumber}</p>
                    <h2 className="text-xl font-semibold text-navy">{app.certificateType}</h2>
                    <p className="mt-1 text-sm text-slate-600">Citizen: {app.citizen?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">{app.currentStatus}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Document review</p>
                    {app.supportingDocuments?.length ? (
                      <ul className="mt-2 space-y-2">
                        {app.supportingDocuments.map((document, index) => (
                          <li key={`${document.filePath || document.originalName}-${index}`}>
                            {document.filePath ? (
                              <button type="button" onClick={() => downloadDocument(app, document)} className="break-all text-left text-sm font-medium text-navy underline">
                                {document.originalName || document.name}
                              </button>
                            ) : (
                              <span className="break-all text-sm text-slate-700">{document.originalName || document.name}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-700">No supporting documents attached.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Officer notes</p>
                    <textarea
                      id={`note-${app._id}`}
                      placeholder="Add internal note or correction explanation"
                      className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Decision</p>
                    <select id={`status-${app._id}`} defaultValue={app.currentStatus} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="DOCUMENT_VERIFICATION">DOCUMENT_VERIFICATION</option>
                      <option value="ADDITIONAL_INFORMATION_REQUIRED">ADDITIONAL_INFORMATION_REQUIRED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                    <input
                      id={`reason-${app._id}`}
                      placeholder="Reason for approval/rejection"
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      const value = document.getElementById(`status-${app._id}`).value;
                      const note = document.getElementById(`note-${app._id}`).value;
                      const reason = document.getElementById(`reason-${app._id}`).value;
                      updateStatus(app._id, value, note, reason);
                    }}
                    className="rounded-xl bg-navy px-4 py-2.5 font-medium text-white"
                  >
                    Update application
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
