import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState({ totalApplications: 0, pending: 0, approved: 0, rejected: 0, officers: 0, citizens: 0, summary: { statusBreakdown: [] } });
  const [users, setUsers] = useState([]);

  const loadData = async () => {
    const [analyticsResponse, usersResponse] = await Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/users'),
    ]);
    setAnalytics(analyticsResponse.data);
    setUsers(usersResponse.data.users || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const delayedApplications = [
    { reference: 'CERI-205', officer: 'Officer One', status: 'UNDER_REVIEW', delay: '4 days' },
    { reference: 'CERI-330', officer: 'Officer Two', status: 'DOCUMENT_VERIFICATION', delay: '3 days' },
  ];

  return (
    <div className="min-h-screen bg-slatewarm p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm text-slate-500">Administrator portal</p>
            <h1 className="text-3xl font-bold text-navy">Operations overview</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sage/10 px-3 py-1 text-sm font-medium text-sage">{user?.name}</span>
            <button onClick={logout} className="rounded-xl border border-slate-200 px-4 py-2 font-medium">Logout</button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          {[
            ['Applications', analytics.totalApplications],
            ['Pending', analytics.pending],
            ['Approved', analytics.approved],
            ['Rejected', analytics.rejected],
            ['Officers', analytics.officers],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-navy">User management</h2>
              <div className="space-y-3">
                {users.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-navy">{entry.name}</p>
                      <p className="text-sm text-slate-500">{entry.role}</p>
                    </div>
                    <span className="rounded-full bg-sage/10 px-2 py-1 text-xs font-medium text-sage">{entry.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-navy">Delayed applications</h2>
              <div className="space-y-3">
                {delayedApplications.map((entry) => (
                  <div key={entry.reference} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium text-navy">{entry.reference}</p>
                      <p className="text-sm text-slate-500">{entry.officer} • {entry.status}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{entry.delay}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-navy">Status distribution</h2>
              <div className="space-y-3">
                {(analytics.summary?.statusBreakdown || []).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between text-sm">
                    <span>{entry._id || 'Unknown'}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-navy">Assignments</h2>
              <div className="space-y-3">
                <button className="w-full rounded-xl bg-navy px-4 py-3 font-medium text-white">Assign officer to pending review</button>
                <button className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700">Export CSV report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
