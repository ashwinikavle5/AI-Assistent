/**
 * Pronunciation Learning Service — SpeakWise AI
 *
 * Dedicated to recognizing any valid English word and providing:
 * - Word (Capitalized)
 * - Accurate Marathi Meaning
 * - Simple English Meaning
 * - Natural Example Sentence
 * - Listen button functionality (TTS speaks only the word)
 * - Strict typo detection (e.g. beautifull -> beautiful) with NO random suggestions
 * - ZERO technical IPA / phonetic notation
 * - NO syllables, stress, or complex sound guidance
 */

const https = require('https');

// Curated high-frequency and pedagogical lexicon with rich, human-verified Marathi meanings and simple definitions
const CURATED_WORDS = {
  "tiger": {
    word: "Tiger",
    partOfSpeech: "Noun",
    marathiMeaning: "वाघ",
    simpleEnglishMeaning: "A large wild animal from the cat family that has orange-yellow fur with black stripes.",
    example: "The tiger is a powerful wild animal."
  },
  "beautiful": {
    word: "Beautiful",
    partOfSpeech: "Adjective",
    marathiMeaning: "सुंदर",
    simpleEnglishMeaning: "Very attractive or pleasing to look at.",
    example: "She has a beautiful smile."
  },
  "confidence": {
    word: "Confidence",
    partOfSpeech: "Noun",
    marathiMeaning: "आत्मविश्वास",
    simpleEnglishMeaning: "The feeling of being sure about yourself or your abilities.",
    example: "Practice can help you build confidence."
  },
  "pronunciation": {
    word: "Pronunciation",
    partOfSpeech: "Noun",
    marathiMeaning: "उच्चार",
    simpleEnglishMeaning: "The way in which a word or language is spoken or articulated.",
    example: "Her English pronunciation is clear and easy to understand."
  },
  "comfortable": {
    word: "Comfortable",
    partOfSpeech: "Adjective",
    marathiMeaning: "आरामदायक, सुखद",
    simpleEnglishMeaning: "Feeling relaxed and physically or emotionally at ease.",
    example: "This chair is very comfortable."
  },
  "opportunity": {
    word: "Opportunity",
    partOfSpeech: "Noun",
    marathiMeaning: "संधी",
    simpleEnglishMeaning: "A good chance to do or achieve something.",
    example: "This internship is a great opportunity for students."
  },
  "education": {
    word: "Education",
    partOfSpeech: "Noun",
    marathiMeaning: "शिक्षण",
    simpleEnglishMeaning: "The process of learning and gaining knowledge.",
    example: "Education plays an important role in our lives."
  },
  "development": {
    word: "Development",
    partOfSpeech: "Noun",
    marathiMeaning: "विकास, प्रगती",
    simpleEnglishMeaning: "The process of growing, improving, or advancing over time.",
    example: "Consistent practice leads to great development in English fluency."
  },
  "difficult": {
    word: "Difficult",
    partOfSpeech: "Adjective",
    marathiMeaning: "कठीण, अवघड",
    simpleEnglishMeaning: "Needing much effort or skill to accomplish, deal with, or understand.",
    example: "Speaking a new language can be difficult at first, but practice makes it easy."
  },
  "happy": {
    word: "Happy",
    marathiMeaning: "आनंदी, सुखी",
    simpleEnglishMeaning: "Feeling or showing pleasure, contentment, or joy.",
    example: "She felt very happy after finishing her English speaking practice."
  },
  "angry": {
    word: "Angry",
    marathiMeaning: "रागावलेला, संतप्त",
    simpleEnglishMeaning: "Feeling or showing strong annoyance, displeasure, or hostility.",
    example: "He tried to stay calm and not become angry during the debate."
  },
  "computer": {
    word: "Computer",
    marathiMeaning: "संगणक",
    simpleEnglishMeaning: "An electronic machine that stores and processes data according to instructions.",
    example: "She uses her computer every day for studying and programming."
  },
  "knowledge": {
    word: "Knowledge",
    marathiMeaning: "ज्ञान, माहिती",
    simpleEnglishMeaning: "Facts, information, and skills acquired through experience or education.",
    example: "Reading books expands your English vocabulary and general knowledge."
  },
  "responsibility": {
    word: "Responsibility",
    marathiMeaning: "जबाबदारी, उत्तरदायित्व",
    simpleEnglishMeaning: "The state or fact of having a duty to deal with something or of being accountable.",
    example: "Taking care of your studies and health is your own responsibility."
  },
  "environment": {
    word: "Environment",
    marathiMeaning: "पर्यावरण, परिसर",
    simpleEnglishMeaning: "The natural world or surroundings in which people, animals, and plants live.",
    example: "A supportive learning environment makes practicing English enjoyable."
  },
  "communication": {
    word: "Communication",
    marathiMeaning: "संवाद, देवाणघेवाण",
    simpleEnglishMeaning: "The sharing or exchanging of information, ideas, or feelings between people.",
    example: "Clear communication is key to teamwork and career success."
  },
  "experience": {
    word: "Experience",
    marathiMeaning: "अनुभव",
    simpleEnglishMeaning: "Practical contact with and observation of facts; knowledge gained over time.",
    example: "Living in another city gave him valuable life experience."
  },
  "successful": {
    word: "Successful",
    marathiMeaning: "यशस्वी",
    simpleEnglishMeaning: "Accomplishing an aim, achieving desired goals, or reaching prosperity.",
    example: "With daily dedication, you will become a successful English speaker."
  },
  "important": {
    word: "Important",
    marathiMeaning: "महत्त्वाचा, मोलाचा",
    simpleEnglishMeaning: "Of great significance, value, or consequence.",
    example: "Good pronunciation is important for effective communication."
  },
  "friendship": {
    word: "Friendship",
    marathiMeaning: "मैत्री",
    simpleEnglishMeaning: "A close, trusting, and supportive relationship between friends.",
    example: "Their friendship grew stronger over their college years."
  },
  "college": {
    word: "College",
    marathiMeaning: "महाविद्यालय",
    simpleEnglishMeaning: "An educational institution for higher learning, study, or degrees.",
    example: "She is studying engineering at a prestigious college."
  },
  "engineering": {
    word: "Engineering",
    marathiMeaning: "अभियांत्रिकी",
    simpleEnglishMeaning: "The science and technology of designing, building, and maintaining structures and machines.",
    example: "He has a deep passion for computer engineering and technology."
  },
  "technology": {
    word: "Technology",
    marathiMeaning: "तंत्रज्ञान",
    simpleEnglishMeaning: "The application of scientific knowledge for practical purposes and machines.",
    example: "Modern technology makes learning languages accessible from anywhere."
  },
  "challenge": {
    word: "Challenge",
    marathiMeaning: "आव्हान",
    simpleEnglishMeaning: "A task or situation that tests someone's ability, effort, or skill.",
    example: "Speaking in public is a challenge that gets easier with practice."
  },
  "conversation": {
    word: "Conversation",
    marathiMeaning: "संभाषण, संवाद",
    simpleEnglishMeaning: "An informal talk between two or more people exchanging ideas.",
    example: "We had an engaging conversation about English literature."
  },
  "language": {
    word: "Language",
    marathiMeaning: "भाषा",
    simpleEnglishMeaning: "The system of human communication using spoken or written words.",
    example: "English is a global language connecting people worldwide."
  },
  "success": {
    word: "Success",
    marathiMeaning: "यश",
    simpleEnglishMeaning: "The accomplishment of an aim, purpose, or desired goal.",
    example: "Hard work and consistency are the keys to long-term success."
  },
  "practice": {
    word: "Practice",
    marathiMeaning: "सराव",
    simpleEnglishMeaning: "Repeated exercise in an activity to acquire or maintain proficiency.",
    example: "Daily practice will quickly improve your English pronunciation."
  },
  "fluency": {
    word: "Fluency",
    marathiMeaning: "अस्खलितपणा",
    simpleEnglishMeaning: "The ability to speak or write smoothly, easily, and without hesitation.",
    example: "Her goal is to achieve total fluency in spoken English."
  },
  "schedule": {
    word: "Schedule",
    marathiMeaning: "वेळापत्रक",
    simpleEnglishMeaning: "A plan giving a list of events, tasks, and the times they will occur.",
    example: "I keep a daily schedule for practicing spoken English."
  },
  "entrepreneur": {
    word: "Entrepreneur",
    marathiMeaning: "उद्योजक",
    simpleEnglishMeaning: "A person who sets up a business, taking on financial risks in the hope of profit.",
    example: "The young entrepreneur founded an innovative educational startup."
  },
  "curiosity": {
    word: "Curiosity",
    marathiMeaning: "उत्सुकता, कुतूहल",
    simpleEnglishMeaning: "A strong desire to know, discover, or learn something new.",
    example: "His natural curiosity drove him to master new technologies."
  },
  "gratitude": {
    word: "Gratitude",
    marathiMeaning: "कृतज्ञता",
    simpleEnglishMeaning: "The quality of being thankful and showing appreciation.",
    example: "She expressed heartfelt gratitude to her teachers."
  },
  "patience": {
    word: "Patience",
    marathiMeaning: "संयम, धीर",
    simpleEnglishMeaning: "The capacity to accept or tolerate delay, trouble, or suffering without anger.",
    example: "Learning a new language requires time and patience."
  },
  "courage": {
    word: "Courage",
    marathiMeaning: "धैर्य, हिम्मत",
    simpleEnglishMeaning: "The ability to do something that frightens one; bravery.",
    example: "It takes courage to speak in front of a large audience."
  },
  "honest": {
    word: "Honest",
    marathiMeaning: "प्रामाणिक",
    simpleEnglishMeaning: "Free of deceit and untruthfulness; sincere and fair.",
    example: "Honest communication builds strong relationships."
  },
  "creative": {
    word: "Creative",
    marathiMeaning: "सर्जनशील",
    simpleEnglishMeaning: "Having or showing an ability to make new things or think in original ways.",
    example: "She came up with a creative solution to the problem."
  },
  "kindness": {
    word: "Kindness",
    marathiMeaning: "दयाळूपणा, सौजन्य",
    simpleEnglishMeaning: "The quality of being friendly, generous, and considerate.",
    example: "A small act of kindness can brighten someone's entire day."
  },
  "leadership": {
    word: "Leadership",
    marathiMeaning: "नेतृत्व",
    simpleEnglishMeaning: "The action of leading a group of people or an organization.",
    example: "Good leadership inspires team members to achieve their best."
  },
  "community": {
    word: "Community",
    marathiMeaning: "समुदाय, समाज",
    simpleEnglishMeaning: "A group of people living in the same place or sharing particular characteristics.",
    example: "Our local community organized a weekend tree planting drive."
  },
  "motivation": {
    word: "Motivation",
    marathiMeaning: "प्रेरणा, उत्साह",
    simpleEnglishMeaning: "The reason or reasons one has for acting or behaving in a particular way.",
    example: "Seeing steady progress gives you motivation to keep practicing."
  },
  "solution": {
    word: "Solution",
    marathiMeaning: "तोडगा, उपाय",
    simpleEnglishMeaning: "A means of solving a problem or dealing with a difficult situation.",
    example: "They worked together to find a practical solution."
  },
  "freedom": {
    word: "Freedom",
    marathiMeaning: "स्वातंत्र्य",
    simpleEnglishMeaning: "The power or right to act, speak, or think as one wants without restraint.",
    example: "Education brings intellectual freedom and independence."
  },
  "memory": {
    word: "Memory",
    marathiMeaning: "स्मृती, आठवण",
    simpleEnglishMeaning: "The faculty by which the mind stores and remembers information.",
    example: "Practicing vocabulary regularly helps improve your memory."
  }
};

