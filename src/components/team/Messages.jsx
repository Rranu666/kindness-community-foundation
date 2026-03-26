import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Plus, Paperclip, X, Loader } from 'lucide-react';
import VoiceDictation from './VoiceDictation';
import AIMessageAssistant from './AIMessageAssistant';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedType, setSelectedType] = useState('direct');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showVoiceDictation, setShowVoiceDictation] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list(),
    initialData: [],
  });

  const { data: chatGroups = [] } = useQuery({
    queryKey: ['chatGroups'],
    queryFn: () => base44.entities.ChatGroup.list(),
    initialData: [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: () => {
      if (!selectedConversation) return [];
      if (selectedConversation.type === 'direct') {
        return base44.entities.TeamMessage.filter({
          message_type: 'direct',
          sender_email: user?.email,
          receiver_email: selectedConversation.id,
        }, '-created_date', 50);
      } else {
        return base44.entities.TeamMessage.filter({
          message_type: 'group',
          group_id: selectedConversation.id,
        }, '-created_date', 50);
      }
    },
    enabled: !!selectedConversation && !!user,
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return base44.entities.TeamMessage.create({
        sender_email: user.email,
        sender_name: user.full_name,
        message: messageData.message,
        message_type: messageData.type,
        receiver_email: messageData.type === 'direct' ? messageData.receiver : null,
        group_id: messageData.type === 'group' ? messageData.group : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    if (selectedType === 'direct' && selectedRecipient) {
      sendMessageMutation.mutate({
        message: messageText,
        type: 'direct',
        receiver: selectedRecipient,
      });
    } else if (selectedType === 'group' && selectedGroup) {
      sendMessageMutation.mutate({
        message: messageText,
        type: 'group',
        group: selectedGroup,
      });
    }
  };

  const handleStartChat = (recipientEmail, type) => {
    setSelectedConversation({ id: recipientEmail, type });
    setShowNewChat(false);
    setSelectedType('direct');
  };

  const handleStartGroupChat = (groupId) => {
    setSelectedConversation({ id: groupId, type: 'group' });
    setShowNewChat(false);
    setSelectedType('group');
  };

  const handleVoiceMessageTranscribed = (transcribedText, recipientName) => {
    setMessageText(transcribedText);
    setShowVoiceDictation(false);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    setIsUploading(true);

    for (const file of files) {
      try {
        const response = await base44.integrations.Core.UploadFile({ file });
        setAttachedFiles(prev => [...prev, {
          file_url: response.file_url,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        }]);
      } catch (error) {
        // silently ignore upload error
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAISuggestion = (suggestion) => {
    setMessageText(suggestion);
    setShowAIAssistant(false);
  };

  const getFilePreview = (file) => {
    if (file.file_type.startsWith('image/')) {
      return <img src={file.file_url} alt={file.file_name} className="max-w-xs max-h-40 rounded-lg" />;
    }
    const icons = {
      'application/pdf': '📄',
      'application/msword': '📄',
      'application/vnd.ms-excel': '📊',
      'text/plain': '📝',
    };
    const icon = Object.entries(icons).find(([type]) => file.file_type.includes(type))?.[1] || '📎';
    return (
      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm">
        {icon} {file.file_name}
      </a>
    );
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Conversations List */}
      <div className="w-80 bg-gradient-to-br from-blue-950 to-indigo-950 rounded-xl border border-blue-900/30 shadow-lg flex flex-col">
        <div className="p-6 border-b border-blue-900/30">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-2 rounded-lg transition-all duration-200 shadow-lg shadow-rose-500/20"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        {/* New Chat Panel */}
        {showNewChat && (
          <div className="p-4 border-b border-blue-900/30 space-y-3">
            <div>
              <label className="block text-xs text-blue-300/60 mb-2">Chat Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('direct')}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
                    selectedType === 'direct'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-900/30 text-blue-300/70 hover:bg-blue-900/40'
                  }`}
                >
                  Direct
                </button>
                <button
                  onClick={() => setSelectedType('group')}
                   className={`flex-1 py-2 rounded text-sm font-medium transition-all ${
                     selectedType === 'group'
                       ? 'bg-rose-600 text-white'
                       : 'bg-blue-900/30 text-blue-300/70 hover:bg-blue-900/40'
                   }`}
                >
                  Group
                </button>
              </div>
            </div>

            {selectedType === 'direct' && (
              <div>
                <label className="block text-xs text-blue-300/60 mb-2">Select Member</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teamMembers.filter((m) => m.email !== user?.email).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedRecipient(member.email);
                        handleStartChat(member.email, 'direct');
                      }}
                      className="w-full text-left px-3 py-2 bg-blue-900/20 hover:bg-blue-900/40 rounded text-sm text-blue-200/70 transition-all"
                    >
                      {member.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === 'group' && (
              <div>
                <label className="block text-xs text-blue-300/60 mb-2">Select Group</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {chatGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedGroup(group.id);
                        handleStartGroupChat(group.id);
                      }}
                      className="w-full text-left px-3 py-2 bg-blue-900/20 hover:bg-blue-900/40 rounded text-sm text-blue-200/70 transition-all"
                    >
                      {group.icon_emoji} {group.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {teamMembers.filter((m) => m.email !== user?.email).map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setSelectedRecipient(member.email);
                handleStartChat(member.email, 'direct');
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedConversation?.id === member.email
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-blue-200/70 hover:bg-blue-900/30'
              }`}
            >
              <p className="font-medium">{member.full_name}</p>
              <p className="text-xs opacity-75">Direct Message</p>
            </button>
          ))}

          {chatGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleStartGroupChat(group.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedConversation?.id === group.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-blue-200/70 hover:bg-blue-900/30'
              }`}
            >
              <p className="font-medium">{group.icon_emoji} {group.name}</p>
              <p className="text-xs opacity-75">Group Chat</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gradient-to-br from-blue-950 to-indigo-950 rounded-xl border border-blue-900/30 shadow-lg flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg space-y-2 ${
                        msg.sender_email === user?.email
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-none shadow-lg shadow-rose-500/20'
                          : 'bg-blue-900/30 text-blue-100 rounded-bl-none border border-blue-800/30'
                      }`}
                    >
                      <p className="text-xs opacity-75 mb-1">{msg.sender_name}</p>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-blue-300/50">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-blue-900/30 space-y-4">
              {showAIAssistant && (
                <AIMessageAssistant
                  action="draft"
                  targetPerson={selectedType === 'direct' ? teamMembers.find(m => m.email === selectedRecipient)?.full_name : 'team'}
                  teamMembers={teamMembers}
                  onSuggest={handleAISuggestion}
                />
              )}

              {showVoiceDictation && (
                <VoiceDictation
                  onMessageTranscribed={handleVoiceMessageTranscribed}
                  teamMembers={teamMembers}
                  user={user}
                  selectedType={selectedType}
                  selectedRecipient={selectedRecipient}
                  selectedGroup={selectedGroup}
                />
              )}

              {/* Attachments Preview */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <p className="text-xs text-blue-300/60 font-semibold">Attachments ({attachedFiles.length})</p>
                  <div className="space-y-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-blue-900/30 rounded p-2 border border-blue-800/20">
                        <div className="flex-1 text-sm text-blue-100 truncate">{file.file_name}</div>
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="text-blue-400 hover:text-rose-400 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message or use voice dictation..."
                  className="flex-1 bg-blue-900/20 border border-blue-800/30 rounded-lg px-4 py-2 text-white placeholder-blue-400/40 focus:outline-none focus:border-pink-500 transition-all"
                />

                <label className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/20">
                  {isUploading ? <Loader size={18} className="animate-spin" /> : <Paperclip size={18} />}
                  <input type="file" multiple onChange={handleFileSelect} className="hidden" disabled={isUploading} />
                </label>

                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-600/20"
                  title="AI Assistant"
                >
                  ✨
                </button>

                <button
                  onClick={() => setShowVoiceDictation(!showVoiceDictation)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-600/20"
                  title="Voice Message"
                >
                  🎤
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() && attachedFiles.length === 0}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-rose-500/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-blue-300/50">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}