/**
 * Tone & Confidence Analysis Service — SpeakWise AI
 *
 * Provides non-judgmental, encouraging evaluation of the user's communication:
 * 1. Tone: Positive, Friendly, Neutral, Formal, Uncertain, Nervous, Frustrated, Excited, Polite
 *    (Defaults to Neutral when uncertain).
 * 2. Confidence: High, Medium, Low
 *    (Accompanied by supportive advice, never harsh or critical).
 */

const TONES = {
  POSITIVE: 'Positive',
  FRIENDLY: 'Friendly',
  NEUTRAL: 'Neutral',
  FORMAL: 'Formal',
  UNCERTAIN: 'Uncertain',
  NERVOUS: 'Nervous',
  FRUSTRATED: 'Frustrated',
  EXCITED: 'Excited',
  POLITE: 'Polite'
};

const CONFIDENCE_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

/**
 * Analyze the tone of a given text.
 * @param {string} text - User message text
 * @returns {string} One of the TONES values
 */
const detectTone = (text) => {
  if (!text || typeof text !== 'string') return TONES.NEUTRAL;
  const lower = text.toLowerCase().trim();

  // 1. Nervousness / Fear / Stage Fright
  if (
    /\b(?:nervous|afraid|scared|fear|hesitat\w*|stage\s+fright|shy|panic|anxious|trembl\w*|ghabrayla|bheeti|bhiti|bhiti\s+vat\w*)\b/i.test(lower) ||
    /fear\s+of\s+speaking/i.test(lower) ||
    (/in\s+front\s+of\s+(?:everyone|people|audience|crowd|class)/i.test(lower) && /can't|cannot|don't\s+know\s+if|nervous|afraid|scared/i.test(lower))
  ) {
    return TONES.NERVOUS;
  }

  // 2. Frustration / Annoyance / Struggle
  if (
    /\b(?:frustrated|annoyed|angry|tired\s+of|struggling|impossible|fed\s+up|irritat\w*|giving\s+up|hate)\b/i.test(lower) ||
    /(?:so|too)\s+(?:difficult|hard)\s+to\s+learn/i.test(lower) ||
    /can't\s+do\s+this\s+anymore/i.test(lower)
  ) {
    return TONES.FRUSTRATED;
  }

  // 3. Excitement / High Energy
  if (
    /\b(?:excited|can't\s+wait|amazing|awesome|fantastic|yay|hooray|thrilled|super\s+excited|so\s+happy)\b/i.test(lower) ||
    /!{2,}/.test(text) && /\b(?:great|good|love|happy|wow)\b/i.test(lower)
  ) {
    return TONES.EXCITED;
  }

  // 4. Uncertainty / Doubt / Indecision
  if (
    /\b(?:i\s+don't\s+know|i\s+dont\s+know|not\s+sure|not\s+certain|maybe|might\s+be|if\s+i\s+can|am\s+i\s+right|is\s+it\s+right|doubt|perhaps|confused|kahi\s+samjat\s+nahi|samjat\s+nahi|kalat\s+nahi)\b/i.test(lower) ||
    /^(?:maybe|perhaps|not\s+sure|i\s+guess)\b/i.test(lower)
  ) {
    return TONES.UNCERTAIN;
  }

  // 5. Formal / Professional
  if (
    /\b(?:would\s+like\s+to|kindly|regarding|respectfully|furthermore|sincerely|inquire|apologize\s+for|dear\s+sir|dear\s+madam|as\s+per|cordially)\b/i.test(lower)
  ) {
    return TONES.FORMAL;
  }

  // 6. Polite / Courteous
  if (
    /\b(?:please|thank\s+you|thanks|excuse\s+me|pardon|could\s+you\s+please|may\s+i|appreciate\s+it|sorry|dhanyawad|krupaya)\b/i.test(lower)
  ) {
    return TONES.POLITE;
  }

  // 7. Positive / Confident
  if (
    /\b(?:i\s+think\s+i\s+can|i\s+can|confident|confidently|ready|optimistic|proud|looking\s+forward|enjoy|love\s+to|happy\s+to|great|good|positive)\b/i.test(lower)
  ) {
    return TONES.POSITIVE;
  }

  // 8. Friendly / Casual
  if (
    /\b(?:hi|hello|hey|how\s+are\s+you|what's\s+up|nice\s+to|buddy|friend|good\s+morning|good\s+evening|good\s+afternoon|chat\s+with\s+you)\b/i.test(lower)
  ) {
    return TONES.FRIENDLY;
  }

  // Default
  return TONES.NEUTRAL;
};

/**
 * Analyze the confidence level of a given text.
 * @param {string} text - User message text
 * @param {string} tone - Detected tone
 * @returns {{ level: string, advice: string }}
 */
const detectConfidence = (text, tone) => {
  if (!text || typeof text !== 'string') {
    return {
      level: CONFIDENCE_LEVELS.MEDIUM,
      advice: "Good start! Keep expressing your ideas in full sentences to build natural fluency."
    };
  }

  const lower = text.toLowerCase().trim();

  // 1. Low Confidence Signals
  const hasLowMarkers =
    /\b(?:i\s+don't\s+know\s+if\s+i\s+can|i\s+dont\s+know\s+if\s+i\s+can|can't\s+speak|cannot\s+speak|my\s+english\s+is\s+(?:bad|poor|weak|terrible)|afraid\s+of|scared\s+to|bhiti\s+vat\w*|bheeti|ghabrayla|i\s+make\s+(?:too\s+many\s+)?mistakes|feel\s+(?:shy|nervous|awkward)|kahi\s+yet\s+nahi|samjat\s+nahi)\b/i.test(lower) ||
    (tone === TONES.NERVOUS) ||
    (/in\s+front\s+of\s+(?:everyone|people|crowd|audience)/i.test(lower) && /don't\s+know|afraid|scared|nervous/i.test(lower));

  if (hasLowMarkers) {
    return {
      level: CONFIDENCE_LEVELS.LOW,
      advice: "Every mistake is proof you're learning! Take a slow breath and speak one simple sentence at a time—you're doing great."
    };
  }

  // 2. High Confidence Signals
  const hasHighMarkers =
    /\b(?:i\s+think\s+i\s+can\s+(?:speak|do|give|present)|i\s+can\s+speak\s+english\s+confidently|i\s+am\s+confident|i\s+can\s+do\s+(?:this|it)|i\s+prepared\s+well|i\s+believe\s+in|definitely|absolutely|ready\s+to\s+speak|excited\s+to\s+share)\b/i.test(lower) ||
    (tone === TONES.POSITIVE && /\b(?:confident|confidently|i\s+can|i\s+will|ready)\b/i.test(lower)) ||
    (tone === TONES.EXCITED && !/\b(?:doubt|worry|fear|scared)\b/i.test(lower));

  if (hasHighMarkers) {
    return {
      level: CONFIDENCE_LEVELS.HIGH,
      advice: "Great confidence! You communicated your idea clearly and assertively."
    };
  }

  // 3. Medium Confidence (Default for standard communication)
  return {
    level: CONFIDENCE_LEVELS.MEDIUM,
    advice: "Good effort! Keep sharing your thoughts in complete sentences to feel even more natural."
  };
};

/**
 * Main Tone & Confidence Analyzer
 * @param {string} text - User message
 * @param {object} context - Optional conversation context
 * @returns {{ tone: string, confidence: string, advice: string }}
 */
const analyzeToneAndConfidence = (text, context = {}) => {
  const tone = detectTone(text);
  const confidence = detectConfidence(text, tone);

  return {
    tone,
    confidence: confidence.level,
    advice: confidence.advice
  };
};

module.exports = {
  TONES,
  CONFIDENCE_LEVELS,
  detectTone,
  detectConfidence,
  analyzeToneAndConfidence
};
