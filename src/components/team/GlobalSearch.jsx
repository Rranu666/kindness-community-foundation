import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X, MessageSquare, CheckSquare2, FileText } from 'lucide-react';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ messages: [], tasks: [], documents: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ messages: [], tasks: [], documents: [] });
      return;
    }

    const searchAsync = async () => {
      setIsSearching(true);
      try {
        const [messages, tasks, documents] = await Promise.all([
          base44.entities.TeamMessage.filter({ message: { $regex: query, $options: 'i' } }).catch(() => []),
          base44.entities.TeamTask.filter({ title: { $regex: query, $options: 'i' } } || { description: { $regex: query, $options: 'i' } }).catch(() => []),
          base44.entities.TeamDocument.filter({ title: { $regex: query, $options: 'i' } } || { description: { $regex: query, $options: 'i' } }).catch(() => []),
        ]);
        setResults({
          messages: messages.slice(0, 3),
          tasks: tasks.slice(0, 3),
          documents: documents.slice(0, 3),
        });
      } catch (error) {
        // silently ignore search error
      }
      setIsSearching(false);
    };

    const timer = setTimeout(searchAsync, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 text-xs sm:text-sm transition-all duration-200 flex-1 sm:flex-none"
      >
        <Search size={16} className="flex-shrink-0" />
        <span className="hidden sm:inline truncate">Search...</span>
        <span className="text-xs text-slate-500 ml-auto hidden sm:inline flex-shrink-0">⌘K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-4 sm:pt-20 p-4 sm:p-0">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] flex flex-col">
            {/* Search Input */}
             <div className="border-b border-slate-700 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
               <input
                 autoFocus
                 type="text"
                 placeholder="Search..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="flex-1 min-w-0 bg-transparent text-white outline-none placeholder-slate-500 text-sm"
               />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-4">
              {isSearching ? (
                <div className="text-center py-8 text-slate-400">Searching...</div>
              ) : query && Object.values(results).every(r => r.length === 0) ? (
                <div className="text-center py-8 text-slate-400">No results found</div>
              ) : (
                <>
                  {results.messages.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Messages</h3>
                      <div className="space-y-2">
                        {results.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <MessageSquare size={16} className="text-blue-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{msg.message}</p>
                                <p className="text-slate-400 text-xs mt-1">{msg.sender_name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.tasks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Tasks</h3>
                      <div className="space-y-2">
                        {results.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <CheckSquare2 size={16} className="text-green-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{task.title}</p>
                                <p className="text-slate-400 text-xs mt-1">Priority: {task.priority}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.documents.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Documents</h3>
                      <div className="space-y-2">
                        {results.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <FileText size={16} className="text-purple-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{doc.title}</p>
                                <p className="text-slate-400 text-xs mt-1">{doc.uploaded_by_name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}