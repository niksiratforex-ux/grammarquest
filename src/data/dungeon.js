// 🧙‍♂️ Grammar Dungeon — Monsters, Floors, and Grammar Challenges

export const DUNGEON_FLOORS = [
  {
    id: 1,
    name: "جنگل گمشده",
    emoji: "🌲",
    description: "جنگلی تاریک پر از موجودات عجیب...",
    monsters: [
      { name: "Wolf Pup", emoji: "🐺", hp: 30, attack: 5, xpReward: 15, coinReward: 8 },
      { name: "Forest Bat", emoji: "🦇", hp: 20, attack: 3, xpReward: 10, coinReward: 5 },
    ],
    boss: { name: "Forest Guardian", emoji: "🌳", hp: 80, attack: 12, xpReward: 50, coinReward: 30 },
    grammarTopics: ["present_simple", "articles", "plurals"],
  },
  {
    id: 2,
    name: "غار خفاش‌ها",
    emoji: "🦇",
    description: "غاری تاریک با صداهای وحشتناک...",
    monsters: [
      { name: "Cave Spider", emoji: "🕷️", hp: 40, attack: 8, xpReward: 20, coinReward: 12 },
      { name: "Stone Golem", emoji: "🗿", hp: 55, attack: 10, xpReward: 25, coinReward: 15 },
    ],
    boss: { name: "Cave Dragon", emoji: "🐲", hp: 120, attack: 18, xpReward: 80, coinReward: 50 },
    grammarTopics: ["past_simple", "prepositions", "comparatives"],
  },
  {
    id: 3,
    name: "قلعه طلسم‌شده",
    emoji: "🏰",
    description: "قلعه‌ای باستانی پر از جادو و رمز و راز...",
    monsters: [
      { name: "Ghost Knight", emoji: "👻", hp: 65, attack: 14, xpReward: 30, coinReward: 20 },
      { name: "Shadow Mage", emoji: "🧙", hp: 50, attack: 18, xpReward: 35, coinReward: 22 },
    ],
    boss: { name: "Dark Sorcerer", emoji: "🧛", hp: 180, attack: 25, xpReward: 120, coinReward: 80 },
    grammarTopics: ["present_perfect", "conditionals", "passive_voice"],
  },
  {
    id: 4,
    name: "آتشفشان سرخ",
    emoji: "🌋",
    description: "گدازه‌های داغ و هوای سمی...",
    monsters: [
      { name: "Lava Elemental", emoji: "🔥", hp: 80, attack: 20, xpReward: 40, coinReward: 28 },
      { name: "Magma Worm", emoji: "🪱", hp: 70, attack: 16, xpReward: 35, coinReward: 25 },
    ],
    boss: { name: "Volcanic Titan", emoji: "👹", hp: 250, attack: 35, xpReward: 180, coinReward: 120 },
    grammarTopics: ["future_forms", "reported_speech", "relative_clauses"],
  },
  {
    id: 5,
    name: "آسمان‌های نهم",
    emoji: "☁️",
    description: "بالاترین سطح — فقط قهرمانان واقعی به اینجا می‌رسن...",
    monsters: [
      { name: "Storm Phoenix", emoji: "🦅", hp: 100, attack: 25, xpReward: 50, coinReward: 35 },
      { name: "Thunder Giant", emoji: "⚡", hp: 120, attack: 30, xpReward: 60, coinReward: 40 },
    ],
    boss: { name: "Grammar Overlord", emoji: "👑", hp: 400, attack: 45, xpReward: 300, coinReward: 200 },
    grammarTopics: ["subjunctive", "inversion", "cleft_sentences"],
  },
];

