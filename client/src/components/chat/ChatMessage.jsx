import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, Copy, Check } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { GrammarCorrection } from './GrammarCorrection';
import robotAvatar from '../../assets/speakwise-robot.png';

export const ChatMessage = ({ message }) => {
  const isAI = message.sender === 'ai';
  const { isPlaying, isPaused, currentTextId, speak, pause, resume, stop, playbackSpeed, changeSpeed } = useAudio();
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCurrentAudio = isPlaying && currentTextId === message.id;
  const isCurrentPaused = isPaused && currentTextId === message.id;

  const handleAudioToggle = () => {
    if (isCurrentAudio) {
      pause();
    } else if (isCurrentPaused) {
      resume();
    } else {
      speak(message.text, message.id);
    }
  };

  const handleSpeedSelect = (speed) => {
    changeSpeed(speed);
    setShowSpeedMenu(false);
    if (isCurrentAudio || isCurrentPaused) {
      speak(message.text, message.id, speed);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4 animate-in fade-in duration-150`}>
      <div className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar Icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm self-end mb-1 overflow-hidden"
          style={{
            background: isAI ? 'var(--accent-gradient)' : 'var(--bg-card-hover)',
            border: isAI ? 'none' : '1px solid var(--border-main)',
            padding: isAI ? '2px' : '0'
          }}
        >
          {isAI ? (
            <img
              src={robotAvatar}
              alt="SpeakWise AI Assistant"
              className="w-full h-full object-contain"
            />
          ) : (
            '👤'
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col space-y-1.5">
          {/* Main Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl shadow-xs transition-all relative group ${
              isAI ? 'rounded-bl-xs' : 'rounded-br-xs text-white'
            }`}
            style={{
              backgroundColor: isAI ? 'var(--chat-ai)' : 'var(--chat-user)',
              border: isAI ? '1.5px solid var(--chat-ai-border)' : '1.5px solid var(--chat-user-border)',
              color: isAI ? 'var(--text-main)' : '#ffffff'
            }}
          >
            {/* Translation pill only when explicitly requested */}
            {!isAI && message.show_translation_card && (message.marathi_normalized || message.english_translation) && (
              <div className="mb-2 pb-2 border-b border-white/20 space-y-1 text-xs">
                {message.marathi_normalized && (
                  <div className="flex items-center gap-1 text-amber-200">
                    <span>🇮🇳 Marathi:</span>
                    <span className="font-semibold">"{message.marathi_normalized}"</span>
                  </div>
                )}
                {message.english_translation && (
                  <div className="flex items-center gap-1 text-cyan-200">
                    <span>🇬🇧 English:</span>
                    <span className="font-semibold">"{message.english_translation}"</span>
                  </div>
                )}
              </div>
            )}

            {/* Message Body */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap select-text pr-6">
              {message.text}
            </p>

            {/* Quick Copy Button */}
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-40 hover:opacity-100 transition cursor-pointer"
              style={{ color: isAI ? 'var(--text-muted)' : '#ffffff' }}
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>

            {/* Grammar Correction tray if applicable */}
            {message.grammar_correction && (
              <GrammarCorrection correction={message.grammar_correction} />
            )}

            {/* Tone & Confidence indicator on user messages */}
            {!isAI && message.analysis && (
              <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-lg font-medium bg-white/15 text-white/95 border border-white/25">
                  Tone: {message.analysis.tone}
                </span>
                <span className="px-2 py-0.5 rounded-lg font-medium bg-white/15 text-white/95 border border-white/25">
                  Confidence: {message.analysis.confidence} {message.analysis.confidence === 'High' ? '🟢' : message.analysis.confidence === 'Low' ? '🟠' : '🟡'}
                </span>
              </div>
            )}
          </div>

          {/* AI Audio & Action Controls */}
          {isAI && (
            <div className="flex items-center gap-2 px-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {/* Play / Pause audio */}
              <button
                onClick={handleAudioToggle}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border hover:opacity-80 transition cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: isCurrentAudio ? 'var(--accent-primary)' : 'var(--border-main)',
                  color: isCurrentAudio ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
                title={isCurrentAudio ? "Pause speech" : "Listen to response"}
              >
                {isCurrentAudio ? (
                  <>
                    <Pause size={13} className="text-amber-400" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} style={{ color: 'var(--accent-primary)' }} />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {/* Stop button if playing */}
              {(isCurrentAudio || isCurrentPaused) && (
                <button
                  onClick={stop}
                  className="p-1 rounded-lg border hover:bg-red-500/10 text-red-400 transition cursor-pointer"
                  style={{ borderColor: 'var(--border-main)' }}
                  title="Stop audio"
                >
                  <Square size={13} />
                </button>
              )}

              {/* Speed dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 rounded-lg border hover:opacity-80 transition cursor-pointer text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-muted)'
                  }}
                  title="Speech Speed"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div
                    className="absolute bottom-full left-0 mb-1 py-1 rounded-xl border shadow-lg z-20 flex flex-col"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-main)'
                    }}
                  >
                    {[0.75, 1.0, 1.25].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedSelect(speed)}
                        className={`px-3 py-1 text-xs text-left hover:bg-white/5 cursor-pointer font-mono ${
                          playbackSpeed === speed ? 'font-bold' : ''
                        }`}
                        style={{ color: playbackSpeed === speed ? 'var(--accent-primary)' : 'var(--text-main)' }}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
