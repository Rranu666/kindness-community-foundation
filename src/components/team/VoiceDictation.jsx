import { useState, useRef } from 'react';
import { Mic, StopCircle, Send, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VoiceDictation({ onMessageTranscribed, teamMembers, user, selectedType, selectedRecipient, selectedGroup }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [selectedRecipientVoice, setSelectedRecipientVoice] = useState(selectedRecipient || '');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      // silently ignore — mic not available
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeMessage = async () => {
    if (!recordedAudio) return;

    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(recordedAudio);
      reader.onload = async () => {
        const base64Audio = reader.result.split(',')[1];

        // Call InvokeLLM to transcribe audio
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Transcribe this voice message accurately. Return ONLY the transcribed text, nothing else.`,
          file_urls: [`data:audio/webm;base64,${base64Audio}`],
          model: 'gemini_3_flash'
        });

        const transcribedText = response;
        
        // Get recipient name for display
        const recipientName = selectedType === 'direct'
          ? teamMembers.find(m => m.email === selectedRecipientVoice)?.full_name || 'Unknown'
          : 'Group Message';

        onMessageTranscribed(transcribedText, recipientName);
        setRecordedAudio(null);
        setIsTranscribing(false);
      };
    } catch (error) {
      // silently ignore transcription error
      setIsTranscribing(false);
    }
  };

  const discardRecording = () => {
    setRecordedAudio(null);
  };

  return (
    <div className="space-y-4">
      {/* Recipient Selection for Voice Message */}
      {selectedType === 'direct' && (
        <div>
          <label className="block text-xs text-slate-400 mb-2">Send Voice Message To</label>
          <select
            value={selectedRecipientVoice}
            onChange={(e) => setSelectedRecipientVoice(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a team member...</option>
            {teamMembers
              .filter((m) => m.email !== user?.email)
              .map((member) => (
                <option key={member.id} value={member.email}>
                  {member.full_name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Recording Controls */}
      <div className="space-y-3">
        {!recordedAudio ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <StopCircle size={20} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Voice Message
              </>
            )}
          </button>
        ) : (
          <div className="bg-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Recording ready to transcribe</span>
              <span className="text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">Ready</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={transcribeMessage}
                disabled={isTranscribing}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
              >
                {isTranscribing ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Transcribe & Send
                  </>
                )}
              </button>
              <button
                onClick={discardRecording}
                disabled={isTranscribing}
                className="flex-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white py-2 rounded-lg transition-all font-medium"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}