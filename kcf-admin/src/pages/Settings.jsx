import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';

function BrandingTab({ settings }) {
  const update = useUpdateSiteSetting();
  const toMap = (arr) => arr.reduce((m, r) => { m[r.key] = r.value || ''; return m; }, {});
  const [form, setForm] = useState(toMap(settings));

  useEffect(() => { setForm(toMap(settings)); }, [settings]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) => update.mutateAsync({ key, value }))
      );
      toast.success('Settings saved');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
        <input value={form.org_name || ''} onChange={e => set('org_name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
        <input value={form.logo_url || ''} onChange={e => set('logo_url', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
        {form.logo_url && <img src={form.logo_url} alt="Logo preview" className="mt-2 h-10 rounded object-contain border border-gray-200 p-1" onError={e => e.target.style.display = 'none'} />}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.primary_color || '#f43f5e'} onChange={e => set('primary_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
          <input value={form.primary_color || ''} onChange={e => set('primary_color', e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="#f43f5e" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
        <input value={form.contact_email || ''} onChange={e => set('contact_email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Footer Tagline</label>
        <input value={form.footer_tagline || ''} onChange={e => set('footer_tagline', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={handleSave} disabled={update.isPending} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
        {update.isPending ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Supabase Backend</strong> is connected. Your project URL and keys are managed via environment variables.
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Supabase</p>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project URL (from env)</label>
            <input readOnly value={import.meta.env.VITE_SUPABASE_URL || ''} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Stripe</p>
        <p className="text-xs text-gray-400 mb-3">Stripe is configured via the <code>VITE_STRIPE_PUBLISHABLE_KEY</code> environment variable on the main website.</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">OpenAI (AI Assistant)</p>
        <p className="text-xs text-gray-400 mb-3">OpenAI is configured via <code>VITE_OPENAI_API_KEY</code> on the main website.</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        To update API keys, edit the environment variables on your Netlify (main site) or Cloudflare Pages (admin) deployment settings.
      </div>
    </div>
  );
}

function SecurityTab() {
  const { data: settings = [] } = useSiteSettings();
  const update = useUpdateSiteSetting();
  const adminEmailsSetting = settings.find(s => s.key === 'admin_allowed_emails');
  const [emails, setEmails] = useState('');

  useEffect(() => {
    if (adminEmailsSetting) setEmails(adminEmailsSetting.value || '');
  }, [adminEmailsSetting]);

  const handleSave = async () => {
    try {
      await update.mutateAsync({ key: 'admin_allowed_emails', value: emails });
      toast.success('Security settings saved');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Admin Emails</label>
        <p className="text-xs text-gray-400 mb-2">These emails can access the admin dashboard (one per line or comma-separated). Note: role must also be set to 'admin' in the users table.</p>
        <textarea
          value={emails}
          onChange={e => setEmails(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="admin@example.com&#10;another@example.com"
        />
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
        <strong>Session Security:</strong> Sessions are managed by Supabase Auth with secure httpOnly cookies. Sessions expire after the Supabase project's configured timeout.
      </div>
      <button onClick={handleSave} disabled={update.isPending} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
        {update.isPending ? 'Saving…' : 'Save Security Settings'}
      </button>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('branding');
  const { data: settings = [], isLoading } = useSiteSettings();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure site branding, integrations, and security" />
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[['branding', 'Branding'], ['integrations', 'Integrations'], ['security', 'Security']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'branding' && <BrandingTab settings={settings} />}
      {tab === 'integrations' && <IntegrationsTab />}
      {tab === 'security' && <SecurityTab />}
    </div>
  );
}
