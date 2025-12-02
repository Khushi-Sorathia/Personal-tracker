import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  LayoutDashboard, 
  TrendingUp, 
  Download, 
  Plus, 
  Trash2,
  AlertCircle,
  Sparkles,
  Loader2,
  BrainCircuit,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';

// --- API Configuration ---
// Note: In a real deployed app, you'd want to handle this key more securely.
const apiKey = ""; 

async function generateGeminiResponse(prompt: string): Promise<string> {
  if (!apiKey) return "API Key is missing in the code.";
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insight. Please try again.";
  }
}

// --- Types ---
type Task = { id: string; text: string; done: boolean; };

type DailyEntry = {
  id: string;
  date: string;
  habits: Record<string, boolean>;
  tasks: Task[];
  distraction: string;
  minsWasted: number;
  notes: string;
};

type Goal = {
  id: string;
  title: string;
  category: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  milestones: Task[];
  aiPlan?: string;
};

const DEFAULT_HABITS = ["Sleep 8h", "Read", "Workout"];

// --- Initial / Default Data Generators ---
const getInitialEntries = (): DailyEntry[] => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      id: `day-${i}`,
      date: d.toISOString().split('T')[0],
      habits: { "Sleep 8h": Math.random() > 0.4, "Read": Math.random() > 0.6, "Workout": Math.random() > 0.5 },
      tasks: [
        { id: 't1', text: i === 6 ? "Finish Project X" : "Routine Work", done: Math.random() > 0.3 },
        { id: 't2', text: "Check Emails", done: true }
      ],
      distraction: i % 2 === 0 ? "Social Media" : "",
      minsWasted: i % 2 === 0 ? 30 : 0,
      notes: ""
    };
  });
};

const getInitialGoals = (): Goal[] => [
  { 
    id: '1', title: "Read 12 Books", category: "Personal", deadline: "2024-12-31", status: "In Progress", 
    milestones: [{ id: 'm1', text: 'Finish "Atomic Habits"', done: true }, { id: 'm2', text: 'Buy Kindle', done: true }]
  },
  { 
    id: '2', title: "Run a Marathon", category: "Health", deadline: "2025-06-01", status: "Not Started", 
    milestones: [{ id: 'm1', text: 'Buy Running Shoes', done: false }] 
  },
];

// --- Helper: Safe Local Storage Loader ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return defaultValue;
  }
}

// --- Components ---

export default function LifeTracker() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'dashboard'>('tracker');
  
  // FIX: Lazy Initialization (loads directly from storage on first render)
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadFromStorage('tracker_entries_v3', getInitialEntries()));
  const [goals, setGoals] = useState<Goal[]>(() => loadFromStorage('tracker_goals_v2', getInitialGoals()));
  const [habitLabels, setHabitLabels] = useState<string[]>(() => loadFromStorage('tracker_habit_labels', DEFAULT_HABITS));

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem('tracker_entries_v3', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('tracker_goals_v2', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('tracker_habit_labels', JSON.stringify(habitLabels));
  }, [habitLabels]);

  const updateEntry = (id: string, field: keyof DailyEntry, value: any) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateHabitStatus = (entryId: string, habitName: string, status: boolean) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, habits: { ...e.habits, [habitName]: status } };
    }));
  };

  const addEntry = () => {
    const d = new Date();
    // Ensure we don't have duplicate IDs if adding multiple in one session
    const newEntry: DailyEntry = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      date: d.toISOString().split('T')[0],
      habits: {}, 
      tasks: [],
      distraction: "",
      minsWasted: 0,
      notes: ""
    };
    setEntries([...entries, newEntry]);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const updateGoalList = (newGoals: Goal[]) => {
    setGoals(newGoals);
  }

  const exportToCSV = () => {
    const habitHeaders = habitLabels.join(",");
    const headers = ["Date", habitHeaders, "Tasks Completed", "Total Tasks", "Distraction", "Mins Wasted", "Notes"];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + entries.map(e => {
        const habitValues = habitLabels.map(h => e.habits[h] ? "TRUE" : "FALSE").join(",");
        const completedTasks = e.tasks.filter(t => t.done).length;
        return `${e.date},${habitValues},${completedTasks},${e.tasks.length},"${e.distraction}",${e.minsWasted},"${e.notes}"`
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "life_tracker_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">LifeOS Tracker</h1>
            </div>
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} icon={<CheckSquare size={18} />} label="Tracker" />
              <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<TrendingUp size={18} />} label="Analysis" />
            </nav>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors hidden sm:flex">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tracker' && (
          <UnifiedTrackerView 
            entries={entries} updateEntry={updateEntry} addEntry={addEntry} deleteEntry={deleteEntry}
            goals={goals} updateGoal={updateGoal} setGoals={updateGoalList}
            habitLabels={habitLabels} setHabitLabels={setHabitLabels} updateHabitStatus={updateHabitStatus}
          />
        )}
        {activeTab === 'dashboard' && <DashboardView entries={entries} habitLabels={habitLabels} />}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>
      {icon} {label}
    </button>
  );
}

