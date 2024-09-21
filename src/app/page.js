"use client"

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { jsPDF } from "jspdf"

export default function Home() {
  const [habits, setHabits] = useState([])
  const [newHabitName, setNewHabitName] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    const storedHabits = localStorage.getItem('habits')
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = (e) => {
    e.preventDefault()
    if (newHabitName.trim()) {
      setHabits([...habits, { id: Date.now().toString(), name: newHabitName.trim(), completedDates: [] }])
      setNewHabitName('')
    }
  }

  const toggleHabit = (id) => {
    const dateString = selectedDate.toISOString().split('T')[0]
    setHabits(habits.map(habit =>
      habit.id === id
        ? {
            ...habit,
            completedDates: habit.completedDates.includes(dateString)
              ? habit.completedDates.filter(date => date !== dateString)
              : [...habit.completedDates, dateString]
          }
        : habit
    ))
  }

  const removeHabit = (id) => {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const getStreak = (habit) => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      if (habit.completedDates.includes(dateString)) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const getCompletionStatus = (date) => {
    const dateString = date.toISOString().split('T')[0]
    const completedHabits = habits.filter(habit => habit.completedDates.includes(dateString))
    if (completedHabits.length === 0) return 'incomplete'
    if (completedHabits.length === habits.length) return 'complete'
    return 'partial'
  }

  const getWeeklyProgress = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const totalPossible = habits.length * 7
    const completed = habits.reduce((sum, habit) => {
      return sum + habit.completedDates.filter(date => new Date(date) >= oneWeekAgo).length
    }, 0)
    return Math.round((completed / totalPossible) * 100)
  }

  const getHabitData = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const data = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const completedHabits = habits.filter(habit => habit.completedDates.includes(dateString)).length
      data.push({
        date: dateString,
        completed: completedHabits
      })
    }
    return data
  }

  const getOverallSuccessRate = () => {
    const totalPossible = habits.length * 30
    const completed = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0)
    return Math.round((completed / totalPossible) * 100)
  }

  const generateReport = () => {
    const doc = new jsPDF()
    doc.text("Habit Tracker Report", 20, 10)
    habits.forEach((habit, index) => {
      doc.text(`${habit.name}: ${getStreak(habit)} day streak`, 20, 20 + (index * 10))
    })
    doc.text(`Overall Success Rate: ${getOverallSuccessRate()}%`, 20, 20 + (habits.length * 10))
    doc.save("habit-tracker-report.pdf")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-4xl font-extrabold text-indigo-400 text-center mb-8">Habit Tracker</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full bg-gray-900 text-gray-100 border-gray-700 rounded-lg shadow-lg"
                tileClassName={({ date, view }) => 
                  view === 'month' ? `${
                    getCompletionStatus(date) === 'complete' ? 'bg-green-800' :
                    getCompletionStatus(date) === 'partial' ? 'bg-yellow-800' :
                    'bg-red-800'
                  } hover:opacity-75 text-gray-100` : null
                }
                calendarType="US"
                prevLabel={<span className="text-indigo-400">◀</span>}
                nextLabel={<span className="text-indigo-400">▶</span>}
                navigationLabel={({ date }) => (
                  <span className="text-indigo-400 font-bold">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                )}
              />
            </div>
            
            <div>
              <form onSubmit={addHabit} className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="Enter new habit"
                    className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-100"
                  />
                  <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-gray-900 bg-indigo-400 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Habit
                  </button>
                </div>
              </form>
              
              <ul className="space-y-3">
                {habits.map(habit => (
                  <li key={habit.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-md shadow">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={habit.completedDates.includes(selectedDate.toISOString().split('T')[0])}
                        onChange={() => toggleHabit(habit.id)}
                        className="h-4 w-4 text-indigo-400 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                      />
                      <span className="ml-3 text-gray-100">{habit.name}</span>
                      <span className="ml-2 text-sm text-gray-400">Streak: {getStreak(habit)}</span>
                      {getStreak(habit) >= 7 && <span className="ml-2">🔥</span>}
                      {getStreak(habit) >= 30 && <span className="ml-2">🏆</span>}
                    </div>
                    <button onClick={() => removeHabit(habit.id)} className="text-red-400 hover:text-red-300">
                      <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-indigo-400 mb-4">Analytics</h2>
            <div className="flex mb-4">
              <button
                className={`mr-2 px-4 py-2 rounded ${activeTab === 'daily' ? 'bg-indigo-600 text-gray-100' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('daily')}
              >
                Daily
              </button>
              <button
                className={`mr-2 px-4 py-2 rounded ${activeTab === 'weekly' ? 'bg-indigo-600 text-gray-100' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === 'overall' ? 'bg-indigo-600 text-gray-100' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setActiveTab('overall')}
              >
                Overall
              </button>
            </div>
            {activeTab === 'daily' && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getHabitData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#818CF8" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {activeTab === 'weekly' && (
              <div className="bg-gray-700 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getWeeklyProgress()}%` }}
                ></div>
              </div>
            )}
            {activeTab === 'overall' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: getOverallSuccessRate() },
                      { name: 'Missed', value: 100 - getOverallSuccessRate() }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    <Cell fill="#818CF8" />
                    <Cell fill="#4B5563" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <button
            onClick={generateReport}
            className="mt-8 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-400 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
