import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { GRAMMAR_TOPICS, TENSES_DATA } from '../data/grammarData';
import {
  BrainCircuit,
  BookOpen,
  Send,
  Mic,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  ChevronRight,
  ChevronDown,
  Globe2,
  Flame,
  Award,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  Clock,
  Layers,
  BookMarked
} from 'lucide-react';

const PRACTICE_LEVELS = [
  { id: 'beginner', label: 'Level 1: Beginner', desc: 'Simple Marathi sentences' },
  { id: 'basic', label: 'Level 2: Basic', desc: 'Daily-life routine sentences' },
  { id: 'intermediate', label: 'Level 3: Intermediate', desc: 'Tenses, prepositions & modals' },
  { id: 'advanced', label: 'Level 4: Advanced', desc: 'Complex sentences & conditionals' }
];

export const Practice = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'grammar' ? 'grammar' : 'practice';

  const { token } = useAuth();
  const { speak } = useAudio();

  const [activeTab, setActiveTab] = useState(initialTab); // 'practice' or 'grammar'

  // ==========================================
  // PRACTICE SECTION STATE (Marathi -> English)
  // ==========================================
  const [practiceLevel, setPracticeLevel] = useState('intermediate');
  const [currentSentence, setCurrentSentence] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // ==========================================
  // GRAMMAR LIBRARY STATE
  // Navigation Flow: 'library' -> 'tenses_list' -> 'tense_detail' OR 'library' -> 'topic_detail'
  // ==========================================
  const [grammarView, setGrammarView] = useState('library'); // 'library', 'tenses_list', 'topic_detail', 'tense_detail'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTense, setSelectedTense] = useState(null);
  const [grammarCategoryFilter, setGrammarCategoryFilter] = useState('All');
  const [grammarSearchQuery, setGrammarSearchQuery] = useState('');
  const [showPracticeAnswers, setShowPracticeAnswers] = useState({});

  const historyEndRef = useRef(null);

  // Speech Recognition for Voice Practice
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      setUserAnswer(text);
    }
  });

  // Sync tab with URL query
  useEffect(() => {
    if (searchParams.get('tab') === 'grammar') {
      setActiveTab('grammar');
    }
  }, [searchParams]);

  // Load first practice sentence on mount or when level changes
  useEffect(() => {
    if (token) {
      loadNextSentence(practiceLevel);
    }
  }, [practiceLevel, token]);

  const loadNextSentence = async (lvl = practiceLevel, excludeId = null) => {
    setIsChecking(true);
    try {
      const url = `/api/ai/practice/sentence?level=${lvl}${excludeId ? `&excludeId=${excludeId}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.sentence) {
        setCurrentSentence(data.sentence);
        setUserAnswer('');
        setLastResult(null);
      }
    } catch (err) {
      console.error('Error fetching practice sentence:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckAnswer = async (textToCheck = null) => {
    const answer = (textToCheck || userAnswer).trim();
    if (!answer || !currentSentence || isChecking) return;

    if (isListening) stopListening();

    setIsChecking(true);
    try {
      const res = await fetch('/api/ai/practice/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sentenceId: currentSentence.id,
          userEnglish: answer,
          level: practiceLevel
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastResult(data);
        if (data.isCorrect) {
          setScore(prev => prev + 1);
          setStreak(prev => prev + 1);
        } else {
          setStreak(0);
        }

        setPracticeHistory(prev => [
          ...prev,
          {
            id: 'eval_' + Date.now(),
            marathi: currentSentence.marathi,
            roman: currentSentence.roman,
            userSentence: answer,
            correctEnglish: data.correctEnglish,
            isCorrect: data.isCorrect,
            status: data.status,
            grammarRule: data.grammarRule,
            mistakeExplanation: data.mistakeExplanation,
            examples: data.examples
          }
        ]);

        if (data.nextSentence) {
          setCurrentSentence(data.nextSentence);
        }
        setUserAnswer('');

        setTimeout(() => {
          historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      console.error('Error checking translation:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening('en-US');
    }
  };

  // Grammar Library Filtering
  const filteredTopics = GRAMMAR_TOPICS.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(grammarSearchQuery.toLowerCase()) ||
      topic.marathiTitle.toLowerCase().includes(grammarSearchQuery.toLowerCase()) ||
      topic.shortDesc.toLowerCase().includes(grammarSearchQuery.toLowerCase());

    if (grammarCategoryFilter === 'All') return matchesSearch;
    return matchesSearch && topic.category === grammarCategoryFilter;
  });

  const handleOpenTopic = (topic) => {
    if (topic.isTenses) {
      setGrammarView('tenses_list');
    } else {
      setSelectedTopic(topic);
      setGrammarView('topic_detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTense = (tense) => {
    setSelectedTense(tense);
    setGrammarView('tense_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePracticeAnswer = (qIdx) => {
    setShowPracticeAnswers(prev => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0"
              style={{ background: 'var(--accent-gradient)', color: '#fff' }}
            >
              <BrainCircuit size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Grammar & Practice
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Complete English Grammar Library & Interactive Marathi → English translation practice.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-2xl border shrink-0"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <button
            onClick={() => {
              setActiveTab('practice');
              setSearchParams({});
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'text-white shadow-md'
                : 'hover:opacity-90'
            }`}
            style={{
              background: activeTab === 'practice' ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === 'practice' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Globe2 size={14} />
            <span>Marathi → English Practice</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('grammar');
              setSearchParams({ tab: 'grammar' });
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grammar'
                ? 'text-white shadow-md'
                : 'hover:opacity-90'
            }`}
            style={{
              background: activeTab === 'grammar' ? 'var(--accent-gradient)' : 'transparent',
              color: activeTab === 'grammar' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <BookOpen size={14} />
            <span>Grammar Library</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MARATHI -> ENGLISH TRANSLATION PRACTICE
         ========================================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* Difficulty Selector & Score Badge */}
          <div
            className="p-3 sm:p-4 rounded-3xl border shadow-md flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Difficulty:
              </span>
              {PRACTICE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setPracticeLevel(lvl.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                    practiceLevel === lvl.id
                      ? 'ring-1 ring-purple-500 font-extrabold shadow-xs'
                      : 'hover:scale-102'
                  }`}
                  style={{
                    backgroundColor: practiceLevel === lvl.id ? 'rgba(168, 85, 247, 0.18)' : 'var(--bg-card)',
                    borderColor: practiceLevel === lvl.id ? 'rgb(168, 85, 247)' : 'var(--border-main)',
                    color: practiceLevel === lvl.id ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                  title={lvl.desc}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Streak & Score */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border"
                style={{
                  backgroundColor: 'rgba(234, 88, 12, 0.1)',
                  borderColor: 'rgba(234, 88, 12, 0.3)',
                  color: 'rgb(249, 115, 22)'
                }}
              >
                <Flame size={14} className="animate-bounce" />
                <span>Streak: {streak}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: 'rgb(16, 185, 129)'
                }}
              >
                <Award size={14} />
                <span>Correct: {score}</span>
              </div>
            </div>
          </div>

          {/* Active Marathi Sentence Challenge Card */}
          {currentSentence && (
            <div
              className="p-5 sm:p-7 rounded-3xl border shadow-xl space-y-4 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider"
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    borderColor: 'rgba(168, 85, 247, 0.35)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  Translate into English:
                </span>

                <button
                  onClick={() => loadNextSentence(practiceLevel, currentSentence.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                  title="Skip to another sentence"
                >
                  <RotateCcw size={13} />
                  <span>Skip Sentence</span>
                </button>
              </div>

              {/* Marathi Sentence Display */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                    "{currentSentence.marathi}"
                  </h2>
                  <button
                    onClick={() => speak(currentSentence.primaryEnglish, 'challenge_en', 0.95)}
                    className="p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
                    style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                    title="Pronounce English Answer"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <p className="text-xs sm:text-sm font-medium italic" style={{ color: 'var(--text-muted)' }}>
                  ({currentSentence.roman})
                </p>
              </div>

              {/* Translation Input Bar */}
              <div
                className="flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 mt-2"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: isListening ? 'rgb(239, 68, 68)' : 'var(--border-main)'
                }}
              >
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:opacity-80'
                  }`}
                  style={{
                    color: isListening ? '#ffffff' : 'var(--text-muted)'
                  }}
                  title={isListening ? "Listening... click to submit" : "Speak English translation"}
                >
                  <Mic size={18} />
                </button>

                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening to your voice..." : "Type your English translation here..."}
                  className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                  disabled={isChecking}
                />

                <button
                  type="button"
                  onClick={() => handleCheckAnswer()}
                  disabled={!userAnswer.trim() || isChecking}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 hover:opacity-90"
                  style={{
                    background: 'var(--accent-gradient)'
                  }}
                >
                  {isChecking ? (
                    <span>Checking...</span>
                  ) : (
                    <>
                      <span>Check</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Card */}
          {lastResult && (
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 animate-in fade-in duration-200 ${
                lastResult.isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lastResult.isCorrect ? (
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  ) : (
                    <XCircle size={22} className="text-red-400" />
                  )}
                  <h3 className="font-extrabold text-base" style={{ color: lastResult.isCorrect ? '#10b981' : '#f87171' }}>
                    {lastResult.isCorrect ? '✅ Correct!' : (lastResult.status === 'almost' ? '❌ Almost correct.' : '❌ Correction:')}
                  </h3>
                </div>

                <button
                  onClick={() => loadNextSentence(practiceLevel)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90 transition"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  Next Marathi Sentence →
                </button>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {!lastResult.isCorrect && (
                  <div className="p-3 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--border-main)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Your Answer:</span>
                    <p className="font-semibold text-sm mt-1" style={{ color: 'var(--text-main)' }}>
                      "{lastResult.userSentence}"
                    </p>
                  </div>
                )}
                <div className="p-3 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--border-main)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Correct English:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-bold text-sm text-emerald-300">
                      "{lastResult.correctEnglish}"
                    </p>
                    <button
                      onClick={() => speak(lastResult.correctEnglish, 'correct_audio', 0.95)}
                      className="text-muted hover:text-white cursor-pointer p-1"
                      title="Listen"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mistake Explanation */}
              {lastResult.mistakeExplanation && (
                <div className="p-3.5 rounded-2xl border bg-amber-500/10 border-amber-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <AlertCircle size={14} />
                    <span>Mistake Explanation:</span>
                  </div>
                  <p className="text-xs font-medium text-amber-100 leading-relaxed">
                    {lastResult.mistakeExplanation}
                  </p>
                </div>
              )}

              {/* Relevant Grammar Rule */}
              <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">📖 Relevant Grammar Rule:</span>
                <p className="text-xs font-bold font-mono text-purple-200 mt-1">
                  {lastResult.grammarRule}
                </p>
                {lastResult.ruleExplanation && (
                  <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {lastResult.ruleExplanation}
                  </p>
                )}
              </div>

              {/* Similar Examples */}
              {lastResult.examples && lastResult.examples.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Similar Examples:
                  </span>
                  <div className="space-y-1">
                    {lastResult.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl border text-xs font-medium"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-main)' }}
                      >
                        <span>• {ex}</span>
                        <button
                          onClick={() => speak(ex, `sim_${idx}`, 0.95)}
                          className="text-muted hover:text-white cursor-pointer p-1"
                          title="Listen"
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Session History */}
          {practiceHistory.length > 0 && (
            <div
              className="p-4 sm:p-5 rounded-3xl border shadow-md space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Session Practice History ({practiceHistory.length} sentences)
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {practiceHistory.slice().reverse().map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border flex items-start justify-between gap-3 text-xs"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                  >
                    <div className="space-y-1">
                      <div className="font-bold" style={{ color: 'var(--text-main)' }}>
                        "{item.marathi}" <span className="font-normal opacity-70">({item.roman})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: item.isCorrect ? '#10b981' : '#f87171' }}>
                          {item.isCorrect ? '✅' : '❌'} {item.userSentence}
                        </span>
                        {!item.isCorrect && (
                          <span className="font-bold text-emerald-400">
                            → "{item.correctEnglish}"
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                      style={{
                        backgroundColor: item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        borderColor: item.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        color: item.isCorrect ? '#10b981' : '#f87171'
                      }}
                    >
                      {item.isCorrect ? 'Correct' : 'Needs Practice'}
                    </span>
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: COMPLETE GRAMMAR LIBRARY
         ========================================================================= */}
      {activeTab === 'grammar' && (
        <div className="space-y-5">
          {/* LEVEL 1: MAIN GRAMMAR LIBRARY (Topic Headings / Cards Only in Clean Grid) */}
          {grammarView === 'library' && (
            <div
              className="p-5 sm:p-7 rounded-3xl border shadow-xl space-y-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              {/* Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border-main)' }}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                    Complete Grammar Library
                  </h2>
                  <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    34 Comprehensive Topics • Click any topic to study its complete rules, formulas, and examples.
                  </p>
                </div>

                {/* Search Bar */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl border w-full sm:w-72"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-main)' }}
                >
                  <Search size={15} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={grammarSearchQuery}
                    onChange={(e) => setGrammarSearchQuery(e.target.value)}
                    placeholder="Search all 34 grammar topics..."
                    className="bg-transparent border-none outline-none text-xs w-full font-medium"
                    style={{ color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Foundations', 'Verbs & Tenses', 'Sentence Structure', 'Mastery'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGrammarCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      grammarCategoryFilter === cat
                        ? 'ring-1 ring-purple-500 font-extrabold shadow-xs'
                        : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: grammarCategoryFilter === cat ? 'rgba(168, 85, 247, 0.18)' : 'var(--bg-card)',
                      borderColor: grammarCategoryFilter === cat ? 'rgb(168, 85, 247)' : 'var(--border-main)',
                      color: grammarCategoryFilter === cat ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {cat === 'All' ? `All (34)` : cat}
                  </button>
                ))}
              </div>

              {/* 34 Topic Cards Grid (Clean Headings Only, No long explanations here!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => handleOpenTopic(topic)}
                    className="p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between"
                    style={{
                      backgroundColor: topic.isTenses ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-card)',
                      borderColor: topic.isTenses ? 'rgba(168, 85, 247, 0.4)' : 'var(--border-main)'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            background: topic.isTenses ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.08)',
                            color: '#ffffff'
                          }}
                        >
                          {topic.number}
                        </span>

                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider"
                          style={{
                            backgroundColor: topic.isTenses ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.04)',
                            borderColor: topic.isTenses ? 'rgba(168, 85, 247, 0.4)' : 'var(--border-main)',
                            color: topic.isTenses ? 'var(--accent-primary)' : 'var(--text-muted)'
                          }}
                        >
                          {topic.isTenses ? '12 Tenses Sub-Library' : topic.category}
                        </span>
                      </div>

                      {/* Topic Title & Marathi Subtitle */}
                      <h3 className="font-bold text-sm tracking-tight group-hover:text-purple-400 transition-colors" style={{ color: 'var(--text-main)' }}>
                        {topic.title}
                      </h3>
                      <p className="text-[11px] font-medium opacity-80 mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                        {topic.marathiTitle}
                      </p>
                      <p className="text-xs font-normal opacity-70 line-clamp-2 mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {topic.shortDesc}
                      </p>
                    </div>

                    {/* Bottom Action Hint */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs font-semibold" style={{ borderColor: 'var(--border-main)' }}>
                      <span className="text-[11px] group-hover:underline" style={{ color: 'var(--accent-primary)' }}>
                        {topic.isTenses ? 'Open 12 Tenses Directory' : 'Study Complete Topic'}
                      </span>
                      <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2: TENSES SUB-DIRECTORY (12 Detailed Tenses Cards) */}
          {grammarView === 'tenses_list' && (
            <div
              className="p-5 sm:p-7 rounded-3xl border shadow-xl space-y-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              {/* Back Button & Header */}
              <div className="border-b pb-4 space-y-3" style={{ borderColor: 'var(--border-main)' }}>
                <button
                  onClick={() => setGrammarView('library')}
                  className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition cursor-pointer px-3 py-1.5 rounded-xl border w-fit"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>← Back to Grammar Library</span>
                </button>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                      <span>All 12 English Tenses</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10">
                        काळ व १२ प्रकार
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                      Present, Past, and Future Tenses • Select any tense to study its definition, when to use, full 5-form sentence structures, and rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* 12 Tense Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {TENSES_DATA.map((tense) => (
                  <div
                    key={tense.id}
                    onClick={() => handleOpenTense(tense)}
                    className="p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-main)'
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ background: 'var(--accent-gradient)' }}
                        >
                          {tense.number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          {tense.level}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm tracking-tight group-hover:text-purple-400 transition-colors" style={{ color: 'var(--text-main)' }}>
                        {tense.title}
                      </h3>
                      <p className="text-[11px] font-medium opacity-80 mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                        {tense.marathiTitle}
                      </p>
                      <p className="text-xs font-normal opacity-70 line-clamp-2 mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {tense.definition}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs font-semibold" style={{ borderColor: 'var(--border-main)' }}>
                      <span className="text-[11px] group-hover:underline" style={{ color: 'var(--accent-primary)' }}>
                        Study Complete Tense →
                      </span>
                      <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 3: COMPLETE TOPIC DETAILED VIEW (For Topics 1-34 or 12 Tenses) */}
          {(grammarView === 'topic_detail' || grammarView === 'tense_detail') && (
            (() => {
              const item = grammarView === 'tense_detail' ? selectedTense : selectedTopic;
              if (!item) return null;

              return (
                <div
                  className="p-5 sm:p-7 rounded-3xl border shadow-xl space-y-6 animate-in fade-in duration-200"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)'
                  }}
                >
                  {/* Navigation Back Button & Breadcrumbs */}
                  <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-2" style={{ borderColor: 'var(--border-main)' }}>
                    <button
                      onClick={() => {
                        if (grammarView === 'tense_detail') {
                          setGrammarView('tenses_list');
                        } else {
                          setGrammarView('library');
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition cursor-pointer px-3.5 py-2 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--accent-primary)'
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>
                        {grammarView === 'tense_detail' ? '← Back to Tenses List' : '← Back to Grammar Library'}
                      </span>
                    </button>

                    <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Grammar Library &gt; {grammarView === 'tense_detail' ? 'Tenses > ' : ''}{item.title}
                    </div>
                  </div>

                  {/* Topic Title Header */}
                  <div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                        {item.title}
                      </h1>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider"
                        style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.15)',
                          borderColor: 'rgba(168, 85, 247, 0.35)',
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {item.level}
                      </span>
                    </div>
                    {item.marathiTitle && (
                      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--accent-primary)' }}>
                        {item.marathiTitle}
                      </p>
                    )}
                  </div>

                  {/* 1. 📖 Definition (English + Marathi) */}
                  <div className="p-4 sm:p-5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">📖 Definition:</span>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-main)' }}>
                      {item.definition}
                    </p>
                    {item.marathiExplanation && (
                      <p className="text-xs font-medium leading-relaxed pt-2 border-t opacity-90" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-main)' }}>
                        💡 <strong>मराठी स्पष्टीकरण:</strong> {item.marathiExplanation}
                      </p>
                    )}
                  </div>

                  {/* 2. 📐 Rules & When to Use */}
                  <div className="p-4 sm:p-5 rounded-2xl border space-y-2.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">📐 Core Rules & When to Use:</span>
                    {item.whenToUse && (
                      <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <strong>Context:</strong> {item.whenToUse}
                      </p>
                    )}
                    {item.rules && (
                      <ul className="space-y-1.5 text-xs font-medium list-disc list-inside" style={{ color: 'var(--text-main)' }}>
                        {item.rules.map((r, idx) => (
                          <li key={idx} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* 3. 🏛️ Complete Sentence Structures (Affirmative, Negative, Interrogative, Neg-Interrogative, WH) */}
                  {item.structure && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        🏛️ Complete Sentence Structures (All 5 Forms):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Affirmative */}
                        {item.structure.affirmative && (
                          <div className="p-3.5 rounded-2xl border bg-emerald-500/10 border-emerald-500/25 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                              <Check size={14} />
                              <span>✅ Affirmative / Positive (होकारार्थी):</span>
                            </div>
                            <div className="font-mono text-xs text-emerald-200 font-semibold">{item.structure.affirmative.formula}</div>
                            <div className="italic text-xs font-medium text-emerald-100">Ex: "{item.structure.affirmative.example}"</div>
                          </div>
                        )}

                        {/* Negative */}
                        {item.structure.negative && (
                          <div className="p-3.5 rounded-2xl border bg-red-500/10 border-red-500/25 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-red-400">
                              <XCircle size={14} />
                              <span>❌ Negative (नकारार्थी):</span>
                            </div>
                            <div className="font-mono text-xs text-red-200 font-semibold">{item.structure.negative.formula}</div>
                            <div className="italic text-xs font-medium text-red-100">Ex: "{item.structure.negative.example}"</div>
                          </div>
                        )}

                        {/* Interrogative */}
                        {item.structure.interrogative && (
                          <div className="p-3.5 rounded-2xl border bg-blue-500/10 border-blue-500/25 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                              <HelpCircle size={14} />
                              <span>❓ Interrogative (प्रश्नार्थक):</span>
                            </div>
                            <div className="font-mono text-xs text-blue-200 font-semibold">{item.structure.interrogative.formula}</div>
                            <div className="italic text-xs font-medium text-blue-100">Ex: "{item.structure.interrogative.example}"</div>
                          </div>
                        )}

                        {/* Negative Interrogative */}
                        {item.structure.negativeInterrogative && (
                          <div className="p-3.5 rounded-2xl border bg-purple-500/10 border-purple-500/25 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
                              <HelpCircle size={14} />
                              <span>❓ Negative Interrogative (नकारार्थी प्रश्नार्थक):</span>
                            </div>
                            <div className="font-mono text-xs text-purple-200 font-semibold">{item.structure.negativeInterrogative.formula}</div>
                            <div className="italic text-xs font-medium text-purple-100">Ex: "{item.structure.negativeInterrogative.example}"</div>
                          </div>
                        )}
                      </div>

                      {/* WH Questions */}
                      {item.structure.whQuestions && (
                        <div className="p-3.5 rounded-2xl border bg-amber-500/10 border-amber-500/25 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                            <Search size={14} />
                            <span>🔎 WH Questions (माहिती विचारणारे प्रश्न):</span>
                          </div>
                          <div className="font-mono text-xs text-amber-200 font-semibold">{item.structure.whQuestions.formula}</div>
                          <div className="italic text-xs font-medium text-amber-100">Ex: "{item.structure.whQuestions.example}"</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. 💡 Practical Examples (with Audio TTS) */}
                  {item.examples && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        💡 Practical Examples:
                      </span>
                      <div className="space-y-1.5">
                        {item.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-2xl border text-xs font-medium"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                          >
                            <span style={{ color: 'var(--text-main)' }}>• {ex}</span>
                            <button
                              onClick={() => speak(ex, `ex_${idx}`, 0.95)}
                              className="text-muted hover:text-white cursor-pointer p-1 rounded-lg hover:bg-white/10"
                              title="Listen to pronunciation"
                            >
                              <Volume2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. ⚠️ Common Mistakes & Correct vs Incorrect */}
                  {item.correctVsIncorrect && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        ⚠️ Common Mistakes vs Correct English:
                      </span>
                      {item.commonMistakes && (
                        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {item.commonMistakes}
                        </p>
                      )}
                      <div className="space-y-2">
                        {item.correctVsIncorrect.map((pair, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl border text-xs space-y-1.5"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}
                          >
                            <div className="flex items-center gap-1.5 text-red-400 font-medium">
                              <XCircle size={14} className="shrink-0" />
                              <span>❌ {pair.wrong}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 size={14} className="shrink-0" />
                              <span>✅ {pair.right}</span>
                            </div>
                            {pair.why && (
                              <p className="text-[11px] font-medium pt-1 opacity-80 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-main)' }}>
                                💡 <strong>Why?</strong> {pair.why}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. 📝 Quick Practice Challenges */}
                  {item.practiceQuestions && (
                    <div className="p-4 sm:p-5 rounded-2xl border bg-purple-500/10 border-purple-500/25 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <HelpCircle size={15} />
                        <span>📝 Quick Practice Challenges:</span>
                      </div>
                      <ul className="text-xs space-y-2 text-purple-200 font-medium list-disc list-inside">
                        {item.practiceQuestions.map((q, idx) => (
                          <li key={idx} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Return Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (grammarView === 'tense_detail') {
                          setGrammarView('tenses_list');
                        } else {
                          setGrammarView('library');
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer hover:opacity-90 transition"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <ArrowLeft size={14} />
                      <span>{grammarView === 'tense_detail' ? 'Back to Tenses Directory' : 'Back to Grammar Library'}</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
