import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Bot, X, Sparkles, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudio } from '../../context/AudioContext';
import robotAvatar from '../../assets/speakwise-robot.png';

export const VoiceConversationModal = ({ isOpen, onClose, onSendMessage, languageMode = 'mixed' }) => {
  const [voiceState, setVoiceState] = useState('idle'); // 'listening', 'thinking', 'speaking', 'idle'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState('');
  const { speak, stop, isPlaying } = useAudio();

  const { isListening, transcript, isSupported, errorMessage, startListening, stopListening } = useSpeechRecognition({
    onResult: (currentText, isFinal) => {
      setLiveTranscript(currentText);
      if (isFinal && currentText.trim()) {
        handleUserSpeechCompleted(currentText.trim());
      }
    }
  });

  // Track speech synthesis state changes
  useEffect(() => {
    if (!isPlaying && voiceState === 'speaking') {
      setVoiceState('idle');
      // Automatically prompt to listen again for hands-free natural flow
      setTimeout(() => {
        if (isOpen) {
          initiateListening();
        }
      }, 800);
    }
  }, [isPlaying, voiceState, isOpen]);

  useEffect(() => {
    if (isOpen) {
      initiateListening();
    } else {
      stopListening();
      stop();
      setVoiceState('idle');
    }
  }, [isOpen]);

  const initiateListening = () => {
    stop();
    setLiveTranscript('');
    setVoiceState('listening');
    const langCode = languageMode === 'marathi' ? 'mr-IN' : 'en-US';
    startListening(langCode);
  };

  const handleUserSpeechCompleted = async (spokenText) => {
    stopListening();
    setVoiceState('thinking');

    try {
      const response = await onSendMessage(spokenText);
      if (response && response.aiMessage) {
        setLastAIResponse(response.aiMessage.text);
        setVoiceState('speaking');
        speak(response.aiMessage.text, 'voice_modal_msg');
      } else {
        setVoiceState('idle');
      }
    } catch (err) {
      console.error('Voice conversation error:', err);
      setVoiceState('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border shadow-2xl flex flex-col items-center"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          boxShadow: '0 25px 50px -12px var(--accent-glow)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>
            Voice Conversation Mode
          </h3>
        </div>

        <p className="text-xs mb-8 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Speak naturally in English or Marathi. SpeakWise AI will listen and respond aloud.
        </p>

        {/* Animated Central Visualizer */}
        <div className="relative flex items-center justify-center my-4">
          {voiceState === 'listening' && (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-red-500/20 mic-active border border-red-500/40">
              <Mic size={48} className="text-red-500 animate-pulse" />
            </div>
          )}

          {voiceState === 'thinking' && (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-amber-500/20 border border-amber-500/40 p-4">
              <img src={robotAvatar} alt="SpeakWise AI Assistant" className="w-16 h-16 object-contain animate-bounce" />
            </div>
          )}

          {voiceState === 'speaking' && (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-purple-500/20 mic-active border border-purple-500/40">
              <Volume2 size={48} className="text-purple-400 animate-bounce" />
            </div>
          )}

          {voiceState === 'idle' && (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
              <MicOff size={44} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>

        {/* Current State Status Tag */}
        <div className="mt-4 mb-3">
          {voiceState === 'listening' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Listening to you...
            </span>
          )}
          {voiceState === 'thinking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <img src={robotAvatar} alt="SpeakWise AI Assistant" className="w-4 h-4 object-contain inline" />
              SpeakWise is thinking...
            </span>
          )}
          {voiceState === 'speaking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🔊 SpeakWise is speaking...
            </span>
          )}
          {voiceState === 'idle' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
              Paused / Idle
            </span>
          )}
        </div>

        {/* Dynamic Transcript Area */}
        <div
          className="w-full min-h-[90px] p-3.5 rounded-2xl border text-xs leading-relaxed overflow-y-auto mb-6 flex flex-col justify-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-main)'
          }}
        >
          {liveTranscript && (
            <p className="text-left font-medium text-cyan-300">
              <span className="font-bold text-white/60">You: </span>"{liveTranscript}"
            </p>
          )}

          {lastAIResponse && !liveTranscript && (
            <p className="text-left font-medium" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-bold text-purple-300 inline-flex items-center gap-1">
                <img src={robotAvatar} alt="SpeakWise AI Assistant" className="w-4 h-4 object-contain inline" />
                SpeakWise:
              </span> "{lastAIResponse}"
            </p>
          )}

          {!liveTranscript && !lastAIResponse && (
            <p className="italic text-center" style={{ color: 'var(--text-muted)' }}>
              Speak something to begin...
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-red-400 mb-4 flex items-center gap-1">
            <AlertCircle size={14} /> {errorMessage}
          </p>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full">
          {voiceState === 'listening' ? (
            <button
              onClick={() => handleUserSpeechCompleted(liveTranscript)}
              disabled={!liveTranscript.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition shadow cursor-pointer disabled:opacity-40"
              style={{ background: 'var(--accent-gradient)' }}
            >
              Send Spoken Words
            </button>
          ) : (
            <button
              onClick={initiateListening}
              className="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition shadow cursor-pointer"
              style={{ background: 'var(--accent-gradient)' }}
            >
              Start Speaking
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border hover:opacity-80 text-xs font-semibold transition cursor-pointer"
            style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
          >
            Switch to Chat
          </button>
        </div>
      </div>
    </div>
  );
};
