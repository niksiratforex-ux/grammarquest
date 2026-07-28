# ⚔️ GrammarQuest

یه بازی آموزشی انگلیسی تلگرامی — ترکیب **نبرد لغات 1v1** و **سیاه‌گرامر RPG**

## 🎮 قابلیت‌ها

### ⚔️ Vocab Clash — نبرد لغات
- رقابت 1v1 لغات انگلیسی
- ۳ سطح سختی: آسان، متوسط، سخت
- ۵ دور سوال — هر کی بیشتر امتیاز بگیره برنده‌ست
- سیستم امتیازدهی بر اساس سرعت جواب
- XP و سکه برای برنده و بازنده

### 🧙‍♂️ Grammar Dungeon — سیاه‌گرامر RPG
- ۵ طبقه سیاه‌گرامر با هیولا و باس‌فایت
- هر حمله = یه سوال گرامری
- سوالات از topics مختلف: Present Simple تا Subjunctive
- سیستم HP، حمله، دفاع
- خرید معجون و ارتقا تجهیزات
- XP و سکه از هر هیولا

### 📊 سیستم پیشرفت
- لول‌آپ با XP
- سکه برای خرید و ارتقا
- لیدربورد و استریک
- پروفایل بازیکن

## 🚀 نصب و اجرا

```bash
# 1. نصب پکیج‌ها
npm install

# 2. تنظیم توکن ربات تلگرام
export BOT_TOKEN=your_bot_token_here

# 3. اجرا
npm start

# یا برای توسعه (auto-reload):
npm run dev
```

## 📋 دستورات ربات

| دستور | توضیح |
|---|---|
| `/start` | شروع و راهنما |
| `/clash [easy\|medium\|hard]` | نبرد لغات 1v1 |
| `/dungeon` | ورود به سیاه‌گرامر |
| `/profile` | آمار شخصی |
| `/leaderboard` | لیدربورد XP |
| `/streak` | لیدربورد استریک |
| `/heal` | درمان (+20 HP) |
| `/help` | راهنمای سریع |

## 🏗️ ساختار پروژه

```
grammarquest/
├── package.json
├── README.md
├── src/
│   ├── index.js              # نقطه ورود اصلی
│   ├── data/
│   │   ├── database.js       # SQLite database layer
│   │   ├── words.js          # بانک لغات (easy/medium/hard)
│   │   └── dungeon.js        # طبقات، هیولاها، سوالات گرامری
│   ├── handlers/
│   │   ├── clash.js          # هندلر نبرد لغات
│   │   ├── dungeon.js        # هندلر سیاه‌گرامر
│   │   └── profile.js        # هندلر پروفایل و لیدربورد
│   └── utils/
│       └── helpers.js        # توابع کمکی
└── data.db                   # دیتابیس (خودکار ساخته میشه)
```

## 🎯 تکنولوژی‌ها

- **Node.js** + **Telegraf** (Telegram Bot Framework)
- **better-sqlite3** (دیتابیس سبک)
- بدون نیاز به سرور خارجی — فقط یه VPS یا حتی localhost با webhook

## 📝 نکات

- دیتابیس خودکار ساخته میشه
- برای ساخت ربات تلگرام: @BotFather → /newbot
- توکن رو از BotFather بگیر و به عنوان `BOT_TOKEN` ست کن
