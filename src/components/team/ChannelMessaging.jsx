import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, Hash, MessageCircle } from 'lucide-react';
import AIMessageAssistant from './AIMessageAssistant';
import DocumentAttachments from './DocumentAttachments';

export default function ChannelMessaging({ user }) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: chatGroups = [] } = useQuery({
    queryKey: ['chatGroups'],
    queryFn: () => base44.entities.ChatGroup.list(),
    initialData: [],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['channelMessages', selectedChannel?.id],
    queryFn: () => {
      if (!selectedChannel) return [];
      return base44.entities.TeamMessage.filter({
        message_type: 'group',
        group_id: selectedChannel.id,
      }, '-created_date', 100);
    },
    enabled: !!selectedChannel && !!user,
    initialData: [],
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChannel) return;

    const messageId = await base44.entities.TeamMessage.create({
      sender_email: user.email,
      sender_name: user.full_name,
      message: messageText,
      message_type: 'group',
      group_id: selectedChannel.id,
    });

    // Upload attachments if any
    if (attachedFiles.length > 0) {
      for (const file of attachedFiles) {
        await base44.entities.MessageAttachment.create({
          message_id: messageId.id,
          file_url: file.file_url,
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          uploaded_by_email: user.email,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['channelMessages'] });
    setMessageText('');
    setAttachedFiles([]);
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

  const MessageItem = ({ msg }) => (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
        {msg.sender_name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{msg.sender_name}</p>
        <p className="text-slate-300 mb-2">{msg.message}</p>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] bg-slate-950">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">TEAM CHAT</h2>
          <h3 className="text-white font-bold mb-3">Messages</h3>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Channels</p>
            {chatGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedChannel(group)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-all flex items-center gap-2 ${
                  selectedChannel?.id === group.id
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Hash size={16} />
                <span>{group.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button className="w-full text-left px-3 py-2 text-pink-500 hover:text-pink-400 transition-all flex items-center gap-2">
            <span className="text-lg">🌐</span> Public Website
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-900">
              <div className="flex items-center gap-3">
                <Hash size={24} className="text-slate-400" />
                <div>
                  <p className="text-slate-400 text-sm">TEAM CHAT</p>
                  <h1 className="text-2xl font-bold text-white">{selectedChannel.name}</h1>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length > 0 ? (
                messages.reverse().map((msg) => (
                  <MessageItem key={msg.id} msg={msg} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Hash size={48} className="mb-2 opacity-25" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Be the first to post in #{selectedChannel.name}</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-slate-700 bg-slate-900 space-y-4">
              {showAIAssistant && (
                <AIMessageAssistant
                  action="draft"
                  targetPerson={selectedChannel.name}
                  onSuggest={handleAISuggestion}
                />
              )}

              <DocumentAttachments
                attachments={attachedFiles}
                onAddAttachment={handleFileSelect}
                onRemoveAttachment={removeAttachment}
                isLoading={isUploading}
              />

              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Write a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all"
                />
                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 px-3 py-3 rounded-lg transition-all"
                  title="AI Assistant"
                >
                  ✨
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() && attachedFiles.length === 0}
                  className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-25" />
              <p>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}