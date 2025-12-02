Absolutely — here is the **entire full README.md**, complete, polished, and ready to paste directly into your repository.

---

# 🚀 LifeOS Tracker

A powerful, all-in-one productivity dashboard built with **React**, **TypeScript**, and **Tailwind CSS**.
LifeOS Tracker helps you manage habits, goals, tasks, distractions, and weekly reflections—all in one smart, AI-powered interface.

---

## 🌟 Features

### 🗓 Unified Daily Log

Track **habits**, **tasks**, **distractions**, and **notes** in a single view.

### ✅ Customizable Habits

Add, edit, or remove habit columns based on your lifestyle.

### 🎯 Goal Management

Create long-term goals and break them down into actionable milestones—manually or via AI.

### 🤖 AI Weekly Coach

Get personalized weekly insights powered by **Google Gemini**.

### 📊 Smart Analytics Dashboard

Visualizations for habit consistency, distraction impact, and weekly trends.

### 💾 Local Storage

All data is automatically saved in the browser—no login required.

### 📥 CSV Export

Download your logs for backup or external analysis.

---

## 🛠 Tech Stack

* **Framework:** React + Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **AI:** Google Gemini API

---

## 🚀 Getting Started

### **Prerequisites**

* Node.js (LTS recommended)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/life-tracker.git
cd life-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## ⚙️ Configuration

### **1. Tailwind Setup**

Ensure your `src/index.css` contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### **2. Google Gemini API Setup (Optional but recommended)**

To enable AI features:

1. Get a free API key from **Google AI Studio**
2. Open: `src/LifeTracker.tsx`
3. Find:

```ts
const apiKey = "";
```

4. Insert your key:

```ts
const apiKey = "YOUR_GEMINI_API_KEY_HERE";
```

> **⚠️ Important:**
> For production, do not hardcode API keys. Use `.env` files instead.

---

## 📖 How to Use

### **Daily Tracker**

* Click **Add Day** to create a new entry
* Check off habits
* Add tasks
* Log distractions (e.g., *"YouTube – 20 min"*)

### **Goals**

* Expand the **Goals** panel
* Add a goal
* Click **✨ Auto-Generate Milestones** for AI suggestions

### **Habits**

* Click **Edit Habits** to customize habit columns

### **Analysis**

* Open the **Analysis** tab
* View habit trends and distraction charts
* Click **Analyze My Week** for AI insights

---

## 📄 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute!

---