// Grammar questions pool — each has topic, question, options, correct answer
export const GRAMMAR_QUESTIONS = {
  present_simple: [
    { q: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes" },
    { q: "They ___ football on Fridays.", options: ["plays", "play", "playing", "played"], answer: "play" },
    { q: "He ___ not like coffee.", options: ["do", "does", "is", "has"], answer: "does" },
    { q: "___ you speak English?", options: ["Does", "Do", "Is", "Are"], answer: "Do" },
    { q: "The sun ___ in the east.", options: ["rise", "rises", "rising", "rose"], answer: "rises" },
  ],
  articles: [
    { q: "I saw ___ elephant at the zoo.", options: ["a", "an", "the", "—"], answer: "an" },
    { q: "___ moon is bright tonight.", options: ["A", "An", "The", "—"], answer: "The" },
    { q: "She is ___ honest person.", options: ["a", "an", "the", "—"], answer: "an" },
    { q: "I need ___ glass of water.", options: ["a", "an", "the", "—"], answer: "a" },
  ],
  plurals: [
    { q: "What is the plural of 'child'?", options: ["childs", "children", "childes", "childern"], answer: "children" },
    { q: "There are three ___ on the table.", options: ["knife", "knifes", "knives", "knivs"], answer: "knives" },
    { q: "The plural of 'mouse' is ___.", options: ["mouses", "mice", "mices", "mouse"], answer: "mice" },
  ],
  past_simple: [
    { q: "I ___ to the park yesterday.", options: ["go", "went", "gone", "going"], answer: "went" },
    { q: "She ___ a beautiful song.", options: ["sings", "sang", "sung", "singing"], answer: "sang" },
    { q: "They ___ not understand the lesson.", options: ["do", "did", "was", "were"], answer: "did" },
    { q: "He ___ his homework last night.", options: ["finish", "finished", "finishing", "finishes"], answer: "finished" },
  ],
  prepositions: [
    { q: "The book is ___ the table.", options: ["on", "in", "at", "to"], answer: "on" },
    { q: "She arrived ___ the airport ___ 5 PM.", options: ["at / at", "to / in", "in / at", "at / in"], answer: "at / at" },
    { q: "He lives ___ London.", options: ["in", "at", "on", "to"], answer: "in" },
  ],
  comparatives: [
    { q: "This book is ___ than that one.", options: ["interesting", "more interesting", "most interesting", "interestinger"], answer: "more interesting" },
    { q: "She is the ___ girl in the class.", options: ["tall", "taller", "tallest", "most tall"], answer: "tallest" },
    { q: "My car is ___ than yours.", options: ["fast", "faster", "fastest", "more fast"], answer: "faster" },
  ],
  present_perfect: [
    { q: "I ___ never ___ to Paris.", options: ["have / been", "has / been", "had / been", "was / been"], answer: "have / been" },
    { q: "She ___ already ___ her homework.", options: ["has / finished", "have / finished", "had / finish", "is / finish"], answer: "has / finished" },
    { q: "___ you ever ___ sushi?", options: ["Have / eaten", "Has / eaten", "Did / eat", "Do / eat"], answer: "Have / eaten" },
  ],
  conditionals: [
    { q: "If it rains, I ___ at home.", options: ["stay", "will stay", "stayed", "would stay"], answer: "will stay" },
    { q: "If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], answer: "were" },
    { q: "She would have passed if she ___ harder.", options: ["study", "studied", "had studied", "has studied"], answer: "had studied" },
  ],
  passive_voice: [
    { q: "The cake ___ by my mom.", options: ["was made", "is make", "was make", "made"], answer: "was made" },
    { q: "English ___ in many countries.", options: ["speaks", "is spoken", "is speak", "spoke"], answer: "is spoken" },
    { q: "The letter ___ yesterday.", options: ["was sent", "is sent", "sent", "is sending"], answer: "was sent" },
  ],
  future_forms: [
    { q: "I think it ___ tomorrow.", options: ["will rain", "is raining", "rains", "rained"], answer: "will rain" },
    { q: "Look at those clouds! It ___.", options: ["will rain", "is going to rain", "rains", "rained"], answer: "is going to rain" },
    { q: "The train ___ at 6 PM.", options: ["leaves", "will leave", "is leaving", "left"], answer: "leaves" },
  ],
  reported_speech: [
    { q: "He said he ___ tired.", options: ["is", "was", "has been", "be"], answer: "was" },
    { q: "She told me she ___ come.", options: ["will", "would", "can", "is"], answer: "would" },
  ],
  relative_clauses: [
    { q: "The man ___ lives next door is a doctor.", options: ["which", "who", "whose", "whom"], answer: "who" },
    { q: "The book ___ I bought is great.", options: ["who", "whose", "which", "whom"], answer: "which" },
  ],
  subjunctive: [
    { q: "I suggest he ___ earlier.", options: ["comes", "come", "came", "coming"], answer: "come" },
    { q: "It is essential she ___ on time.", options: ["is", "be", "was", "being"], answer: "be" },
  ],
  inversion: [
    { q: "Never ___ such a beautiful sunset.", options: ["I saw", "have I seen", "I have seen", "did I saw"], answer: "have I seen" },
    { q: "Not only ___ fast, but also smart.", options: ["he is", "is he", "he was", "was he"], answer: "is he" },
  ],
  cleft_sentences: [
    { q: "It was John ___ the window.", options: ["break", "broke", "breaking", "breaks"], answer: "broke" },
    { q: "What I need ___ a good rest.", options: ["is", "are", "was", "be"], answer: "is" },
  ],
};

export function getRandomQuestion(topic) {
  const pool = GRAMMAR_QUESTIONS[topic];
  if (!pool || pool.length === 0) return null;
  const q = pool[Math.floor(Math.random() * pool.length)];
  // Shuffle options
  const shuffled = [...q.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { ...q, options: shuffled };
}

export function getRandomMonster(floorIndex) {
  const floor = DUNGEON_FLOORS[floorIndex];
  if (!floor) return null;
  const monster = floor.monsters[Math.floor(Math.random() * floor.monsters.length)];
  return { ...monster, floor: floor.id, floorName: floor.name };
}

export function getBoss(floorIndex) {
  const floor = DUNGEON_FLOORS[floorIndex];
  if (!floor) return null;
  return { ...floor.boss, floor: floor.id, floorName: floor.name };
}
