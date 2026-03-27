import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useLanguages, useCreateLanguage, useUpdateLanguage, useTranslations, useUpsertTranslation } from '@/hooks/useTranslations';
import { toast } from 'sonner';

function TranslationGrid({ langCode }) {
  const { data: translations = [], isLoading } = useTranslations(langCode);
  const upsert = useUpsertTranslation();
  const [newKey, setNewKey] = useState('');
  const [newNs, setNewNs] = useState('common');
  const [newVal, setNewVal] = useState('');
  const [saving, setSaving] = useState({});

  const handleBlur = async (t, val) => {
    if (val === t.value) return;
    setSaving(s => ({ ...s, [t.id]: true }));
    try {
      await upsert.mutateAsync({ language_code: t.language_code, key: t.key, value: val, namespace: t.namespace });
    } catch (err) { toast.error(err.message); }
    finally { setSaving(s => ({ ...s, [t.id]: false })); }
  };

  const handleAddKey = async () => {
    if (!newKey.trim()) return;
    try {
      await upsert.mutateAsync({ language_code: langCode, key: newKey.trim(), value: newVal.trim(), namespace: newNs });
      toast.success('Translation key added');
      setNewKey(''); setNewVal(''); setNewNs('common');
    } catch (err) { toast.error(err.message); }
  };

  if (isLoading) return <LoadingSpinner />;

  const byNs = translations.reduce((acc, t) => { (acc[t.namespace] = acc[t.namespace] || []).push(t); return acc; }, {});

  return (
    <div className="space-y-5">
      {/* Add new key */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800 mb-3">Add Translation Key</p>
        <div className="grid grid-cols-12 gap-2">
          <select value={newNs} onChange={e => setNewNs(e.target.value)} className="col-span-2 border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
            {['common', 'nav', 'home', 'about', 'footer'].map(ns => <option key={ns}>{ns}</option>)}
          </select>
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="translation.key" className="col-span-4 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-mono" />
          <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Translation value" className="col-span-4 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={handleAddKey} className="col-span-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
        </div>
      </div>

      {Object.keys(byNs).length === 0 ? (
        <EmptyState icon="🌐" title="No translations yet" message="Add your first translation key above." />
      ) : (
        Object.entries(byNs).map(([ns, items]) => (
          <div key={ns} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">{ns}</div>
            <table className="w-full text-sm">
              <tbody>
                {items.map(t => {
                  let inputVal = t.value || '';
                  return (
                    <tr key={t.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 w-64 font-mono text-xs text-gray-500">{t.key}</td>
                      <td className="px-4 py-2.5">
                        <input
                          defaultValue={t.value || ''}
                          onBlur={e => handleBlur(t, e.target.value)}
                          className="w-full border border-transparent hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-sm focus:outline-none"
                          placeholder="Enter translation…"
                        />
                      </td>
                      <td className="px-3 py-2.5 w-8 text-gray-300 text-xs">{saving[t.id] ? '…' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default function Languages() {
  const { data: languages = [], isLoading } = useLanguages();
  const createLang = useCreateLanguage();
  const updateLang = useUpdateLanguage();
  const [selectedLang, setSelectedLang] = useState(null);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddLang = async () => {
    if (!newCode || !newName) return;
    try {
      await createLang.mutateAsync({ code: newCode.toLowerCase(), name: newName, is_active: true });
      toast.success(`Language "${newName}" added`);
      setNewCode(''); setNewName(''); setAdding(false);
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (lang) => {
    if (lang.is_default) { toast.error("Can't deactivate default language"); return; }
    await updateLang.mutateAsync({ id: lang.id, updates: { is_active: !lang.is_active } });
    toast.success(`Language ${lang.is_active ? 'deactivated' : 'activated'}`);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Language Management" subtitle="Manage languages and translations" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Languages list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Languages</p>
              <button onClick={() => setAdding(a => !a)} className="text-blue-600 hover:text-blue-700"><Plus size={16} /></button>
            </div>
            {adding && (
              <div className="p-3 border-b bg-blue-50 space-y-2">
                <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Code (e.g. es)" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (e.g. Spanish)" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                <button onClick={handleAddLang} disabled={createLang.isPending} className="w-full bg-blue-600 text-white rounded py-1.5 text-sm hover:bg-blue-700">Add Language</button>
              </div>
            )}
            <ul className="divide-y divide-gray-100">
              {languages.map(lang => (
                <li key={lang.id}>
                  <button
                    onClick={() => setSelectedLang(lang)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${selectedLang?.id === lang.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{lang.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{lang.code}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(lang); }}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${lang.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {lang.is_active ? 'On' : 'Off'}
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Translations */}
        <div className="lg:col-span-3">
          {!selectedLang ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-sm">Select a language to manage translations</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Translations — {selectedLang.name} ({selectedLang.code})</p>
              <TranslationGrid langCode={selectedLang.code} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