function UnifiedTrackerView({ 
  entries, updateEntry, addEntry, deleteEntry, 
  goals, updateGoal, setGoals,
  habitLabels, setHabitLabels, updateHabitStatus
}: { 
  entries: DailyEntry[], 
  updateEntry: (id: string, f: keyof DailyEntry, v: any) => void,
  addEntry: () => void,
  deleteEntry: (id: string) => void,
  goals: Goal[],
  updateGoal: any,
  setGoals: any,
  habitLabels: string[],
  setHabitLabels: (l: string[]) => void,
  updateHabitStatus: (id: string, h: string, v: boolean) => void
}) {
  const [goalsCollapsed, setGoalsCollapsed] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const addHabitColumn = () => {
    if (newHabitName && !habitLabels.includes(newHabitName)) {
      setHabitLabels([...habitLabels, newHabitName]);
      setNewHabitName("");
    }
  };

  const removeHabitColumn = (habit: string) => {
    if (habitToDelete === habit) {
      setHabitLabels(habitLabels.filter(h => h !== habit));
      setHabitToDelete(null);
    } else {
      setHabitToDelete(habit);
      setTimeout(() => setHabitToDelete(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Active Goals
          </h2>
          <button onClick={() => setGoalsCollapsed(!goalsCollapsed)} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
            {goalsCollapsed ? <><ChevronDown size={14}/> Show Goals</> : <><ChevronUp size={14}/> Hide Goals</>}
          </button>
        </div>
        {!goalsCollapsed && <GoalsGrid goals={goals} updateGoal={updateGoal} setGoals={setGoals} />}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <CheckSquare className="text-blue-600" size={20}/> Daily Log
            </h2>
            <button onClick={() => setShowHabitManager(!showHabitManager)} className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
              <Settings size={12} /> {showHabitManager ? "Done Editing" : "Edit Habits"}
            </button>
          </div>
          <button onClick={addEntry} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 shadow-sm">
            <Plus size={16} /> Add Day
          </button>
        </div>

        {showHabitManager && (
          <div className="bg-gray-50 p-4 border-b border-gray-200 animate-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Manage Habit Columns</h4>
            <div className="flex flex-wrap gap-2 items-center">
              {habitLabels.map(habit => (
                <div key={habit} className={`flex items-center gap-1 border px-2 py-1 rounded text-sm shadow-sm transition-colors ${habitToDelete === habit ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200'}`}>
                  {habit}
                  <button onClick={() => removeHabitColumn(habit)} className={`ml-1 flex items-center justify-center ${habitToDelete === habit ? 'text-red-600 font-bold text-xs' : 'text-gray-400 hover:text-red-500'}`}>
                    {habitToDelete === habit ? "Delete?" : <X size={12} />}
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1 ml-2">
                <input 
                  value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="New habit name..." className="text-sm border-gray-300 rounded px-2 py-1 w-32 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && addHabitColumn()}
                />
                <button onClick={addHabitColumn} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Plus size={16} /></button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Double-click "X" to confirm deletion.</p>
          </div>
        )}
        
        <div className="overflow-x-auto pb-12">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3 w-32 min-w-[120px]">Date</th>
                {habitLabels.map(habit => <th key={habit} className="px-2 py-3 text-center min-w-[80px]">{habit}</th>)}
                <th className="px-4 py-3 w-20 text-center">Score</th>
                <th className="px-4 py-3 min-w-[300px]">Daily Tasks & To-Dos</th>
                <th className="px-4 py-3 w-48">Distraction</th>
                <th className="px-4 py-3 w-24">Mins Lost</th>
                <th className="px-4 py-3 min-w-[200px]">Notes</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.slice().reverse().map(entry => {
                const activeHabitCount = habitLabels.length;
                const completedCount = habitLabels.filter(h => entry.habits[h]).length;
                const score = activeHabitCount > 0 ? (completedCount / activeHabitCount) * 100 : 0;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-4 py-2 align-top pt-4">
                      <input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, 'date', e.target.value)} className="bg-transparent border-none focus:ring-0 p-0 text-gray-600 font-medium w-full"/>
                    </td>
                    {habitLabels.map(habit => (
                      <td key={habit} className="px-2 py-2 text-center align-top pt-4">
                        <input type="checkbox" checked={!!entry.habits[habit]} onChange={(e) => updateHabitStatus(entry.id, habit, e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5 border-gray-300 cursor-pointer" />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center align-top pt-4">
                       <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${score === 100 ? 'bg-green-100 text-green-700' : score > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>{Math.round(score)}%</span>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <TaskManager tasks={entry.tasks} onChange={(newTasks) => updateEntry(entry.id, 'tasks', newTasks)} />
                    </td>
                    <td className="px-4 py-2 align-top pt-4">
                      <select value={entry.distraction} onChange={(e) => updateEntry(entry.id, 'distraction', e.target.value)} className="w-full border-gray-200 rounded-md text-sm focus:border-red-500 focus:ring-red-500 py-1">
                        {["", "Phone/Social Media", "Email/Slack", "Daydreaming", "Coworkers/Family", "Video Games", "YouTube"].map(opt => (
                          <option key={opt} value={opt}>{opt || "-"}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 align-top pt-4">
                      <input type="number" value={entry.minsWasted} onChange={(e) => updateEntry(entry.id, 'minsWasted', parseInt(e.target.value) || 0)} className={`w-full border-gray-200 rounded-md text-sm py-1 ${entry.minsWasted > 0 ? 'text-red-600 font-bold bg-red-50' : 'text-gray-400'}`} />
                    </td>
                    <td className="px-4 py-2 align-top pt-4">
                      <textarea value={entry.notes} onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)} rows={1} className="w-full border-transparent bg-transparent rounded-md text-sm focus:bg-white focus:border-gray-200 resize-none overflow-hidden focus:overflow-auto" placeholder="Notes..." />
                    </td>
                    <td className="px-4 py-2 text-center align-top pt-4">
                      <button onClick={() => deleteEntry(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TaskManager({ tasks, onChange, placeholder = "Add new task..." }: { tasks: Task[], onChange: (t: Task[]) => void, placeholder?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const completedCount = tasks.filter(t => t.done).length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  const addTask = () => {
    if (!newTaskText.trim()) return;
    onChange([...tasks, { id: Date.now().toString(), text: newTaskText, done: false }]);
    setNewTaskText("");
  };

  const toggleTask = (taskId: string) => onChange(tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  const deleteTask = (taskId: string) => onChange(tasks.filter(t => t.id !== taskId));

  return (
    <div className="relative">
      <div className="border border-gray-200 rounded-md p-2 bg-white cursor-pointer hover:border-blue-400 transition-colors min-h-[50px] relative" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{tasks.length === 0 ? "No Tasks" : `${completedCount}/${tasks.length} Done`}</span>
          {tasks.length > 0 && (
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {tasks.slice(0, 3).map(t => (
            <div key={t.id} className={`text-xs truncate flex items-center gap-1 ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.done ? 'bg-gray-300' : 'bg-blue-400'}`}></div>{t.text}
            </div>
          ))}
          {tasks.length > 3 && <div className="text-[10px] text-gray-400 pl-2.5">+{tasks.length - 3} more...</div>}
          {tasks.length === 0 && <div className="text-xs text-gray-400 italic">Click to add items...</div>}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-50 mt-2 p-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
              <h4 className="font-semibold text-sm text-gray-700">Checklist</h4>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-3">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 group">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 cursor-pointer shrink-0" />
                  <span className={`text-sm flex-1 break-words ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
                  <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-xs text-gray-400 text-center py-2">List is empty.</p>}
            </div>
            <div className="flex gap-2">
              <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder={placeholder} className="flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5" autoFocus />
              <button onClick={addTask} className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors"><Plus size={16} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GoalsGrid({ goals, updateGoal, setGoals }: { goals: Goal[], updateGoal: any, setGoals: any }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const addGoal = () => {
    setGoals([...goals, { 
      id: Date.now().toString(), title: "New Goal", category: "Personal", deadline: "2024-12-31", status: "Not Started", milestones: [] 
    }]);
  };

  const handleGeneratePlan = async (goal: Goal) => {
    if (!goal.title) return;
    setLoadingId(goal.id);
    const prompt = `I have a goal: "${goal.title}" in the category "${goal.category}". Please break this down into 3-5 concrete, actionable milestones. Return ONLY the steps separated by newlines, no numbers or bullets.`;
    const planText = await generateGeminiResponse(prompt);
    const newTasks = planText.split('\n').map(line => line.replace(/^[-*•\d\.]+\s*/, '').trim()).filter(line => line.length > 0).map(text => ({ id: Date.now() + Math.random().toString(), text, done: false }));
    updateGoal(goal.id, 'milestones', [...goal.milestones, ...newTasks]);
    updateGoal(goal.id, 'aiPlan', "Plan added to checklist!");
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Goals</h3>
        <button onClick={addGoal} className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"><Plus size={12} /> Add Goal</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {goals.map(goal => (
          <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative bg-white flex flex-col h-full group">
            <div className="flex justify-between items-start mb-3">
              <input value={goal.title} onChange={(e) => updateGoal(goal.id, 'title', e.target.value)} className="font-bold text-lg text-gray-800 border-none p-0 focus:ring-0 w-full placeholder-gray-300" placeholder="Goal Title" />
              <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-gray-300 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="text-[10px] text-gray-400 uppercase font-bold">Category</label><input value={goal.category} onChange={(e) => updateGoal(goal.id, 'category', e.target.value)} className="w-full text-xs text-gray-600 border-b border-gray-200 py-1 focus:border-blue-500 focus:outline-none"/></div>
              <div><label className="text-[10px] text-gray-400 uppercase font-bold">Deadline</label><input type="date" value={goal.deadline} onChange={(e) => updateGoal(goal.id, 'deadline', e.target.value)} className="w-full text-xs text-gray-600 border-b border-gray-200 py-1 focus:border-blue-500 focus:outline-none"/></div>
            </div>
            <div className="mb-4">
               <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Milestones & To-Dos</label>
               <TaskManager tasks={goal.milestones} onChange={(newTasks) => updateGoal(goal.id, 'milestones', newTasks)} placeholder="Add milestone..." />
            </div>
            <select value={goal.status} onChange={(e) => updateGoal(goal.id, 'status', e.target.value)} className={`w-full text-xs font-bold uppercase py-1 px-2 rounded mb-4 ${goal.status === 'Completed' ? 'bg-green-100 text-green-700' : goal.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'} border-none focus:ring-0`}>
              <option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
            </select>
            <div className="mt-auto pt-4 border-t border-gray-100">
               <button onClick={() => handleGeneratePlan(goal)} disabled={loadingId === goal.id || !goal.title} className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded border border-blue-100 hover:border-blue-300 transition-all">
                  {loadingId === goal.id ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} {loadingId === goal.id ? "Thinking..." : "✨ Auto-Generate Milestones"}
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ entries, habitLabels }: { entries: DailyEntry[], habitLabels: string[] }) {
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const totalDays = entries.length;
  const habitStats = habitLabels.map(label => ({ label, percent: Math.round((entries.filter(e => e.habits[label]).length / totalDays) * 100) }));
  const totalWasted = entries.reduce((acc, curr) => acc + curr.minsWasted, 0);
  const distractionCounts: Record<string, number> = {};
  entries.forEach(e => { if (e.distraction) distractionCounts[e.distraction] = (distractionCounts[e.distraction] || 0) + e.minsWasted; });
  const topDistraction = Object.entries(distractionCounts).sort((a, b) => b[1] - a[1])[0];

  const handleGenerateInsight = async () => {
    setLoading(true);
    const summaryData = {
      daysLogged: totalDays, habits: habitStats.map(h => `${h.label}: ${h.percent}%`).join(", "), totalTimeWastedMinutes: totalWasted, topDistraction: topDistraction ? topDistraction[0] : "None",
      taskCompletionRate: Math.round(entries.reduce((acc, curr) => acc + (curr.tasks.filter(t => t.done).length / (curr.tasks.length || 1)), 0) / totalDays * 100) + "%"
    };
    const prompt = `You are a tough but encouraging productivity coach. Here is my data for the last week: ${JSON.stringify(summaryData)}. Please give me a short, 3-sentence summary of my performance. Point out the good and the bad. Then, provide ONE specific, actionable tip to improve next week. Use emojis.`;
    const result = await generateGeminiResponse(prompt);
    setAiInsight(result);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100 lg:col-span-3">
        <div className="flex justify-between items-start mb-4">
           <h3 className="text-indigo-900 text-lg font-bold flex items-center gap-2"><Sparkles className="text-indigo-600" size={20} /> AI Weekly Coach</h3>
          <button onClick={handleGenerateInsight} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />} {aiInsight ? "Regenerate Analysis" : "Analyze My Week"}
          </button>
        </div>
        {aiInsight ? <div className="bg-white/80 p-4 rounded-lg text-indigo-900 text-sm leading-relaxed whitespace-pre-line border border-indigo-100">{aiInsight}</div> : <p className="text-indigo-400 text-sm italic">Click the button to get a personalized breakdown of your habits and distractions from Gemini.</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-2"><CheckSquare size={16} /> Habit Consistency</h3>
        <div className="space-y-4">
          {habitStats.map((stat, idx) => <ProgressBar key={stat.label} label={stat.label} percent={stat.percent} color={idx % 3 === 0 ? "bg-blue-500" : idx % 3 === 1 ? "bg-purple-500" : "bg-green-500"} />)}
          {habitStats.length === 0 && <p className="text-gray-400 text-sm">No habits configured.</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-2"><AlertCircle size={16} /> Distraction Impact</h3>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="text-4xl font-bold text-red-500 mb-1">{totalWasted}m</div>
          <p className="text-sm text-gray-400 mb-6">Total Time Lost</p>
          {topDistraction ? (
            <div className="w-full bg-red-50 p-4 rounded-lg border border-red-100">
              <span className="text-xs text-red-600 font-bold uppercase tracking-wider">Top Offender</span>
              <div className="flex justify-between items-end mt-1"><span className="font-medium text-gray-800">{topDistraction[0]}</span><span className="text-red-500 font-bold">{topDistraction[1]}m</span></div>
            </div>
          ) : <p className="text-green-500 text-sm">No distractions logged yet!</p>}
        </div>
      </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
        <h3 className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-2"><TrendingUp size={16} /> Daily Performance</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {entries.slice(-7).map((entry, i) => {
             const activeHabitCount = habitLabels.length;
             const completedCount = habitLabels.filter(h => entry.habits[h]).length;
             const score = activeHabitCount > 0 ? (completedCount / activeHabitCount) * 100 : 0;
             return (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                 <div className="w-full bg-gray-100 rounded-t-sm relative h-full overflow-hidden">
                   <div className={`absolute bottom-0 w-full transition-all duration-500 ${score > 66 ? 'bg-green-400' : score > 33 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ height: `${score}%` }}></div>
                 </div>
                 <span className="text-[10px] text-gray-400 font-mono">{entry.date.slice(5)}</span>
                 <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Score: {Math.round(score)}%</div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 font-medium">{label}</span><span className="text-gray-900 font-bold">{percent}%</span></div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className={`h-2.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div></div>
    </div>
  );
}