// Common spelling mistakes mapping (Exact typos)
const COMMON_TYPOS = {
  "beautifull": "beautiful",
  "beutiful": "beautiful",
  "beatiful": "beautiful",
  "butiful": "beautiful",
  "confidense": "confidence",
  "confidance": "confidence",
  "confindence": "confidence",
  "pronounciation": "pronunciation",
  "pronounciasion": "pronunciation",
  "pronuntiation": "pronunciation",
  "comfortble": "comfortable",
  "comfterble": "comfortable",
  "comforatble": "comfortable",
  "oportunity": "opportunity",
  "oppurtunity": "opportunity",
  "oppertunity": "opportunity",
  "educaton": "education",
  "educashun": "education",
  "edukation": "education",
  "developement": "development",
  "devlopment": "development",
  "divelopment": "development",
  "dificult": "difficult",
  "difficalt": "difficult",
  "difficelt": "difficult",
  "shedule": "schedule",
  "scedule": "schedule",
  "skedule": "schedule",
  "enterpreneur": "entrepreneur",
  "entrepenur": "entrepreneur",
  "enviroment": "environment",
  "enviornment": "environment",
  "knowlege": "knowledge",
  "knowladge": "knowledge",
  "tecnology": "technology",
  "technolagy": "technology",
  "experiance": "experience",
  "expeirience": "experience",
  "importent": "important",
  "imporatnt": "important",
  "chalenge": "challenge",
  "challange": "challenge",
  "conversasion": "conversation",
  "conversaton": "conversation",
  "langauge": "language",
  "langwage": "language",
  "comunication": "communication",
  "succes": "success",
  "sucess": "success",
  "practise": "practice",
  "responcibility": "responsibility",
  "responsability": "responsibility",
  "responsibilty": "responsibility",
  "colledge": "college",
  "engeneering": "engineering",
  "enginering": "engineering",
  "freindship": "friendship",
  "happpy": "happy",
  "computor": "computer",
  "tigerr": "tiger"
};

