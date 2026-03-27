import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useSeoSettings, useUpsertSeo } from '@/hooks/useSeoSettings';
import { toast } from 'sonner';

const DEFAULT_PAGES = ['home', 'about', 'volunteer', 'servekindness', 'kindwave', 'blog', 'contact', 'analytics'];

function SeoEditModal({ row, onClose }) {
  const upsert = useUpsertSeo();
  const [form, setForm] = useState({
    page_slug: row?.page_slug || '',
    meta_title: row?.meta_title || '',
    meta_description: row?.meta_description || '',
    keywords: row?.keywords || '',
    og_title: row?.og_title || '',
    og_description: row?.og_description || '',
    og_image_url: row?.og_image_url || '',
    canonical_url: row?.canonical_url || '',
    no_index: row?.no_index || false,
  });
  const isNew = !row?.id;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await upsert.mutateAsync(form);
      toast.success('SEO settings saved');
      onClose();
    } catch (err) { toast.error(err.message); }
  };

  const titleLen = form.meta_title.length;
  const descLen = form.meta_description.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-semibold text-gray-900">{isNew ? 'Add SEO Settings' : `Edit SEO: /${form.page_slug}`}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isNew && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Slug</label>
              <select value={form.page_slug} onChange={e => set('page_slug', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choose page…</option>
                {DEFAULT_PAGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title <span className={titleLen > 60 ? 'text-red-500' : 'text-gray-400'}>{titleLen}/60</span></label>
            <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} maxLength={80} className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${titleLen > 60 ? 'border-red-300' : 'border-gray-300'}`} placeholder="Page title for search results" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description <span className={descLen > 160 ? 'text-red-500' : 'text-gray-400'}>{descLen}/160</span></label>
            <textarea value={form.meta_description} onChange={e => set('meta_description', e.target.value)} rows={3} className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${descLen > 160 ? 'border-red-300' : 'border-gray-300'}`} placeholder="Brief description for search results" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input value={form.keywords} onChange={e => set('keywords', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="keyword1, keyword2, keyword3" />
          </div>
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Open Graph (Social Sharing)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                <input value={form.og_title} onChange={e => set('og_title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Title for social sharing (defaults to meta title)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                <textarea value={form.og_description} onChange={e => set('og_description', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                <input value={form.og_image_url} onChange={e => set('og_image_url', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
            <input value={form.canonical_url} onChange={e => set('canonical_url', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://kindnesscommunityfoundation.com/page" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.no_index} onChange={e => set('no_index', e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">No Index (hide from search engines)</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={upsert.isPending} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {upsert.isPending ? 'Saving…' : 'Save SEO'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Seo() {
  const { data: rows = [], isLoading } = useSeoSettings();
  const [editRow, setEditRow] = useState(null);
  const [adding, setAdding] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="SEO Management"
        subtitle="Manage meta tags, keywords, and social sharing settings per page"
        action={<button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"><Plus size={14} />Add Page SEO</button>}
      />

      {rows.length === 0 ? (
        <EmptyState icon="🔍" title="No SEO settings yet" message="Add SEO settings for your pages." action={<button onClick={() => setAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add First Page</button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Page</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Meta Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Meta Desc</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No Index</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Edit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">/{r.page_slug}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{r.meta_title || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate text-xs">{r.meta_description || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">{r.no_index ? <span className="text-red-500 text-xs">Yes</span> : <span className="text-gray-300 text-xs">No</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditRow(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600"><Edit2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(adding || editRow) && <SeoEditModal row={editRow} onClose={() => { setAdding(false); setEditRow(null); }} />}
    </div>
  );
}
