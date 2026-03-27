import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useSitePages, useCreatePage, useUpdatePage, useDeletePage } from '@/hooks/useSitePages';
import { useCommunityStories, useUpdateStory } from '@/hooks/useCommunityStories';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function PageEditor({ page, onClose }) {
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [body, setBody] = useState(page?.body || '');
  const [status, setStatus] = useState(page?.status || 'draft');
  const create = useCreatePage();
  const update = useUpdatePage();
  const isNew = !page?.id;

  const handleSave = async () => {
    try {
      if (isNew) {
        await create.mutateAsync({ title, slug, body, status });
        toast.success('Page created');
      } else {
        await update.mutateAsync({ id: page.id, updates: { title, slug, body, status } });
        toast.success('Page saved');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const autoSlug = (val) => {
    setTitle(val);
    if (isNew) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold text-gray-900">{isNew ? 'New Page' : 'Edit Page'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={title} onChange={e => autoSlug(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Page title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="page-slug" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-40">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <ReactQuill value={body} onChange={setBody} theme="snow" />
          </div>
        </div>
        <div className="flex gap-3 justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {isPending ? 'Saving…' : 'Save Page'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PagesTab() {
  const { data: pages = [], isLoading } = useSitePages();
  const deletePage = useDeletePage();
  const [editPage, setEditPage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={14} /> New Page
        </button>
      </div>
      {pages.length === 0 ? (
        <EmptyState icon="📄" title="No pages yet" message="Create your first page to get started." action={<button onClick={() => setCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create Page</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">/{p.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{p.updated_at ? format(new Date(p.updated_at), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditPage(p)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(creating || editPage) && <PageEditor page={editPage} onClose={() => { setCreating(false); setEditPage(null); }} />}
      <ConfirmDialog open={!!deleteTarget} title="Delete Page" message={`Delete "${deleteTarget?.title}"?`} onConfirm={async () => { await deletePage.mutateAsync(deleteTarget.id); toast.success('Page deleted'); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} loading={deletePage.isPending} />
    </div>
  );
}

function StoriesTab() {
  const { data: stories = [], isLoading } = useCommunityStories();
  const update = useUpdateStory();
  const [filter, setFilter] = useState('pending');

  const filtered = filter === 'all' ? stories : stories.filter(s => s.status === filter);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f} {f === 'pending' && stories.filter(s => s.status === 'pending').length > 0 && <span className="ml-1 bg-white/30 px-1 rounded text-xs">{stories.filter(s => s.status === 'pending').length}</span>}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState icon="📚" title="No stories" /> : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{s.title || 'Untitled'}</h4>
                    <StatusBadge status={s.status} />
                    {s.pillar && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.pillar}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{s.author_name || s.author_email || 'Unknown author'}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{s.story}</p>
                </div>
                {s.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={async () => { await update.mutateAsync({ id: s.id, updates: { status: 'approved' } }); toast.success('Approved'); }} className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-medium"><Check size={13} />Approve</button>
                    <button onClick={async () => { await update.mutateAsync({ id: s.id, updates: { status: 'rejected' } }); toast.success('Rejected'); }} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium"><X size={13} />Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Content() {
  const [tab, setTab] = useState('pages');

  return (
    <div>
      <PageHeader title="Content Management" subtitle="Manage pages and community stories" />
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[['pages', 'Pages'], ['stories', 'Stories']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'pages' ? <PagesTab /> : <StoriesTab />}
    </div>
  );
}
