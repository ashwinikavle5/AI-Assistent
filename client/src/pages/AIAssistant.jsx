import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ChatMessage } from '../components/chat/ChatMessage';
import { VoiceConversationModal } from '../components/chat/VoiceConversationModal';
import { StreakCelebration } from '../components/streak/StreakCelebration';
import robotAvatar from '../assets/speakwise-robot.png';
import {
  Send,
  Mic,
  Sparkles,
  Bot,
  RefreshCw,
  Trash2,
  Radio,
  AlertCircle
} from 'lucide-react';

export const AIAssistant = () => {
  const { token, user } = useAuth();
  const { speak, autoPlay } = useAudio();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [languageMode, setLanguageMode] = useState('mixed'); // 'english', 'marathi', 'mixed'
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Streak celebration state
  const [celebrateStreak, setCelebrateStreak] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Speech Recognition hook for input bar
  const { isListening, transcript, isSupported, errorMessage, startListening, stopListening, setTranscript } = useSpeechRecognition({
    onResult: (text, isFinal) => {
      setInputText(text);
    }
  });

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load active conversation or create default on mount
  useEffect(() => {
    const initChat = async () => {
      if (!token) return;
      try {
        const convRes = await fetch('/api/ai/conversations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const convData = await convRes.json();

        let activeId = null;
        if (convData.success && convData.conversations.length > 0) {
          activeId = convData.conversations[0].id;
          setConversationId(activeId);

          // Fetch messages
          const msgRes = await fetch(`/api/ai/conversations/${activeId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const msgData = await msgRes.json();
          if (msgData.success && msgData.messages.length > 0) {
            setMessages(msgData.messages);
          } else {
            // Default welcome message
            setMessages([
              {
                id: 'welcome_1',
                sender: 'ai',
                text: `Hello ${user?.name || ''}! 👋 I'm SpeakWise AI, your friendly AI English companion. You can chat with me in English, Marathi, or Roman Marathi (like "what are you doing?" or "jevn zal ka?"). What would you like to talk about today?`,
                created_at: new Date().toISOString()
              }
            ]);
          }
        } else {
          // Create new conversation
          const createRes = await fetch('/api/ai/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: 'English Practice' })
          });
          const createData = await createRes.json();
          if (createData.success) {
            setConversationId(createData.conversation.id);
            setMessages([createData.welcomeMessage]);
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
      }
    };

    initChat();
  }, [token, user]);

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    if (isListening) {
      stopListening();
    }

    const optimisticId = 'user_opt_' + Date.now();
    const optimisticMessage = {
      id: optimisticId,
      sender: 'user',
      text: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputText('');
    setTranscript('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          text
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Replace optimistic with server-verified message and append AI response
        setMessages(prev => [
          ...prev.filter(m => m.id !== optimisticId),
          data.userMessage,
          data.aiMessage
        ]);

        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        // Auto play audio if enabled
        if (autoPlay) {
          speak(data.aiMessage.text, data.aiMessage.id);
        }

        // Check if streak increased
        if (data.streak && data.streak.streakIncreased) {
          setCelebrateStreak(data.streak.currentStreak);
        }

        return data;
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'err_' + Date.now(),
            sender: 'ai',
            text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      const lang = languageMode === 'marathi' ? 'mr-IN' : 'en-US';
      startListening(lang);
    }
  };

  const handleStartNewChat = async () => {
    if (!token) return;
    try {
      const createRes = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: `Practice - ${new Date().toLocaleDateString()}` })
      });
      const createData = await createRes.json();
      if (createData.success) {
        setConversationId(createData.conversation.id);
        setMessages([
          {
            id: 'new_welcome',
            sender: 'ai',
            text: `Hello ${user?.name || ''}! 👋 Ready to practice English with you! What would you like to talk about?`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.error('New chat creation error:', e);
    }
  };

  const handleClearConversation = () => {
    if (window.confirm("Are you sure you want to clear this conversation history?")) {
      handleStartNewChat();
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col rounded-3xl border shadow-xl overflow-hidden relative"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-main)'
      }}
    >
      {/* Top Bar of Chat */}
      <div
        className="px-4 sm:px-6 py-3.5 border-b flex items-center justify-between backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(var(--bg-surface), 0.95)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 6px 16px var(--accent-glow)'
            }}
          >
            <img
              src={robotAvatar}
              alt="SpeakWise AI Assistant"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base leading-tight tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                <span>SpeakWise</span>
                <span style={{ color: 'var(--accent-primary)' }}>AI</span>
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            </div>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Your friendly AI English companion.
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hands-free Voice Mode Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 hover:scale-105 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--accent-primary)'
            }}
            title="Launch Voice Conversation"
          >
            <Radio size={14} className="animate-pulse" />
            <span className="hidden sm:inline">Voice Mode</span>
          </button>

          {/* Language Selector Override */}
          <div className="relative flex items-center gap-1 p-1 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)'
            }}
          >
            {[
              { id: 'english', label: '🇬🇧 EN' },
              { id: 'mixed', label: '🔄 Mixed' },
              { id: 'marathi', label: '🇮🇳 MR' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguageMode(lang.id)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  languageMode === lang.id ? 'shadow-xs' : 'hover:opacity-80'
                }`}
                style={{
                  background: languageMode === lang.id ? 'var(--accent-gradient)' : 'transparent',
                  color: languageMode === lang.id ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Clear Conversation Button */}
          <button
            onClick={handleClearConversation}
            className="p-2 rounded-xl border hover:opacity-80 transition cursor-pointer text-red-400 hover:bg-red-500/10"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)'
            }}
            title="Clear Conversation"
          >
            <Trash2 size={15} />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)'
            }}
            title="New Conversation"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-in fade-in">
            <div
              className="w-20 h-20 mb-3 rounded-3xl p-2 shadow-lg flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 10px 25px var(--accent-glow)'
              }}
            >
              <img
                src={robotAvatar}
                alt="SpeakWise AI Assistant"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
              Say Hello to SpeakWise AI! 👋
            </h3>
            <p className="text-xs max-w-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Chat in English or Roman Marathi. Ask questions, practice speaking, or improve your confidence!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* AI Typing Indicator */}
        {isSending && (
          <div className="flex items-center gap-2.5 px-4 py-3 max-w-xs rounded-2xl rounded-bl-xs border text-xs animate-in fade-in"
            style={{
              backgroundColor: 'var(--chat-ai)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-secondary)'
            }}
          >
            <img src={robotAvatar} alt="SpeakWise AI Assistant" className="w-4 h-4 object-contain shrink-0" />
            <span className="font-semibold text-purple-300">SpeakWise is thinking</span>
            <span className="flex items-center gap-0.5 ml-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-3" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Microphone Status Notice if active */}
      {isListening && (
        <div className="px-6 py-2 bg-red-500/15 border-t border-red-500/20 text-red-400 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Listening to your voice... Speak naturally in English or Marathi.</span>
          </div>
          <button
            onClick={stopListening}
            className="font-bold underline cursor-pointer hover:opacity-80"
          >
            Stop
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="px-6 py-2 bg-amber-500/15 border-t border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Chat Input Bar */}
      <div
        className="p-3 sm:p-4 border-t"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div
          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500/30"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-main)'
          }}
        >
          {/* Animated Microphone Button */}
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isListening ? 'bg-red-500 text-white mic-active' : 'hover:bg-white/5'
            }`}
            style={{
              color: isListening ? '#ffffff' : 'var(--text-muted)'
            }}
            title={isListening ? "Listening... click to stop" : "Speak using microphone"}
          >
            <Mic size={18} className={isListening ? "animate-pulse" : ""} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening..."
                : languageMode === 'marathi'
                ? "मराठीत बोला किंवा लिहा..."
                : "Type or speak in English or Roman Marathi..."
            }
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
            style={{ color: 'var(--text-main)' }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-xl text-white transition-all duration-200 shadow-md cursor-pointer disabled:opacity-40 hover:opacity-90"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: inputText.trim() ? '0 4px 12px var(--accent-glow)' : 'none'
            }}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Hands-free Voice Modal */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendMessage={handleSendMessage}
        languageMode={languageMode}
      />

      {/* Streak Extended Celebration Modal */}
      {celebrateStreak !== null && (
        <StreakCelebration
          streakDays={celebrateStreak}
          onClose={() => setCelebrateStreak(null)}
        />
      )}
    </div>
  );
};
