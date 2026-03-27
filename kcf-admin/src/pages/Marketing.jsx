import { useState } from 'react';
import { Plus, Edit2, Trash2, Send } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useEmailCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/useEmailCampaigns';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/useBanners';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function CampaignModal({ campaign, onClose }) {
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const isNew = !campaign?.id;
  const [form, setForm] = useState({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    body_html: campaign?.body_html || '',
    audience: campaign?.audience || 'all',
    status: campaign?.status || 'draft',
    scheduled_at: campaign?.scheduled_at ? campaign.scheduled_at.slice(0, 16) : '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      const payload = { ...form, scheduled_at: form.scheduled_at || null };
      if (isNew) { await create.mutateAsync(payload); toast.success('Campaign created'); }
      else { await update.mutateAsync({ id: campaign.id, updates: payload }); toast.success('Campaign updated'); }
      onClose();
    } catch (err) { toast.error(err.message); }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold">{isNew ? 'New Campaign' : 'Edit Campaign'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name (Internal)</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. April Newsletter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select value={form.audience} onChange={e => set('audience', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="all">All Users</option>
                <option value="members">Members</option>
                <option value="volunteers">Volunteers</option>
                <option value="donors">Donors</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Subject line" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date & Time</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
            <ReactQuill value={form.body_html} onChange={v => set('body_html', v)} theme="snow" />
          </div>
        </div>
        <div className="flex gap-3 justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isPending ? 'Saving…' : 'Save Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignsTab() {
  const { data: campaigns = [], isLoading } = useEmailCampaigns();
  const del = useDeleteCampaign();
  const [editC, setEditC] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />New Campaign</button>
      </div>
      {campaigns.length === 0 ? <EmptyState icon="📧" title="No campaigns" message="Create your first email campaign." /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Audience</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.subject}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{c.audience}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{c.scheduled_at ? format(new Date(c.scheduled_at), 'MMM d, h:mm a') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditC(c)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(creating || editC) && <CampaignModal campaign={editC} onClose={() => { setCreating(false); setEditC(null); }} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Campaign" message={`Delete "${deleteTarget?.name}"?`} onConfirm={async () => { await del.mutateAsync(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} loading={del.isPending} />
    </div>
  );
}

function BannerModal({ banner, onClose }) {
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const isNew = !banner?.id;
  const [form, setForm] = useState({
    title: banner?.title || '',
    message: banner?.message || '',
    type: banner?.type || 'info',
    cta_label: banner?.cta_label || '',
    cta_url: banner?.cta_url || '',
    position: banner?.position || 'top',
    is_active: banner?.is_active ?? false,
    starts_at: banner?.starts_at ? banner.starts_at.slice(0, 10) : '',
    ends_at: banner?.ends_at ? banner.ends_at.slice(0, 10) : '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      const payload = { ...form, starts_at: form.starts_at || null, ends_at: form.ends_at || null };
      if (isNew) { await create.mutateAsync(payload); toast.success('Banner created'); }
      else { await update.mutateAsync({ id: banner.id, updates: payload }); toast.success('Banner updated'); }
      onClose();
    } catch (err) { toast.error(err.message); }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold">{isNew ? 'New Banner' : 'Edit Banner'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="promo">Promo</option>
                <option value="cookie">Cookie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select value={form.position} onChange={e => set('position', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="modal">Modal</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
              <input value={form.cta_label} onChange={e => set('cta_label', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Learn More" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
              <input value={form.cta_url} onChange={e => set('cta_url', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => set('is_active', !form.is_active)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Active (show on site)</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isPending ? 'Saving…' : 'Save Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BannersTab() {
  const { data: banners = [], isLoading } = useBanners();
  const del = useDeleteBanner();
  const update = useUpdateBanner();
  const [editB, setEditB] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />New Banner</button>
      </div>
      {banners.length === 0 ? <EmptyState icon="📢" title="No banners" message="Create site-wide banners and popups." /> : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 ${b.is_active ? 'border-green-200' : 'border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-gray-900">{b.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${b.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : b.type === 'promo' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{b.type}</span>
                  <span className="text-xs text-gray-400 capitalize">{b.position}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{b.message}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={async () => { await update.mutateAsync({ id: b.id, updates: { is_active: !b.is_active } }); toast.success(b.is_active ? 'Banner deactivated' : 'Banner activated'); }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${b.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {b.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => setEditB(b)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit2 size={13} /></button>
                <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editB) && <BannerModal banner={editB} onClose={() => { setCreating(false); setEditB(null); }} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Banner" message={`Delete "${deleteTarget?.title}"?`} onConfirm={async () => { await del.mutateAsync(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} loading={del.isPending} />
    </div>
  );
}

export default function Marketing() {
  const [tab, setTab] = useState('campaigns');
  return (
    <div>
      <PageHeader title="Marketing Tools" subtitle="Manage email campaigns, banners, and promotions" />
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[['campaigns', 'Email Campaigns'], ['banners', 'Banners & Popups']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'campaigns' ? <CampaignsTab /> : <BannersTab />}
    </div>
  );
}