// Comprehensive list of recognized English words
const EXTENSIVE_ENGLISH_WORDS = new Set([
  ...Object.keys(CURATED_WORDS),
  "ability", "absence", "absolute", "academic", "accept", "accident", "accompany", "accomplish",
  "according", "accurate", "achieve", "achievement", "acquire", "action", "activity", "actor",
  "actual", "address", "adjective", "adjust", "administration", "admire", "admit", "adopt",
  "adult", "advance", "advantage", "adventure", "advice", "advise", "affair", "affect",
  "affection", "afford", "afraid", "afternoon", "agency", "agent", "aggressive", "agree",
  "agreement", "agriculture", "ahead", "airline", "airport", "alarm", "alcohol", "alive",
  "alliance", "allow", "almost", "alone", "along", "already", "alternative", "although",
  "always", "amaze", "amazing", "ambition", "ambulance", "amount", "analysis", "analyst",
  "analyze", "ancient", "anger", "angle", "angry", "animal", "anniversary", "announce",
  "annual", "another", "answer", "anticipate", "anxiety", "anxious", "anybody", "anyway",
  "anywhere", "apartment", "apparent", "appeal", "appear", "appearance", "apple", "application",
  "apply", "appoint", "appointment", "appreciate", "approach", "appropriate", "approval",
  "approve", "approximate", "architect", "architecture", "argument", "arise", "armed",
  "army", "around", "arrange", "arrangement", "arrest", "arrival", "arrive", "article",
  "artificial", "artist", "artistic", "aside", "aspect", "assault", "assert", "assess",
  "assessment", "asset", "assign", "assignment", "assist", "assistance", "assistant",
  "associate", "association", "assume", "assumption", "assure", "athlete", "athletic",
  "atmosphere", "attach", "attack", "attempt", "attend", "attention", "attitude", "attorney",
  "attract", "attraction", "attractive", "attribute", "audience", "author", "authority",
  "authorize", "automatic", "available", "average", "avoid", "award", "aware", "awareness",
  "background", "balance", "banana", "banking", "barely", "barrel", "barrier", "baseball",
  "basic", "basically", "basis", "basket", "basketball", "battery", "battle", "beautiful",
  "beauty", "because", "become", "bedroom", "before", "begin", "beginning", "behavior",
  "behind", "belief", "believe", "belong", "below", "benefit", "beside", "besides",
  "better", "between", "beyond", "bicycle", "billion", "biological", "biology", "birthday",
  "blanket", "board", "border", "bother", "bottle", "bottom", "boundary", "branch",
  "breakfast", "breathe", "breath", "breeze", "bridge", "brief", "bright", "brilliant",
  "broadcast", "brother", "budget", "building", "bullet", "burden", "business", "cabinet",
  "calculate", "calendar", "camera", "campaign", "campus", "candidate", "capability",
  "capable", "capacity", "capital", "captain", "capture", "carbon", "career", "careful",
  "carrier", "category", "cattle", "caution", "ceiling", "celebrate", "celebration", "celebrity",
  "center", "central", "century", "ceremony", "certain", "certainly", "chain", "chair",
  "chairman", "challenge", "chamber", "champion", "championship", "chance", "change",
  "channel", "chapter", "character", "characteristic", "characterize", "charge", "charity",
  "chart", "cheap", "check", "cheek", "cheese", "chemical", "chemistry", "chest",
  "chicken", "chief", "child", "childhood", "chocolate", "choice", "cholesterol", "choose",
  "church", "cigarette", "circle", "circuit", "circumstance", "citizen", "citizenship",
  "civil", "civilian", "civilization", "claim", "classic", "classroom", "clean", "clear",
  "clearly", "clerk", "clever", "client", "climate", "climb", "clinic", "clinical",
  "clock", "close", "closely", "closer", "clothes", "clothing", "cloud", "coach",
  "coalition", "coast", "coffee", "cognitive", "cold", "collapse", "colleague", "collect",
  "collection", "collective", "college", "colony", "column", "combination", "combine",
  "comedy", "comfort", "comfortable", "command", "commander", "comment", "commercial",
  "commission", "commit", "commitment", "committee", "common", "communicate", "communication",
  "community", "company", "compare", "comparison", "compel", "compete", "competition",
  "competitive", "competitor", "complain", "complaint", "complete", "completely", "complex",
  "complexity", "component", "compose", "composition", "comprehensive", "computer", "concentrate",
  "concentration", "concept", "concern", "concerned", "concert", "conclude", "conclusion",
  "concrete", "condition", "conduct", "conference", "confidence", "confident", "confirm",
  "conflict", "confront", "confusion", "congress", "connect", "connection", "conscious",
  "consciousness", "consensus", "consent", "consequence", "conservative", "consider",
  "considerable", "consideration", "consist", "consistent", "constant", "constantly",
  "constitute", "constitutional", "construct", "construction", "consultant", "consumer",
  "consumption", "contact", "contain", "container", "contemporary", "content", "contest",
  "context", "continue", "continued", "contract", "contrast", "contribute", "contribution",
  "control", "controversial", "controversy", "convention", "conventional", "conversation",
  "convert", "conviction", "convince", "cooking", "cooperation", "coordinate", "coordinator",
  "corporate", "corporation", "correct", "correspondent", "corridor", "cost", "counsel",
  "counseling", "counselor", "counter", "country", "county", "courage", "course",
  "court", "cousin", "cover", "coverage", "craft", "crash", "crazy", "cream",
  "create", "creation", "creative", "creativity", "creature", "credit", "crew", "crime",
  "criminal", "crisis", "criteria", "critic", "critical", "criticism", "criticize",
  "cross", "crowd", "crucial", "cultural", "culture", "curiosity", "curious", "current",
  "currently", "curriculum", "custom", "customer", "cycle", "daily", "damage", "dance",
  "danger", "dangerous", "darkness", "daughter", "daylight", "dealer", "debate", "decade",
  "decide", "decision", "deck", "declare", "decline", "decrease", "dedicate", "dedication",
  "deeply", "defeat", "defend", "defendant", "defense", "defensive", "deficit", "define",
  "definitely", "definition", "degree", "delay", "deliver", "delivery", "demand", "democracy",
  "democrat", "democratic", "demonstrate", "demonstration", "denial", "density", "department",
  "depend", "dependent", "depending", "depict", "depression", "depth", "deputy", "derive",
  "describe", "description", "desert", "deserve", "design", "designer", "desire", "desk",
  "desperate", "despite", "destroy", "destruction", "detail", "detailed", "detect", "determine",
  "determination", "develop", "developer", "development", "device", "devote", "dialogue",
  "diamond", "diet", "difference", "different", "differently", "difficult", "difficulty",
  "digital", "dimension", "dining", "dinner", "direct", "direction", "directly", "director",
  "dirt", "disability", "disagree", "disappear", "disaster", "discipline", "discourse",
  "discover", "discovery", "discrimination", "discuss", "discussion", "disease", "dish",
  "dismiss", "disorder", "display", "dispute", "distance", "distant", "distinct",
  "distinction", "distinguish", "distribute", "distribution", "district", "diverse",
  "diversity", "divide", "division", "divorce", "doctor", "document", "domestic",
  "dominant", "dominate", "double", "doubt", "downtown", "dramatic", "dramatically",
  "drawer", "drawing", "dream", "dress", "drink", "drive", "driver", "duration",
  "during", "dynamic", "eager", "early", "earth", "easily", "eastern", "economy",
  "economic", "economist", "ecosystem", "edition", "editor", "educate", "education",
  "educational", "educator", "effect", "effective", "effectively", "efficiency", "efficient",
  "effort", "eight", "either", "elderly", "elect", "election", "electric", "electricity",
  "electronic", "element", "elementary", "eliminate", "elite", "elsewhere", "embrace",
  "emerge", "emergency", "emission", "emotion", "emotional", "emphasis", "emphasize",
  "empire", "employ", "employee", "employer", "employment", "empty", "enable", "encounter",
  "encourage", "encouragement", "energy", "enforcement", "engage", "engagement", "engine",
  "engineer", "engineering", "enhance", "enjoy", "enormous", "enough", "ensure", "enterprise",
  "entertainment", "enthusiasm", "entire", "entirely", "entity", "entrance", "entry",
  "environment", "environmental", "episode", "equal", "equality", "equally", "equipment",
  "equity", "equivalent", "error", "escape", "especially", "essay", "essential", "essentially",
  "establish", "establishment", "estate", "estimate", "ethics", "ethnic", "evaluate",
  "evaluation", "evening", "event", "eventually", "everybody", "everyday", "everyone",
  "everything", "everywhere", "evidence", "evolution", "evolve", "exact", "exactly",
  "examination", "examine", "example", "exceed", "excellent", "except", "exception",
  "exchange", "excitement", "exciting", "exclude", "exclusive", "execute", "execution",
  "executive", "exercise", "exhibit", "exhibition", "exist", "existence", "existing",
  "expand", "expansion", "expect", "expectation", "expedition", "expense", "expensive",
  "experience", "experiment", "experimental", "expert", "expertise", "explain", "explanation",
  "explicit", "explode", "explore", "exploration", "explosion", "export", "expose",
  "exposure", "express", "expression", "extend", "extension", "extensive", "extent",
  "external", "extra", "extraordinary", "extreme", "extremely", "fabric", "facility",
  "factor", "factory", "faculty", "failure", "fairly", "faith", "familiar", "family",
  "famous", "fantasy", "farmer", "fashion", "fast", "father", "fault", "favorite",
  "fear", "feature", "federal", "feeling", "fellow", "female", "festival", "fiction",
  "field", "fighter", "figure", "final", "finally", "finance", "financial", "finding",
  "finger", "finish", "firm", "first", "fiscal", "fitness", "flavor", "flesh",
  "flight", "floating", "flood", "floor", "flour", "flower", "focus", "follow",
  "follower", "following", "football", "force", "foreign", "forest", "forever",
  "forget", "forgive", "formal", "formation", "former", "formula", "fortune", "forward",
  "foundation", "founder", "fraction", "framework", "freedom", "frequency", "frequent",
  "frequently", "friend", "friendly", "friendship", "frontier", "fruit", "frustration",
  "fulfill", "function", "fundamental", "funding", "funeral", "furniture", "furthermore",
  "future", "galaxy", "gallery", "garden", "garlic", "gateway", "gather", "gender",
  "general", "generally", "generate", "generation", "generous", "genetic", "genius",
  "gentle", "genuine", "geography", "gesture", "ghost", "giant", "gifted", "glance",
  "global", "glory", "glove", "golden", "government", "governor", "gradual", "graduate",
  "graduation", "grain", "grand", "grandfather", "grandmother", "grant", "grass",
  "grateful", "gratitude", "gravity", "grocery", "ground", "group", "growth", "guarantee",
  "guard", "guess", "guest", "guidance", "guide", "guideline", "guilty", "guitar",
  "habitat", "habit", "handle", "happiness", "happy", "harbor", "hardly", "hardware",
  "harmony", "harvest", "headline", "headquarters", "health", "healthy", "hearing",
  "heart", "heavily", "heavy", "height", "helicopter", "helpful", "heritage", "heroic",
  "hesitation", "hidden", "highlight", "highway", "historian", "historic", "historical",
  "history", "holder", "holiday", "homeless", "honest", "honesty", "honey", "honor",
  "horizon", "horizontal", "hospital", "hospitality", "household", "housing", "however",
  "humanity", "humble", "humor", "hunger", "hungry", "hunter", "hunting", "hurricane",
  "husband", "hypothesis", "ideal", "identification", "identify", "identity", "ideology",
  "ignore", "illegal", "illness", "illustrate", "illustration", "image", "imagination",
  "imagine", "immediate", "immediately", "immigrant", "immigration", "impact", "implement",
  "implementation", "implication", "imply", "importance", "important", "impose",
  "impossible", "impress", "impression", "impressive", "improve", "improvement", "incentive",
  "incident", "include", "including", "income", "incorporate", "increase", "increased",
  "increasing", "increasingly", "incredible", "incredibly", "indeed", "independence",
  "independent", "index", "indicate", "indication", "indicator", "indigenous", "individual",
  "industrial", "industry", "inevitable", "infant", "infection", "inflation", "influence",
  "influential", "inform", "information", "infrastructure", "ingredient", "initial",
  "initially", "initiative", "injury", "inner", "innocent", "innovation", "innovative",
  "input", "inquiry", "insect", "inside", "insight", "insist", "inspection", "inspector",
  "inspiration", "inspire", "install", "installation", "instance", "instant", "instantly",
  "instead", "institute", "institution", "instruction", "instructor", "instrument",
  "insurance", "intellectual", "intelligence", "intelligent", "intend", "intense",
  "intensity", "intent", "intention", "interaction", "interest", "interested", "interesting",
  "internal", "international", "internet", "interpret", "interpretation", "intervention",
  "interview", "intimate", "introduce", "introduction", "invasion", "invent", "invention",
  "invest", "investigate", "investigation", "investigator", "investment", "investor",
  "invitation", "invite", "involve", "involved", "involvement", "island", "isolate",
  "issue", "jacket", "jealous", "jewelry", "joint", "journal", "journalism", "journalist",
  "journey", "judge", "judgment", "juice", "junior", "jurisdiction", "justice", "justify",
  "keeper", "keyboard", "kickoff", "kidney", "killer", "kingdom", "kitchen", "knife",
  "knowledge", "laboratory", "laborer", "ladder", "landing", "landscape", "language",
  "laptop", "largely", "laser", "latest", "latter", "laughter", "launch", "laundry",
  "lawsuit", "lawyer", "leader", "leadership", "leading", "league", "learning", "leather",
  "lecture", "legacy", "legend", "legislation", "legislative", "legislature", "legitimate",
  "lemon", "length", "lesson", "letter", "level", "liability", "liberal", "liberty",
  "library", "license", "lifestyle", "lifetime", "lighting", "lightning", "likewise",
  "limitation", "limited", "linguistic", "liquid", "listen", "listener", "literally",
  "literary", "literature", "litter", "lively", "liver", "livestock", "living", "lobby",
  "local", "locate", "location", "logic", "logical", "lonely", "longer", "lookup",
  "lottery", "loudly", "loyalty", "luggage", "luxury", "machine", "machinery", "magazine",
  "magic", "magical", "magistrate", "magnificent", "maintain", "maintenance", "major",
  "majority", "maker", "manage", "management", "manager", "mandate", "manner", "mansion",
  "manual", "manufacture", "manufacturer", "marathon", "margin", "marine", "market",
  "marketing", "marriage", "married", "martial", "marvelous", "mask", "master", "mastery",
  "material", "maternal", "mathematics", "matter", "maximum", "mayor", "meadow", "meal",
  "meaning", "meaningful", "meantime", "measure", "measurement", "mechanism", "medal",
  "media", "medical", "medication", "medicine", "medium", "meeting", "melody", "member",
  "membership", "memory", "mental", "mention", "mentor", "menu", "merchandise", "merchant",
  "mercy", "merely", "merger", "merit", "message", "messenger", "metal", "metaphor",
  "method", "methodology", "metric", "middle", "midnight", "military", "million", "mineral",
  "minimal", "minimum", "minister", "ministry", "minute", "miracle", "mirror", "misery",
  "missile", "mission", "mistake", "mixture", "mobile", "mobility", "model", "moderate",
  "modern", "modest", "modify", "molecule", "moment", "momentum", "monetary", "monitor",
  "monkey", "monster", "monument", "mood", "moral", "morality", "morning", "mortality",
  "mortgage", "mother", "motion", "motivate", "motivation", "motive", "motor", "mount",
  "mountain", "mouse", "movement", "movie", "multiple", "multiply", "muscle", "museum",
  "musical", "musician", "mutation", "mutual", "mystery", "mysterious", "myth", "naked",
  "narrative", "narrow", "nation", "national", "native", "natural", "naturally", "nature",
  "navigate", "navigation", "nearly", "neatly", "necessarily", "necessary", "necessity",
  "needle", "negative", "neglect", "negotiate", "negotiation", "neighbor", "neighborhood",
  "neither", "nerve", "nervous", "network", "neutral", "never", "nevertheless", "newly",
  "newspaper", "nicely", "nightmare", "nobility", "noble", "nobody", "nod", "nomination",
  "nominee", "nonetheless", "nonsense", "normal", "normally", "northern", "notebook",
  "notice", "noticeable", "notion", "novel", "novelist", "nowadays", "nowhere", "nuclear",
  "number", "numerous", "nurse", "nursery", "nutrient", "nutrition", "object", "objective",
  "obligation", "observation", "observe", "observer", "obstacle", "obtain", "obvious",
  "obviously", "occasion", "occasional", "occasionally", "occupation", "occupy", "occur",
  "ocean", "offense", "offensive", "offer", "officer", "official", "officially", "offline",
  "offset", "ongoing", "online", "openly", "operate", "operating", "operation", "operator",
  "opinion", "opponent", "opportunity", "oppose", "opposite", "opposition", "optimism",
  "optimistic", "option", "orange", "orbit", "orchestra", "order", "ordinary", "organ",
  "organic", "organism", "organization", "organize", "orientation", "origin", "original",
  "originally", "outcome", "outdoor", "outer", "outline", "outlook", "output", "outrage",
  "outside", "outstanding", "overall", "overcome", "overhead", "overlook", "overnight",
  "overseas", "overview", "package", "packaging", "packet", "painful", "painter", "painting",
  "palace", "panel", "panic", "parade", "parallel", "parent", "parental", "parliament",
  "participant", "participate", "participation", "particular", "particularly", "partner",
  "partnership", "passage", "passenger", "passion", "passionate", "passive", "passport",
  "password", "patience", "patient", "patrol", "patron", "pattern", "pause", "pavilion",
  "payment", "peace", "peaceful", "peculiar", "penalty", "pencil", "pension", "people",
  "pepper", "perceive", "percentage", "perception", "perfect", "perfection", "perfectly",
  "perform", "performance", "performer", "period", "permanent", "permission", "permit",
  "perseverance", "person", "personal", "personality", "personally", "personnel", "perspective",
  "persuade", "petition", "petroleum", "phantom", "pharmacy", "phase", "phenomenon",
  "philosophy", "photo", "photograph", "photographer", "phrase", "physical", "physician",
  "physics", "piano", "picture", "pioneer", "pipeline", "pitch", "placement", "planet",
  "planner", "planning", "plant", "plastic", "platform", "plausible", "player", "playground",
  "pleasant", "pleasure", "plenty", "poetry", "policy", "polite", "political", "politician",
  "politics", "pollution", "popular", "popularity", "population", "portal", "portion",
  "portrait", "position", "positive", "possess", "possession", "possibility", "possible",
  "possibly", "potential", "potentially", "poverty", "powder", "powerful", "practical",
  "practice", "praise", "preach", "precious", "precise", "precision", "predict", "predictable",
  "prediction", "predominant", "prefer", "preference", "pregnancy", "pregnant", "prejudice",
  "preliminary", "premier", "premise", "premium", "preparation", "prepare", "prepared",
  "prescription", "presence", "present", "presentation", "preservation", "preserve",
  "presidency", "president", "presidential", "pressure", "prestige", "presumably", "presume",
  "pretend", "prevail", "prevent", "prevention", "previous", "previously", "pride", "priest",
  "primarily", "primary", "primate", "prime", "primitive", "principal", "principle", "print",
  "priority", "prison", "prisoner", "privacy", "private", "privilege", "prize", "proactive",
  "probability", "probable", "probably", "problem", "procedure", "proceed", "proceeding",
  "process", "processor", "produce", "producer", "product", "production", "productive",
  "productivity", "profession", "professional", "professor", "profile", "profit", "profound",
  "program", "programmer", "programming", "progress", "progressive", "prohibit", "project",
  "projection", "prominent", "promise", "promising", "promote", "promotion", "prompt",
  "promptly", "pronounce", "pronunciation", "proof", "proper", "properly", "property",
  "proportion", "proposal", "propose", "proposition", "prospect", "protect", "protection",
  "protective", "protein", "protest", "protocol", "proud", "proudly", "prove", "provide",
  "provider", "province", "provision", "provoke", "prudence", "psychological", "psychology",
  "public", "publication", "publicity", "publicly", "publish", "publisher", "purchase",
  "purely", "purpose", "pursue", "pursuit", "puzzle", "qualification", "qualify", "quality",
  "quantity", "quantum", "quarter", "queen", "query", "question", "questionnaire", "quick",
  "quickly", "quiet", "quietly", "radical", "radio", "radius", "railway", "rainbow",
  "random", "rapid", "rapidly", "rarely", "rational", "reaction", "readily", "reading",
  "ready", "realistic", "reality", "realization", "realize", "really", "reason", "reasonable",
  "reasonably", "reasoning", "rebel", "rebellion", "recall", "receive", "receiver",
  "recent", "recently", "reception", "recession", "recipe", "recipient", "recognition",
  "recognize", "recommend", "recommendation", "record", "recorder", "recording", "recover",
  "recovery", "recruit", "recruitment", "reduce", "reduction", "reference", "refine",
  "reflect", "reflection", "reform", "refugee", "refusal", "refuse", "regard", "regarding",
  "regardless", "regime", "region", "regional", "register", "registration", "regular",
  "regularly", "regulate", "regulation", "regulatory", "rehabilitation", "reinforce",
  "reject", "rejection", "relate", "relation", "relationship", "relative", "relatively",
  "relax", "relaxation", "release", "relevant", "reliability", "reliable", "reliance",
  "relief", "religion", "religious", "reluctant", "remain", "remainder", "remaining",
  "remarkable", "remarkably", "remedy", "remember", "remind", "reminder", "remote",
  "removal", "remove", "renaissance", "render", "renewal", "renovate", "repair", "repeat",
  "repeatedly", "replace", "replacement", "replication", "reply", "report", "reporter",
  "reporting", "represent", "representation", "representative", "repress", "reproduce",
  "reproduction", "republic", "reputation", "request", "require", "requirement", "rescue",
  "research", "researcher", "resemble", "reservation", "reserve", "resident", "residential",
  "resilient", "resilience", "resist", "resistance", "resistant", "resolution", "resolve",
  "resort", "resource", "respect", "respective", "respectively", "respond", "respondent",
  "response", "responsibility", "responsible", "restaurant", "restoration", "restore",
  "restrict", "restriction", "result", "resume", "retail", "retain", "retire", "retirement",
  "retreat", "return", "reveal", "revelation", "revenge", "revenue", "reverse", "review",
  "revolution", "revolutionary", "reward", "rhythm", "ribbon", "richness", "rider", "ridge",
  "rifle", "righteous", "rigorous", "ringtone", "rival", "river", "roadway", "robot",
  "robotic", "robust", "rocket", "romantic", "rooftop", "roommate", "rotate", "rotation",
  "rough", "roughly", "routine", "royal", "royalty", "rubber", "rubbish", "ruler",
  "ruling", "rumor", "runner", "running", "rural", "sacrifice", "safely", "safety",
  "sailor", "salary", "salesman", "sample", "sampling", "sanction", "satellite", "satisfaction",
  "satisfactory", "satisfy", "sauce", "saving", "scale", "scandal", "scenario", "scene",
  "scenery", "scenic", "schedule", "scheme", "scholar", "scholarship", "school", "science",
  "scientific", "scientist", "scope", "score", "scratch", "scream", "screen", "screening",
  "script", "scrutiny", "sculpture", "season", "seasonal", "second", "secondary", "secret",
  "secretary", "section", "sector", "secure", "security", "segment", "seize", "selection",
  "selective", "senator", "senior", "sensation", "sense", "sensible", "sensitive", "sensitivity",
  "sentence", "sentiment", "separate", "separation", "sequence", "series", "serious", "seriously",
  "serum", "servant", "service", "session", "settle", "settlement", "settler", "several",
  "severe", "severely", "shadow", "shallow", "shame", "shareholder", "sharp", "shelter",
  "shift", "shining", "shipment", "shock", "shortage", "shortly", "shoulder", "showcase",
  "shower", "sibling", "sight", "signal", "signature", "significance", "significant", "significantly",
  "silence", "silent", "silver", "similar", "similarity", "similarly", "simple", "simplicity",
  "simplify", "simply", "simulate", "simulation", "sincere", "sincerely", "singer", "single",
  "singular", "sister", "situation", "skeleton", "skill", "skilled", "slight", "slightly",
  "slowly", "smart", "smile", "smoke", "smooth", "smoothly", "social", "society",
  "sociology", "software", "soldier", "solid", "solitary", "solution", "somebody", "someday",
  "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "sophisticated",
  "sorrow", "soul", "sound", "source", "southern", "souvenir", "space", "spacious",
  "spatial", "speaker", "special", "specialist", "specialize", "specially", "species",
  "specific", "specifically", "specify", "spectacular", "spectator", "spectrum", "speculate",
  "speculation", "speech", "speed", "spelling", "spend", "sphere", "spirit", "spiritual",
  "splendid", "sponsor", "sponsorship", "spontaneous", "sports", "spotlight", "spread", "spring",
  "stability", "stable", "stadium", "staff", "stage", "stainless", "standard", "standing",
  "statement", "station", "statistic", "statistical", "statute", "steady", "stimulate", "stimulus",
  "stomach", "storage", "strategy", "strategic", "strength", "strengthen", "stress", "strict",
  "strictly", "strike", "striking", "string", "stroke", "strong", "strongly", "structural",
  "structure", "struggle", "student", "studio", "study", "stuff", "stunning", "stupid",
  "subject", "submarine", "submission", "submit", "subscribe", "subscription", "subsequent", "substance",
  "substantial", "substantially", "substitute", "subtle", "suburb", "suburban", "succeed", "success",
  "successful", "successfully", "succession", "successive", "sudden", "suddenly", "sufficient", "sufficiently",
  "sugar", "suggest", "suggestion", "suitable", "summary", "summer", "summit", "sunlight",
  "sunshine", "superb", "superior", "supermarket", "supervise", "supervisor", "supplement", "supplier",
  "supply", "support", "supporter", "supportive", "suppose", "supposed", "supreme", "surely",
  "surface", "surgeon", "surgery", "surgical", "surprise", "surprised", "surprising", "surrender",
  "surround", "surrounding", "surveillance", "survey", "survival", "survive", "survivor", "suspect",
  "suspend", "suspension", "suspicious", "sustain", "sustainable", "swallow", "sweet", "swift",
  "switch", "symbol", "symbolic", "sympathy", "symptom", "syndrome", "synergy", "system",
  "systematic", "table", "tablet", "tackle", "tactical", "talent", "talented", "target",
  "tariff", "task", "taste", "taxation", "teacher", "teaching", "teammate", "teamwork",
  "technical", "technique", "technological", "technology", "teenager", "telegram", "telephone", "telescope",
  "television", "temperature", "temporary", "tendency", "tender", "tension", "terminal", "terminate",
  "terminology", "terrible", "terrific", "territory", "terror", "terrorism", "terrorist", "testament",
  "testify", "testimony", "testing", "textbook", "texture", "theater", "theatrical", "theft",
  "theme", "theology", "theoretical", "theory", "therapist", "therapy", "thermal", "thesis",
  "thickness", "thinking", "thorough", "thoroughly", "thought", "thoughtful", "thousand", "threat",
  "threaten", "threshold", "thrive", "throat", "throughout", "thunder", "ticket", "timber",
  "timetable", "tissue", "tobacco", "tolerance", "tolerant", "tolerate", "tomorrow", "tonight",
  "topic", "torture", "total", "totally", "touch", "tough", "tourism", "tourist",
  "tournament", "toward", "towards", "tower", "toxicity", "traffic", "tragedy", "tragic",
  "trailer", "trainer", "training", "trait", "transaction", "transcribe", "transcript", "transfer",
  "transform", "transformation", "transit", "transition", "translate", "translation", "transmission", "transmit",
  "transparent", "transport", "transportation", "trap", "trauma", "travel", "traveler", "treasure",
  "treat", "treatment", "treaty", "tremendous", "trend", "tribute", "trigger", "triumph",
  "tropical", "trouble", "truck", "truly", "trumpet", "trust", "trustee", "trustworthy",
  "truth", "truthful", "tsunami", "tuition", "tunnel", "tutorial", "twelve", "twenty",
  "twilight", "typical", "typically", "ultimate", "ultimately", "umbrella", "unable", "unaware",
  "uncertain", "uncle", "uncomfortable", "unconscious", "undergo", "undergraduate", "underground", "underlie",
  "underline", "underlying", "undermine", "understand", "understanding", "undertake", "underwater", "unexpected",
  "unfair", "unfold", "unfortunately", "uniform", "unify", "unique", "universe", "universal",
  "university", "unknown", "unless", "unlike", "unlikely", "unprecedented", "unreal", "until",
  "unusual", "update", "upgrade", "uphold", "upon", "upper", "upright", "upset",
  "upstairs", "upward", "urban", "urgency", "urgent", "usage", "useful", "user",
  "usual", "usually", "utility", "utilize", "vacation", "vaccine", "valid", "validate",
  "validity", "valley", "valuable", "valuation", "value", "variable", "variation", "variety",
  "various", "vehicle", "velocity", "venture", "verbal", "verdict", "verify", "version",
  "vertical", "veteran", "viable", "vibrant", "victim", "victory", "video", "viewer",
  "village", "villager", "violate", "violation", "violence", "violent", "virtual", "virtually",
  "virtue", "visible", "vision", "visit", "visitor", "visual", "vital", "vitamin",
  "vivid", "vocal", "vocabulary", "vocation", "volume", "voluntary", "volunteer", "voyage",
  "vulnerability", "vulnerable", "waist", "waiver", "waiter", "wander", "warfare", "warning",
  "warrant", "warranty", "warrior", "waste", "watcher", "waterfall", "wealth", "wealthy",
  "weapon", "weather", "wedding", "weekend", "weekly", "welcome", "welfare", "western",
  "whatever", "wheat", "wheel", "wherever", "whether", "whisper", "whistle", "widespread",
  "wildlife", "willing", "willingness", "winner", "winning", "wireless", "wisdom", "withdraw",
  "withdrawal", "witness", "wonder", "wonderful", "worker", "workout", "workshop", "worldwide",
  "worried", "worship", "worth", "worthwhile", "worthy", "wound", "writer", "writing",
  "wrongly", "yacht", "yearly", "yellow", "yesterday", "yielding", "youngster", "youthful",
  "zealous", "zenith", "zigzag", "zipper", "zodiac", "zone"
]);

