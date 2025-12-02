<div align="center">
<h1>LifeOS Tracker 🚀</h1>
<p>
A powerful, all-in-one productivity dashboard built with <strong>React</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>.
</p>

<!-- Badges -->

<p>
<img src="https://www.google.com/search?q=https://img.shields.io/badge/React-20232A%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3D61DAFB" alt="React" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/TypeScript-007ACC%3Fstyle%3Dfor-the-badge%26logo%3Dtypescript%26logoColor%3Dwhite" alt="TypeScript" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-38B2AC%3Fstyle%3Dfor-the-badge%26logo%3Dtailwind-css%26logoColor%3Dwhite" alt="Tailwind CSS" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Vite-646CFF%3Fstyle%3Dfor-the-badge%26logo%3Dvite%26logoColor%3Dwhite" alt="Vite" />
</p>

<p>
<a href="#-features">Features</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-configuration">Configuration</a> •
<a href="#-how-to-use">How to Use</a>
</p>
</div>

<br />

ℹ️ About The Project

LifeOS Tracker combines habit tracking, daily journaling, long-term goal management, and distraction analysis into a single interface. It features AI integration (Google Gemini) to provide personalized coaching and intelligent goal breakdowns.

✨ Features

📅 Unified Daily Log: Track habits, tasks, distractions, and notes in a single view.

✅ Customizable Habits: Add, edit, or remove habit columns to suit your lifestyle.

🎯 Goal Management: Set long-term goals and break them down into checklists manually or using AI.

🤖 AI Weekly Coach: Get a personalized analysis of your week with actionable tips (powered by Gemini).

📊 Smart Dashboard: Visualizations for habit consistency and distraction impact.

💾 Local Storage: Your data is saved automatically in your browser—no login required.

📥 CSV Export: Download your data anytime for backup or analysis in Excel/Sheets.

🛠️ Tech Stack

Framework: React + Vite

Language: TypeScript

Styling: Tailwind CSS

Icons: Lucide React

AI: Google Gemini API

🚀 Getting Started

Prerequisites

Node.js installed on your machine.

Installation

Clone the repository (or unzip your project folder):

git clone [https://github.com/yourusername/life-tracker.git](https://github.com/yourusername/life-tracker.git)
cd life-tracker


Install dependencies:

npm install


Run the development server:

npm run dev


Open your browser to the link shown in the terminal (usually http://localhost:5173).

⚙️ Configuration

1. Tailwind CSS

If the styles look broken, ensure your src/index.css contains:

@tailwind base;
@tailwind components;
@tailwind utilities;


2. Google Gemini API (AI Features)

To enable the "AI Coach" and "Goal Breakdown" features:

Get a free API key from Google AI Studio.

Open src/LifeTracker.tsx.

Find the const apiKey = "" line near the top.

Paste your key inside the quotes:

const apiKey = "YOUR_GEMINI_API_KEY_HERE";


Warning
For a production app, never hardcode API keys. Use .env files to store secrets.

📖 How to Use

Daily Tracker:

Click "Add Day" to start a new entry.

Check off habits and add tasks to your daily to-do list.

If you get distracted, log the source (e.g., "Social Media") and minutes wasted.

Goals:

Click "Show Goals" to expand the goal section.

Add a goal, then use the "✨ Auto-Generate Milestones" button to have AI create a checklist for you.

Habits:

Click "Edit Habits" to add custom columns (e.g., "Meditation", "Water").

Analysis:

Switch to the "Analysis" tab to see your progress bars.

Click "Analyze My Week" to get an AI-generated productivity report.

📄 License

This project is open source and available under the MIT License.