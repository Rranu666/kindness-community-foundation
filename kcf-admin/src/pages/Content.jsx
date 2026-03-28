import { useState } from 'react';
import { Eye, EyeOff, Globe, Plus, Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { usePageVisibility, useUpdatePageVisibility } from '@/hooks/usePageVisibility';
import { useContentBlocks, useUpsertContentBlock, useAddContentBlock, useDeleteContentBlock } from '@/hooks/useContentBlocks';
import { useCommunityStories, useUpdateStory } from '@/hooks/useCommunityStories';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── Toggle Switch ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? 'bg-green-500' : 'bg-gray-300'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SITE_ORIGIN = 'https://kindnesscommununityfoundation.com';
const SLUG_TO_PATH = {
  home: '/',
  kindwave: '/kindwave',
  servekindness: '/servekindness',
  blog: '/blog',
  contact: '/contact',
  volunteer: '/volunteer',
  jointeam: '/jointeam',
  synergyhub: '/synergyhub',
  mygiving: '/mygiving',
};
function pageUrl(slug) {
  const path = SLUG_TO_PATH[slug] ?? `/${slug}`;
  return `${SITE_ORIGIN}${path}`;
}

// ─── Tab 1: Page Visibility ──────────────────────────────────────────────────
function PagesVisibilityTab() {
  const { data: pages = [], isLoading } = usePageVisibility();
  const update = useUpdatePageVisibility();

  const handleToggle = async (page, newVal) => {
    try {
      await update.mutateAsync({ page_slug: page.page_slug, updates: { is_visible: newVal } });
      toast.success(`"${page.page_name}" is now ${newVal ? 'visible' : 'hidden'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (pages.length === 0) {
    return (
      <EmptyState
        icon="🌐"
        title="No pages configured"
        message="Add rows to the page_visibility table in Supabase to manage nav visibility."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Page</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug / URL</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nav Label</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Visible in Nav</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.page_slug} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-900">{page.page_name || page.page_slug}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <a
                  href={pageUrl(page.page_slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-xs group"
                >
                  {SLUG_TO_PATH[page.page_slug] ?? `/${page.page_slug}`}
                  <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </td>
              <td className="px-4 py-3 text-gray-500">{page.nav_label || '—'}</td>
              <td className="px-4 py-3">
                {page.is_visible ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    <Eye size={11} /> Visible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                    <EyeOff size={11} /> Hidden
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <Toggle
                  checked={!!page.is_visible}
                  onChange={(val) => handleToggle(page, val)}
                  disabled={update.isPending}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Add Block Form ───────────────────────────────────────────────────────────
function AddBlockForm({ pageSlug, onClose }) {
  const [label, setLabel] = useState('');
  const [blockKey, setBlockKey] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('text');
  const add = useAddContentBlock();

  const autoKey = (val) => {
    setLabel(val);
    setBlockKey(val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''));
  };

  const handleAdd = async () => {
    if (!blockKey.trim()) { toast.error('Block key is required'); return; }
    try {
      await add.mutateAsync({
        page_slug: pageSlug,
        block_key: blockKey.trim(),
        label: label.trim(),
        content: content.trim(),
        content_type: contentType,
        updated_at: new Date().toISOString(),
      });
      toast.success('Block added');
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 space-y-3">
      <h4 className="font-semibold text-blue-900 text-sm">Add Text Block</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
          <input
            value={label}
            onChange={(e) => autoKey(e.target.value)}
            placeholder="Hero Heading"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Block Key</label>
          <input
            value={blockKey}
            onChange={(e) => setBlockKey(e.target.value)}
            placeholder="hero_heading"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Enter the text content…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Content Type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-32"
        >
          <option value="text">text</option>
          <option value="html">html</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
        <button onClick={handleAdd} disabled={add.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1">
          <Plus size={13} /> Add Block
        </button>
      </div>
    </div>
  );
}

// ─── Editable Cell ────────────────────────────────────────────────────────────
function EditableContent({ block, pageSlug }) {
  const [value, setValue] = useState(block.content || '');
  const [saved, setSaved] = useState(false);
  const upsert = useUpsertContentBlock();

  const handleBlur = async () => {
    if (value === (block.content || '')) return;
    try {
      await upsert.mutateAsync({
        page_slug: pageSlug,
        block_key: block.block_key,
        content: value,
        label: block.label,
        content_type: block.content_type || 'text',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y bg-gray-50 focus:bg-white transition-colors"
      />
      {saved && (
        <span className="absolute top-1 right-1 flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
          <Check size={10} /> Saved
        </span>
      )}
    </div>
  );
}

// ─── Tab 2: Text Editor ───────────────────────────────────────────────────────
function TextEditorTab() {
  const { data: pages = [], isLoading: pagesLoading } = usePageVisibility();
  const [selectedSlug, setSelectedSlug] = useState('');
  const { data: blocks = [], isLoading: blocksLoading } = useContentBlocks(selectedSlug);
  const deleteBlock = useDeleteContentBlock();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div>
      {/* Page selector */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700 shrink-0">Select page:</label>
        <select
          value={selectedSlug}
          onChange={(e) => { setSelectedSlug(e.target.value); setShowAddForm(false); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          disabled={pagesLoading}
        >
          <option value="">— choose a page —</option>
          {pages.map((p) => (
            <option key={p.page_slug} value={p.page_slug}>
              {p.page_name || p.page_slug} ({p.page_slug})
            </option>
          ))}
        </select>
      </div>

      {!selectedSlug && (
        <EmptyState icon="✏️" title="No page selected" message="Choose a page from the dropdown above to manage its text blocks." />
      )}

      {selectedSlug && blocksLoading && <LoadingSpinner />}

      {selectedSlug && !blocksLoading && (
        <>
          {blocks.length === 0 && !showAddForm ? (
            <EmptyState
              icon="📝"
              title="No text blocks yet"
              message="Add your first text block for this page."
              action={
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  <Plus size={14} /> Add Text Block
                </button>
              }
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">{blocks.length} block{blocks.length !== 1 ? 's' : ''} for <span className="font-mono text-gray-700">{selectedSlug}</span></p>
                {!showAddForm && (
                  <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                    <Plus size={13} /> Add Text Block
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">Label</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">Block Key</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Content</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase w-16">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map((block) => (
                      <tr key={block.id} className="border-b border-gray-100 last:border-0 align-top">
                        <td className="px-4 py-3 text-gray-700 font-medium">{block.label || <span className="text-gray-400 italic">—</span>}</td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{block.block_key}</code>
                        </td>
                        <td className="px-4 py-3 min-w-[200px]">
                          <EditableContent block={block} pageSlug={selectedSlug} />
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{block.content_type || 'text'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleteTarget(block)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {showAddForm && (
            <AddBlockForm pageSlug={selectedSlug} onClose={() => setShowAddForm(false)} />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Block"
        message={`Delete block "${deleteTarget?.block_key}"? This cannot be undone.`}
        onConfirm={async () => {
          try {
            await deleteBlock.mutateAsync({ id: deleteTarget.id, page_slug: selectedSlug });
            toast.success('Block deleted');
          } catch (err) {
            toast.error(err.message);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteBlock.isPending}
      />
    </div>
  );
}

// ─── Tab 3: Stories (verbatim from original) ──────────────────────────────────
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

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Content() {
  const [tab, setTab] = useState('visibility');

  return (
    <div>
      <PageHeader title="Content Management" subtitle="Manage page visibility, text content, and community stories" />
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          ['visibility', 'Page Visibility'],
          ['editor', 'Text Editor'],
          ['stories', 'Stories'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'visibility' && <PagesVisibilityTab />}
      {tab === 'editor' && <TextEditorTab />}
      {tab === 'stories' && <StoriesTab />}
    </div>
  );
}
