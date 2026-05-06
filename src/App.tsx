/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { 
  TrendingUp, 
  Package, 
  Calendar, 
  Activity, 
  RefreshCcw, 
  BarChart3, 
  ChevronRight,
  Info,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

// Mock historical data for visualization
const mockHistory = Array.from({ length: 7 }, (_, i) => ({
  day: `Day ${i + 1}`,
  demand: 50 + Math.floor(Math.random() * 40),
  forecast: 45 + Math.floor(Math.random() * 50)
}));

interface PredictionResult {
  prediction: number;
  confidence: number;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: new Date().getDay(),
    is_weekend: new Date().getDay() >= 5 ? 1 : 0,
    prev_day_sales: 45,
    promotion_active: 0,
    month: new Date().getMonth() + 1
  });

  const handlePredict = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction from backend");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
      // Fallback for demo if backend is not yet running
      console.log("Prediction failed, check if FastAPI is running on port 3000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Inventory Forecast AI</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Demand Prediction Module</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Model Ready
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Forecast Parameters
            </h2>

            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Day of Week</label>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({...formData, day_of_week: i, is_weekend: i >= 5 ? 1 : 0})}
                      className={`py-2 text-xs font-bold rounded-md transition-all ${
                        formData.day_of_week === i 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Previous Day Sales</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.prev_day_sales}
                  onChange={(e) => setFormData({...formData, prev_day_sales: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                <span className="text-sm font-medium text-slate-700">Promotion Active</span>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, promotion_active: formData.promotion_active ? 0 : 1})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.promotion_active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.promotion_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Generate Forecast"}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2">Model Insight</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Our Random Forest model analyzes multi-dimensional seasonal patterns and promotional impact to predict stock requirements.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/10 p-2 rounded border border-white/10">
              <Info className="w-4 h-4" />
              Dataset: 1,000 synthetic items
            </div>
          </div>
        </div>

        {/* Right Column: Results & Analytics */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
                  <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Predicted Demand</span>
                  <div className="text-6xl font-black text-blue-600 tracking-tighter">
                    {result.prediction}
                    <span className="text-2xl text-slate-400 ml-1">units</span>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Model Confidence</span>
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-xs">HIGH</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-bold">{(result.confidence * 100).toFixed(0)}%</span>
                      <span className="text-slate-400 text-sm pb-1">Confidence Score</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400"
              >
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">Configure parameters and run the forecast</p>
                <p className="text-sm">Real-time demand prediction for inventory optimization</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Prediction Error</p>
                <p className="text-xs opacity-80 font-mono">{error}. Ensure backend is running.</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Historical Forecast Accuracy
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistory}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorDemand)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-slate-600 font-medium">Actual Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="text-slate-600 font-medium font-dashed">Predicted Forecast</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
