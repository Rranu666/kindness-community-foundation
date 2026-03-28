import { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Tag } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import {
  useKindWaveCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useKindWaveRequests, useCreateRequest, useUpdateRequest, useDeleteRequest,
} from '@/hooks/useKindWave';

const URGENCY_OPTIONS = ['Urgent', 'Standard', 'Flexible'];
const COLORS = ['#ff3d5a','#ff7b3a','#8580ff','#1de99b','#ff5e9e','#00e8b4','#ffc43d','#3b82f6'];

// ── Category Modal ─────────────────────────────────────
function CategoryModal({ cat, onClose }) {
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isNew = !cat?.id;
  const [form, setForm] = useState({
    label: cat?.label || '',
    emoji: cat?.emoji || '✅',
    color: cat?.color || '#1de99b',
    description: cat?.description || '',
    is_active: cat?.is_active ?? true,
    sort_order: cat?.sort_order ?? 0,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.label.trim()) { toast.error('Label is required'); return; }
    try {
      if (isNew) {
        await create.mutateAsync(form);
        toast.success('Category created');
      } else {
        await update.mutateAsync({ id: cat.id, updates: form });
        toast.success('Category updated');
      }
      onClose();
    } catch (err) { toast.error(err.message); }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{isNew ? 'New Help Category' : 'Edit Category'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
              <input value={form.label} onChange={e => set('label', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Urgent Help" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="🚨" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer" title="Custom color" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Request Modal ──────────────────────────────────────
function RequestModal({ req, categories, onClose }) {
  const create = useCreateRequest();
  const update = useUpdateRequest();
  const isNew = !req?.id;
  const [form, setForm] = useState({
    title: req?.title || '',
    category: req?.category || (categories[0]?.label?.toLowerCase().replace(/\s+/g,'-') || 'general'),
    urgency: req?.urgency || 'Standard',
    x_pos: req?.x_pos ?? 50,
    y_pos: req?.y_pos ?? 50,
    user_name: req?.user_name || 'Anonymous',
    description: req?.description || '',
    verified: req?.verified ?? false,
    is_active: req?.is_active ?? true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      if (isNew) {
        await create.mutateAsync(form);
        toast.success('Help request created');
      } else {
        await update.mutateAsync({ id: req.id, updates: form });
        toast.success('Help request updated');
      }
      onClose();
    } catch (err) { toast.error(err.message); }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-gray-900">{isNew ? 'New Help Request' : 'Edit Request'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Need a ride to hospital" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {categories.map(c => <option key={c.id} value={c.id_key || c.label.toLowerCase().replace(/\s+/g,'-')}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => set('urgency', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {URGENCY_OPTIONS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe the help needed..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posted By</label>
              <input value={form.user_name} onChange={e => set('user_name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Map Position (X, Y %)</label>
              <div className="flex gap-2">
                <input type="number" min={0} max={100} value={form.x_pos} onChange={e => set('x_pos', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="X%" />
                <input type="number" min={0} max={100} value={form.y_pos} onChange={e => set('y_pos', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Y%" />
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.verified} onChange={e => set('verified', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700">Active (show on map)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 justify-end p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Categories Tab ─────────────────────────────────────
function CategoriesTab() {
  const { data: cats = [], isLoading } = useKindWaveCategories();
  const del = useDeleteCategory();
  const upd = useUpdateCategory();
  const [editCat, setEditCat] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={14} /> Add Category
        </button>
      </div>
      {cats.length === 0 ? (
        <EmptyState icon="🏷️" title="No categories yet" message="Add help categories for the KindWave map." action={<button onClick={() => setCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Category</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditCat(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-mono text-gray-500">{c.color}</span>
                </div>
                <button
                  onClick={() => upd.mutateAsync({ id: c.id, updates: { is_active: !c.is_active } })}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {c.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(creating || editCat) && <CategoryModal cat={editCat} onClose={() => { setCreating(false); setEditCat(null); }} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.label}"? This may affect existing requests using this category.`}
        onConfirm={async () => { await del.mutateAsync(deleteTarget.id); toast.success('Category deleted'); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        loading={del.isPending}
      />
    </div>
  );
}

// ── Requests Tab ───────────────────────────────────────
function RequestsTab() {
  const { data: reqs = [], isLoading } = useKindWaveRequests();
  const { data: cats = [] } = useKindWaveCategories();
  const del = useDeleteRequest();
  const upd = useUpdateRequest();
  const [editReq, setEditReq] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? reqs : reqs.filter(r => filter === 'active' ? r.is_active : !r.is_active);

  const urgencyColor = (u) => u === 'Urgent' ? 'bg-red-100 text-red-700' : u === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
          ))}
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={14} /> Add Request
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="📍" title="No help requests" message="Add help requests that appear on the KindWave map." action={<button onClick={() => setCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Request</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Posted By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{r.title}</div>
                    {r.description && <div className="text-xs text-gray-400 truncate max-w-xs">{r.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{r.category}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyColor(r.urgency)}`}>{r.urgency}</span></td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      {r.user_name}
                      {r.verified && <span title="Verified" className="text-green-500 text-xs">✓</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => upd.mutateAsync({ id: r.id, updates: { is_active: !r.is_active } })} className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditReq(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(creating || editReq) && <RequestModal req={editReq} categories={cats} onClose={() => { setCreating(false); setEditReq(null); }} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Help Request"
        message={`Delete "${deleteTarget?.title}"?`}
        onConfirm={async () => { await del.mutateAsync(deleteTarget.id); toast.success('Request deleted'); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
        loading={del.isPending}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function KindWaveAdmin() {
  const [tab, setTab] = useState('requests');

  return (
    <div>
      <PageHeader
        title="KindWave Management"
        subtitle="Manage help categories and active help requests shown on the KindWave map"
      />
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[['requests', <><MapPin size={13} className="inline mr-1" />Help Requests</>], ['categories', <><Tag size={13} className="inline mr-1" />Categories</>]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'requests' ? <RequestsTab /> : <CategoriesTab />}
    </div>
  );
}
