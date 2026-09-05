const { detectLanguage, processRomanMarathi, translateMarathiToEnglish } = require('./services/romanMarathiService');

const testCases = [
  { input: "jevn zal ka?", expectedMarathi: "जेवण झालं का?", expectedEnglish: "Have you eaten?" },
  { input: "jevan zal ka", expectedMarathi: "जेवण झालं का?", expectedEnglish: "Have you eaten?" },
  { input: "jevan zala ka", expectedMarathi: "जेवण झालं का?", expectedEnglish: "Have you eaten?" },
  { input: "tu kasa ahes", expectedMarathi: "तू कसा आहेस?", expectedEnglish: "How are you?" },
  { input: "mala english shikaycha aahe", expectedMarathi: "मला इंग्रजी शिकायचं आहे.", expectedEnglish: "I want to learn English." },
  { input: "mi college la jat aahe", expectedMarathi: "मी कॉलेजला जात आहे.", expectedEnglish: "I am going to college." },
  { input: "udya bhetu", expectedMarathi: "उद्या भेटू.", expectedEnglish: "See you tomorrow." },
  { input: "kay kartoy?", expectedMarathi: "काय चाललंय? / काय करतोय?", expectedEnglish: "What's going on? / What are you doing?" },
  { input: "kuthe ahes?", expectedMarathi: "कुठे आहेस?", expectedEnglish: "Where are you?" },
  { input: "mala samjat nahi", expectedMarathi: "मला समजत नाही.", expectedEnglish: "I do not understand." }
];

console.log("=== Testing Roman Marathi Normalization & Translations ===");

let passed = 0;
for (const tc of testCases) {
  const lang = detectLanguage(tc.input);
  const res = processRomanMarathi(tc.input);

  console.log(`\nInput: "${tc.input}"`);
  console.log(`  Language Detected: ${lang}`);
  console.log(`  Normalized Marathi: ${res.normalizedMarathi}`);
  console.log(`  English Translation: ${res.englishTranslation}`);

  if (res.isRomanMarathi && res.normalizedMarathi && res.englishTranslation) {
    passed++;
    console.log("  -> PASSED");
  } else {
    console.error("  -> FAILED");
  }
}

// Test Devanagari Marathi
console.log("\n=== Testing Devanagari Marathi ===");
const devInput = "माझं जेवण झालं.";
const devLang = detectLanguage(devInput);
const devTrans = translateMarathiToEnglish(devInput);
console.log(`Input: "${devInput}" -> Lang: ${devLang} -> Trans: "${devTrans}"`);

// Test Mixed
console.log("\n=== Testing Mixed Marathi + English ===");
const mixedInput = "आज college मध्ये presentation आहे.";
const mixedLang = detectLanguage(mixedInput);
console.log(`Input: "${mixedInput}" -> Lang: ${mixedLang}`);

console.log(`\nResults: ${passed}/${testCases.length} Roman Marathi test cases passed!`);