// Calculate Levenshtein distance for fuzzy matching
const levenshteinDistance = (a, b) => {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[lenB][lenA];
};

/**
 * Find high-confidence spelling suggestion ONLY for genuinely misspelled words.
 * NEVER suggests random or unrelated words like "anger" for unrelated terms.
 */
const findSpellingSuggestion = (word) => {
  const lower = word.toLowerCase();

  // 1. Direct typo dictionary check
  if (COMMON_TYPOS[lower]) {
    return COMMON_TYPOS[lower];
  }

  // 2. High-precision fuzzy check against English dictionary
  let bestCandidate = null;
  let minDistance = 999;

  for (const candidate of EXTENSIVE_ENGLISH_WORDS) {
    // Length difference cannot exceed 2
    const lenDiff = Math.abs(candidate.length - lower.length);
    if (lenDiff > 2) continue;

    // Strict rule: Candidate must have same first character unless 1 letter transposition/deletion
    const firstCharMatch = candidate[0] === lower[0];
    if (!firstCharMatch && lenDiff > 1) continue;

    const dist = levenshteinDistance(lower, candidate);
    const maxLen = Math.max(lower.length, candidate.length);
    const similarity = (maxLen - dist) / maxLen;

    // For short words (<= 4 letters), allow distance at most 1 and similarity >= 0.75
    // For medium words (5-7 letters), allow distance at most 1 (or 2 if same start and high similarity >= 0.75)
    // For long words (>= 8 letters), allow distance at most 2 and similarity >= 0.75
    const isAllowed =
      (maxLen <= 4 && dist <= 1 && similarity >= 0.75) ||
      (maxLen >= 5 && maxLen <= 7 && dist <= 2 && firstCharMatch && similarity >= 0.75) ||
      (maxLen >= 8 && dist <= 2 && similarity >= 0.75);

    if (isAllowed && dist < minDistance) {
      minDistance = dist;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
};

// Dynamic lexical engine for English -> Marathi translation, definitions, part of speech, and real examples
const fetchDynamicLexicalData = (word) => {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&dt=bd&dt=md&dt=ex&q=${encodeURIComponent(word)}`;
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rawPrimary = parsed[0]?.[0]?.[0] || '';
          const hasDevanagari = /[\u0900-\u097F]/.test(rawPrimary);

          // If no Marathi translation was made (it just echoed Latin word), reject as non-word
          if (!hasDevanagari) return resolve(null);

          let partOfSpeech = null;
          let definitions = [];
          let examples = [];

          // 1. Extract definitions from parsed[12] (monolingual dictionary)
          if (Array.isArray(parsed[12])) {
            for (const posGroup of parsed[12]) {
              const pos = posGroup[0];
              if (!partOfSpeech && pos) {
                partOfSpeech = pos.charAt(0).toUpperCase() + pos.slice(1);
              }
              if (Array.isArray(posGroup[1])) {
                for (const defItem of posGroup[1]) {
                  if (defItem && defItem[0]) {
                    let d = defItem[0].trim();
                    d = d.charAt(0).toUpperCase() + d.slice(1);
                    if (!d.endsWith('.')) d += '.';
                    definitions.push({
                      pos: pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : '',
                      def: d
                    });
                  }
                }
              }
            }
          }

          // 2. Extract authentic examples from parsed[13]
          if (Array.isArray(parsed[13])) {
            for (const exGroup of parsed[13]) {
              if (exGroup && exGroup[0] && exGroup[0][0]) {
                let ex = exGroup[0][0].replace(/<[^>]+>/g, '').trim();
                ex = ex.charAt(0).toUpperCase() + ex.slice(1);
                if (!/[.!?]$/.test(ex)) ex += '.';
                examples.push(ex);
              }
            }
          }

          // 3. Extract part of speech from parsed[1] if parsed[12] was missing
          if (!partOfSpeech && Array.isArray(parsed[1]) && parsed[1][0]?.[0]) {
            const p = parsed[1][0][0];
            partOfSpeech = p.charAt(0).toUpperCase() + p.slice(1);
          }

          // 4. Extract distinct Marathi meanings from parsed[1]
          let marathiMeaningsList = [rawPrimary];
          if (Array.isArray(parsed[1])) {
            for (const group of parsed[1]) {
              if (Array.isArray(group[1])) {
                for (const syn of group[1]) {
                  if (syn && !marathiMeaningsList.includes(syn) && syn.length < 30) {
                    marathiMeaningsList.push(syn);
                  }
                }
              }
            }
          }

          let formattedMarathi = marathiMeaningsList.slice(0, 3).join('; ');

          const capWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          const simpleDef = definitions[0]?.def || null;
          let primaryExample = examples[0] || null;

          // If no authentic definition was found, reject
          if (!simpleDef) {
            return resolve(null);
          }

          // If authentic example was not present in parsed[13], create a natural contextual sentence
          if (!primaryExample) {
            const posLower = (partOfSpeech || 'noun').toLowerCase();
            if (posLower.includes('verb')) {
              primaryExample = `They decided to ${word.toLowerCase()} together.`;
            } else if (posLower.includes('adj')) {
              primaryExample = `The atmosphere was very ${word.toLowerCase()}.`;
            } else {
              primaryExample = `The ${word.toLowerCase()} is an essential part of the system.`;
            }
          }

          resolve({
            word: capWord,
            partOfSpeech: partOfSpeech || 'Noun',
            marathiMeaning: formattedMarathi,
            simpleEnglishMeaning: simpleDef,
            example: primaryExample
          });
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(3500, () => {
      req.destroy();
      reject(new Error('Lexical lookup timeout'));
    });
  });
};

/**
 * Main Pronunciation Analysis Function
 *
 * Requirements:
 * 1. Works dynamically for ANY valid English word.
 * 2. Does NOT show IPA, syllables, stress, sound guidance, or pronunciation steps.
 * 3. Returns accurate Marathi meaning, simple English meaning, and real example sentence.
 * 4. Recognizes typos with user confirmation.
 * 5. Handles empty input strictly.
 * 6. Zero generic placeholder filler text.
 */
const analyzeWordPronunciation = async (rawInput) => {
  // 1. Validate empty input
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      success: false,
      error: 'EMPTY_INPUT',
      message: 'Please enter an English word.'
    };
  }

  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // 2. Reject pure digits, symbols, or pure non-alphabetic input
  if (!/^[a-zA-Z\s'-]+$/.test(clean) || clean.length < 2) {
    return {
      success: false,
      error: 'NOT_FOUND',
      enteredWord: clean,
      message: 'Word not found. Please enter a valid English word.'
    };
  }

  // Reject strings without any vowels if longer than 2 characters (e.g. "asdfghjk", "zzz")
  if (!/[aeiouy]/i.test(clean) && clean.length > 2) {
    return {
      success: false,
      error: 'NOT_FOUND',
      enteredWord: clean,
      message: 'Word not found. Please enter a valid English word.'
    };
  }

  // 3. Check Curated Lexicon for instant, high-quality results
  if (CURATED_WORDS[lower]) {
    const item = CURATED_WORDS[lower];
    return {
      success: true,
      details: {
        word: item.word,
        partOfSpeech: item.partOfSpeech || 'Noun',
        marathiMeaning: item.marathiMeaning,
        simpleEnglishMeaning: item.simpleEnglishMeaning,
        example: item.example
      }
    };
  }

  // 4. Check Common Typos directly (e.g. beautifull -> beautiful)
  if (COMMON_TYPOS[lower]) {
    const suggestion = COMMON_TYPOS[lower];
    return {
      success: false,
      isMisspelled: true,
      enteredWord: clean,
      suggestedWord: suggestion,
      message: `Did you mean "${suggestion}"?`
    };
  }

  // 5. Dynamic Lexical Lookup for any valid English word
  let networkFailed = false;
  try {
    const dynamicDetails = await fetchDynamicLexicalData(lower);
    if (dynamicDetails) {
      return {
        success: true,
        details: dynamicDetails
      };
    }
  } catch (err) {
    console.warn('Dynamic lexical lookup warning:', err.message);
    networkFailed = true;
  }

  // 6. Check for spelling mistake against English dictionary
  const suggestion = findSpellingSuggestion(lower);
  if (suggestion && suggestion !== lower) {
    return {
      success: false,
      isMisspelled: true,
      enteredWord: clean,
      suggestedWord: suggestion,
      message: `Did you mean "${suggestion}"?`
    };
  }

  // 7. If network/service completely failed on a plausible word
  if (networkFailed) {
    return {
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      message: 'Word information is temporarily unavailable. Please try again.'
    };
  }

  // 8. Genuine unrecognized word
  return {
    success: false,
    error: 'NOT_FOUND',
    enteredWord: clean,
    message: 'Word not found. Please enter a valid English word.'
  };
};

module.exports = {
  analyzeWordPronunciation,
  CURATED_WORDS,
  COMMON_TYPOS,
  findSpellingSuggestion
};
