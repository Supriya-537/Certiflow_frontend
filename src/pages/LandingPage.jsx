import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const certificateCategories = [
  'Income Certificate',
  'Caste Certificate',
  'Residence Certificate',
  'Other Certificate Types',
];

const faqs = [
  { q: 'How long does review take?', a: 'Prototype timelines vary by workload and can be configured in the admin dashboard.' },
  { q: 'Can I track my application online?', a: 'Yes—use the public tracking form below with your application reference number.' },
  { q: 'What happens if documents are missing?', a: 'An officer can request additional information and the citizen can respond through the portal.' },
];

export default function LandingPage() {
  const [reference, setReference] = useState('');
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (event) => {
    event.preventDefault();
    try {
      const response = await api.get('/applications/track', { params: { referenceNumber: reference } });
      setTracking(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Tracking failed.');
      setTracking(null);
    }
  };

  return (
    <div className="min-h-screen bg-slatewarm text-slate-800">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 font-semibold text-navy">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-lg text-white">C</span>
            Certiflow
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#certificates">Certificates</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Login</Link>
            <Link to="/auth" className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white">Apply now</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-sage/20 bg-sage/10 px-3 py-1 text-sm font-medium text-sage">
              Public service workflow made simple
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-bold tracking-tight text-navy md:text-6xl">
                Apply for certificates with clearer status tracking.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Certiflow helps citizens submit certificate requests, receive updates, and monitor processing transparently through a secure digital workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="rounded-xl bg-navy px-6 py-3 font-medium text-white shadow-sm">Apply for a Certificate</Link>
              <a href="#track" className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700">Track an Application</a>
            </div>
            <div className="grid gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-bold text-navy">3-step</div>
                <div>Application flow</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">24/7</div>
                <div>Status visibility</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">Secure</div>
                <div>Role-based access</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Application tracking</p>
                  <h2 className="text-xl font-semibold text-navy">Check status</h2>
                </div>
                <span className="rounded-full bg-sage/10 px-2 py-1 text-xs font-medium text-sage">Demo mode</span>
              </div>
              <form id="track" onSubmit={handleTrack} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Reference number</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 focus:border-sage"
                  placeholder="CERI-ABCD1234"
                />
                <button type="submit" className="w-full rounded-xl bg-sage px-4 py-3 font-medium text-white">Track application</button>
              </form>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {tracking && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                  <div className="flex justify-between"><span>Reference</span><strong>{tracking.referenceNumber}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Certificate</span><strong>{tracking.certificateType}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Status</span><strong>{tracking.currentStatus}</strong></div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">How it works</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">A transparent certificate process</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['1', 'Create account', 'Citizens register and secure their profile in a few steps.'],
                ['2', 'Submit application', 'Choose a certificate type and upload required supporting documents.'],
                ['3', 'Track and respond', 'Monitor decisions, requests for corrections, and processing status.'],
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{step}</div>
                  <h3 className="text-xl font-semibold text-navy">{title}</h3>
                  <p className="mt-3 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="certificates" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">Supported categories</p>
            <h2 className="mt-2 text-3xl font-bold text-navy">Certificate categories</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {certificateCategories.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-12 w-12 rounded-xl bg-sage/10 text-center text-xl leading-[3rem] text-sage">✓</div>
                <h3 className="text-lg font-semibold text-navy">{item}</h3>
                <p className="mt-2 text-sm text-slate-600">Prototype workflow and document requirements are demonstrated here.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-navy py-16 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                ['Transparent', 'Clear status and feedback at every stage.'],
                ['Secure', 'Role-based permissions and authenticated access.'],
                ['Efficient', 'Centralized review flow and monitoring.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold text-navy">Frequently asked questions</h2>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-navy">{q}</h3>
                <p className="mt-2 text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:justify-between">
          <div>© 2026 Certiflow prototype.</div>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
