import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Sparkles, Send, RotateCcw, Mic, Clock, FileText } from 'lucide-react';

export default function AIMessageAssistant({ action = 'draft', targetPerson, incomingMessage, teamMembers, onSuggest }) {
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('compose'); // compose, reminders, notes
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [newNote, setNewNote] = useState('');
  const [dictating, setDictating] = useState(false);
  const recognitionRef = useRef(null);

  const handleGetSuggestion = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    setSuggestion('');

    try {
      const response = await base44.functions.invoke('aiMessageAssistant', {
        action,
        messageContent: action !== 'suggest_reply' ? input : undefined,
        targetPerson: action === 'draft' ? targetPerson : undefined,
        incomingMessage: action === 'suggest_reply' ? incomingMessage : undefined,
        teamMembers: action === 'route' ? teamMembers : undefined
      });

      if (response.data.success) {
        setSuggestion(response.data.data);
      }
    } catch (err) {
      setError('Failed to get suggestion. Please try again.');
      // silently ignore AI error
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    if (suggestion) {
      onSuggest(suggestion);
      setInput('');
      setSuggestion('');
    }
  };

  const startDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => setDictating(true);
    recognitionRef.current.onend = () => setDictating(false);
    recognitionRef.current.onerror = () => {
      setError('Dictation error. Please try again.');
      setDictating(false);
    };
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognitionRef.current.start();
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setDictating(false);
    }
  };

  const addReminder = () => {
    if (newReminder.trim()) {
      setReminders([...reminders, { id: Date.now(), text: newReminder, timestamp: new Date() }]);
      setNewReminder('');
    }
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote, timestamp: new Date() }]);
      setNewNote('');
    }
  };

  const removeNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const getPlaceholder = () => {
    if (action === 'draft') return `Describe what you want to tell ${targetPerson || 'this person'}...`;
    if (action === 'route') return 'Describe the message content to route...';
    return 'Or let AI help you compose a reply...';
  };

  const getTitle = () => {
    if (action === 'draft') return 'Draft with AI';
    if (action === 'suggest_reply') return 'Reply Suggestion';
    if (action === 'route') return 'Smart Routing';
    return 'AI Assistant';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">{getTitle()}</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            activeTab === 'compose'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-blue-900/20 text-blue-300/70 hover:bg-blue-900/30'
          }`}
        >
          ✨ Compose
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            activeTab === 'reminders'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-blue-900/20 text-blue-300/70 hover:bg-blue-900/30'
          }`}
        >
          <Clock size={14} className="inline mr-1" /> Reminders
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
              : 'bg-blue-900/20 text-blue-300/70 hover:bg-blue-900/30'
          }`}
        >
          <FileText size={14} className="inline mr-1" /> Notes
        </button>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="space-y-3">
          <Textarea
            placeholder={getPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-24 bg-blue-900/20 border border-blue-800/30 text-white placeholder-blue-400/40 focus:border-pink-500 transition-all"
            disabled={loading || dictating}
          />

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          {suggestion && (
            <div className="bg-blue-900/20 border border-indigo-500/50 rounded p-3 space-y-2">
              <p className="text-blue-200/80 text-sm">
                {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion, null, 2)}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUseSuggestion}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/20"
                >
                  <Send size={14} className="mr-1" /> Use This
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSuggestion('')}
                  className="text-blue-300/70 border-blue-800/30 hover:bg-blue-900/20"
                >
                  Discard
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGetSuggestion}
              disabled={loading || !input.trim()}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <Loader size={14} className="mr-2 animate-spin" /> Getting suggestion...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="mr-2" /> Get Suggestion
                </>
              )}
            </Button>
            <Button
              onClick={dictating ? stopDictation : startDictation}
              className={`${
                dictating
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-600/20'
              } text-white`}
              title={dictating ? 'Stop dictating' : 'Start voice dictation'}
            >
              <Mic size={14} />
            </Button>
            {input && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setInput('');
                  setSuggestion('');
                }}
                className="text-blue-300/70 border-blue-800/30 hover:bg-blue-900/20"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>
          {dictating && <p className="text-sm text-blue-300/60">🎤 Listening...</p>}
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Add a reminder..."
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addReminder()}
              className="w-full bg-blue-900/20 border border-blue-800/30 rounded px-3 py-2 text-white placeholder-blue-400/40 focus:outline-none focus:border-pink-500"
            />
            <Button
              onClick={addReminder}
              disabled={!newReminder.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/20"
            >
              <Clock size={14} className="mr-2" /> Add Reminder
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reminders.length === 0 ? (
              <p className="text-blue-300/50 text-sm text-center py-4">No reminders yet</p>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="bg-blue-900/20 border border-blue-800/20 rounded p-2 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-blue-100 text-sm">{reminder.text}</p>
                    <p className="text-blue-300/40 text-xs mt-1">
                      {reminder.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="text-blue-400/60 hover:text-rose-400 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <textarea
              placeholder="Take a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full bg-blue-900/20 border border-blue-800/30 rounded px-3 py-2 text-white placeholder-blue-400/40 focus:outline-none focus:border-pink-500 h-20 resize-none"
            />
            <Button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/20"
            >
              <FileText size={14} className="mr-2" /> Save Note
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-blue-300/50 text-sm text-center py-4">No notes yet</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-blue-900/20 border border-blue-800/20 rounded p-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-blue-300/40 text-xs">
                      {note.timestamp.toLocaleString([], { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <button
                      onClick={() => removeNote(note.id)}
                      className="text-blue-400/60 hover:text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-blue-100 text-sm">{note.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}