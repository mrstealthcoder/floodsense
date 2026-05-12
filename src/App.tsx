/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  AlertTriangle, 
  Droplets, 
  Wind, 
  Radio, 
  Zap, 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Bolt, 
  BarChart3, 
  Globe, 
  Languages, 
  Sparkles,
  Compass,
  Users,
  Siren,
  Database,
  Cloud,
  ArrowRight
} from 'lucide-react';

type RiskLevel = 'HIGH' | 'MODERATE' | 'LOW';

interface AnalysisResult {
  district: string;
  analysis: {
    riskLevel: RiskLevel;
    probability: number;
    explanation: string;
    translationBangla: string;
    safetyTips: string[];
    metrics: {
      precipitation24h: number;
      saturationLevel: number;
    };
  };
  timestamp: string;
}

const DISTRICTS = [
  // Sylhet
  { id: 'sylhet', name: 'Sylhet' },
  { id: 'sunamganj', name: 'Sunamganj' },
  { id: 'habiganj', name: 'Habiganj' },
  { id: 'moulvibazar', name: 'Moulvibazar' },
  // Rangpur
  { id: 'rangpur', name: 'Rangpur' },
  { id: 'kurigram', name: 'Kurigram' },
  { id: 'gaibandha', name: 'Gaibandha' },
  { id: 'dinajpur', name: 'Dinajpur' },
  { id: 'panchagarh', name: 'Panchagarh' },
  { id: 'thakurgaon', name: 'Thakurgaon' },
  { id: 'nilphamari', name: 'Nilphamari' },
  { id: 'lalmonirhat', name: 'Lalmonirhat' },
  // Rajshahi
  { id: 'rajshahi', name: 'Rajshahi' },
  { id: 'bogura', name: 'Bogura' },
  { id: 'pabna', name: 'Pabna' },
  { id: 'sirajganj', name: 'Sirajganj' },
  { id: 'naogaon', name: 'Naogaon' },
  { id: 'natore', name: 'Natore' },
  { id: 'joypurhat', name: 'Joypurhat' },
  { id: 'chapainawabganj', name: 'Chapai Nawabganj' },
  // Mymensingh
  { id: 'mymensingh', name: 'Mymensingh' },
  { id: 'jamalpur', name: 'Jamalpur' },
  { id: 'netrokona', name: 'Netrokona' },
  { id: 'sherpur', name: 'Sherpur' },
  // Dhaka
  { id: 'dhaka', name: 'Dhaka' },
  { id: 'gazipur', name: 'Gazipur' },
  { id: 'narayanganj', name: 'Narayanganj' },
  { id: 'tangail', name: 'Tangail' },
  { id: 'manikganj', name: 'Manikganj' },
  { id: 'munshiganj', name: 'Munshiganj' },
  { id: 'narsingdi', name: 'Narsingdi' },
  { id: 'faridpur', name: 'Faridpur' },
  { id: 'gopalganj', name: 'Gopalganj' },
  { id: 'kishoreganj', name: 'Kishoreganj' },
  { id: 'madaripur', name: 'Madaripur' },
  { id: 'rajbari', name: 'Rajbari' },
  { id: 'shariatpur', name: 'Shariatpur' },
  // Khulna
  { id: 'khulna', name: 'Khulna' },
  { id: 'jessore', name: 'Jessore' },
  { id: 'satkhira', name: 'Satkhira' },
  { id: 'bagerhat', name: 'Bagerhat' },
  { id: 'kushtia', name: 'Kushtia' },
  { id: 'chuadanga', name: 'Chuadanga' },
  { id: 'jhenaidah', name: 'Jhenaidah' },
  { id: 'magura', name: 'Magura' },
  { id: 'meherpur', name: 'Meherpur' },
  { id: 'narail', name: 'Narail' },
  // Barisal
  { id: 'barisal', name: 'Barisal' },
  { id: 'bhola', name: 'Bhola' },
  { id: 'patuakhali', name: 'Patuakhali' },
  { id: 'pirojpur', name: 'Pirojpur' },
  { id: 'barguna', name: 'Barguna' },
  { id: 'jhalokati', name: 'Jhalokati' },
  // Chittagong
  { id: 'chittagong', name: 'Chittagong' },
  { id: 'comilla', name: 'Comilla' },
  { id: 'coxsbazar', name: "Cox's Bazar" },
  { id: 'noakhali', name: 'Noakhali' },
  { id: 'feni', name: 'Feni' },
  { id: 'brahmanbaria', name: 'Brahmanbaria' },
  { id: 'chandpur', name: 'Chandpur' },
  { id: 'lakshmipur', name: 'Lakshmipur' },
  { id: 'rangamati', name: 'Rangamati' },
  { id: 'khagrachhari', name: 'Khagrachhari' },
  { id: 'bandarban', name: 'Bandarban' },
];

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'intelligence' | 'reports' | 'emergency'>('intelligence');

  const [isDataSourcesModalOpen, setIsDataSourcesModalOpen] = useState(false);

  const performAnalysis = async (districtKey: string) => {
    if (!districtKey) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // 1. Fetch raw data from backend
      const dataResponse = await fetch('/api/district-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districtKey }),
      });
      
      if (!dataResponse.ok) throw new Error('Failed to fetch district data');
      
      const { district, context, timestamp } = await dataResponse.json();
      
      // 2. Initialize Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Environment key "GEMINI_API_KEY" is missing. Please ensure it is set in your environment.');
      }
      
      const genAI = new GoogleGenAI({ apiKey });
      
      const prompt = `
        You are an expert flood risk analyst for Bangladesh. Analyze the provided meteorological and historical data to determine the current risk for ${district.name} district.
        
        DATA CONTEXT:
        - Lat: ${district.lat}, Lon: ${district.lon}
        - Historical Flood Events (NASA EONET Proximity): ${context.nearbyEventsCount} events found.
        - Rainfall Metrics (NASA POWER - Last 30 Days):
          * Total: ${context.totalRainfall.toFixed(1)}mm
          * Peak Daily: ${context.maxRainfall.toFixed(1)}mm
          * Last 24h: ${context.precipitation24h.toFixed(1)}mm
          * Avg: ${context.avgRainfall.toFixed(1)}mm/day
          * Recent History (Last 7 days): ${context.rainfallHistory.join(', ')}

        INSTRUCTIONS:
        - Accurately determine risk level (HIGH, MODERATE, LOW).
        - Calculate a probability percentage (0-100).
        - Estimate Saturation Level (0-100) based on rainfall history.
        - Provide a professional explanation in English (2-3 sentences).
        - Provide a natural translation in Bangla.
        - List 3 specific, localized safety tips starting with a category (e.g., "SHELTER: ..." or "WATER: ...").

        REQUIRED JSON FORMAT:
        {
          "riskLevel": "STRING",
          "probability": NUMBER,
          "explanation": "STRING",
          "translationBangla": "STRING",
          "safetyTips": ["STRING", "STRING", "STRING"],
          "metrics": {
            "precipitation24h": NUMBER,
            "saturationLevel": NUMBER
          }
        }
      `;

      // 3. Call Gemini
      const aiResponse = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = aiResponse.text; // Use the direct .text property
      if (!responseText) throw new Error('Gemini returned an empty response.');

      const analysisJson = JSON.parse(responseText);

      setResult({
        district: district.name,
        analysis: analysisJson,
        timestamp
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => performAnalysis(selectedDistrict);

  const reset = () => {
    setResult(null);
    setSelectedDistrict('');
  };

  return (
    <div className="min-h-screen bg-[#0d1516] text-[#dce4e5] selection:bg-primary-container/30">
      {/* Top Bar */}
      <header className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-lg px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button onClick={reset} className="font-sans text-3xl font-bold tracking-tight text-[#c3f5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] cursor-pointer">
            FloodSense BD
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveView('intelligence')}
              className={`font-mono text-sm transition-colors cursor-pointer ${activeView === 'intelligence' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff] pb-1' : 'text-[#bac9cc] hover:text-[#c3f5ff]'}`}
            >
              Intelligence
            </button>
            <button 
              onClick={() => setActiveView('reports')}
              className={`font-mono text-sm transition-colors cursor-pointer ${activeView === 'reports' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff] pb-1' : 'text-[#bac9cc] hover:text-[#c3f5ff]'}`}
            >
              Reports
            </button>
            <button 
              onClick={() => setActiveView('emergency')}
              className={`font-mono text-sm transition-colors cursor-pointer ${activeView === 'emergency' ? 'text-[#00e5ff] border-b-2 border-[#00e5ff] pb-1' : 'text-[#bac9cc] hover:text-[#c3f5ff]'}`}
            >
              Emergency Resources
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-[#bac9cc]">
            <Search size={18} />
            <select 
              value={selectedDistrict}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDistrict(val);
                setActiveView('intelligence');
                performAnalysis(val);
              }}
              className="bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="" disabled className="bg-[#192122]">Select District</option>
              {DISTRICTS.map(d => (
                <option key={d.id} value={d.id} className="bg-[#192122]">{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="relative">
        <AnimatePresence mode="wait">
          {activeView === 'reports' ? (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-8 py-12 max-w-7xl mx-auto"
            >
              <div className="mb-12">
                <div className="flex items-center gap-2 text-primary-container mb-2">
                  <BarChart3 size={20} />
                  <span className="font-mono text-xs tracking-widest uppercase">Situational Intelligence Reports</span>
                </div>
                <h1 className="text-5xl font-bold text-[#c3f5ff]">Regional Assessment Summary</h1>
                <p className="text-[#bac9cc] mt-4 text-lg max-w-3xl">Comprehensive situational reports aggregating data from across Bangladesh. Updated every 6 hours based on satellite and mesh-sensor telemetry.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-[#192122] p-8 rounded-2xl border border-white/10 cyber-border">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                    <AlertTriangle className="text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Critical Zones</h3>
                  <div className="space-y-3 font-mono text-sm">
                    <p className="text-red-400">● Sylhet: Flash Flood Warning</p>
                    <p className="text-red-400">● Sunamganj: Severe Saturation</p>
                    <p className="text-red-400">● Kurigram: Water Level Rising</p>
                  </div>
                </div>
                <div className="bg-[#192122] p-8 rounded-2xl border border-white/10 cyber-border">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Cloud className="text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Warning Zones</h3>
                  <div className="space-y-3 font-mono text-sm">
                    <p className="text-orange-400">● Gaibandha: Pluvial Risk</p>
                    <p className="text-orange-400">● Nilphamari: Heavy Rainfall</p>
                    <p className="text-orange-400">● Lalmonirhat: Monitoring</p>
                  </div>
                </div>
                <div className="bg-[#192122] p-8 rounded-2xl border border-white/10 cyber-border">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Droplets className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Stable Zones</h3>
                  <div className="space-y-3 font-mono text-sm">
                    <p className="text-green-400">● Dhaka Division: Stable</p>
                    <p className="text-green-400">● Khulna Division: Low Risk</p>
                    <p className="text-green-400">● Barisal Division: Clear</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-[#242b2d]/50 p-8 rounded-2xl border border-white/5">
                <h3 className="text-2xl font-bold mb-6">Weekly Trend Analysis</h3>
                <div className="h-64 flex items-end gap-1 px-4">
                  {[40, 60, 45, 90, 70, 50, 30].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`w-full max-w-[40px] rounded-t-lg transition-colors ${h > 70 ? 'bg-red-500' : 'bg-[#00e5ff] opacity-60'}`}
                      />
                      <span className="font-mono text-[10px] text-[#bac9cc]">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeView === 'emergency' ? (
            <motion.div 
              key="emergency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-8 py-12 max-w-5xl mx-auto"
            >
              <div className="text-center mb-16">
                <Siren size={64} className="text-red-500 mx-auto mb-6 animate-pulse" />
                <h1 className="text-5xl font-bold text-white mb-4">Emergency Response Center</h1>
                <p className="text-[#bac9cc] text-xl">Immediate resources and contact information for disaster situations.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-red-600 p-8 rounded-2xl text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                  <h3 className="text-2xl font-bold mb-2">National Hotline</h3>
                  <p className="text-white/80 mb-6">Call for any emergency services (Police, Fire, Ambulance)</p>
                  <span className="text-7xl font-black tracking-tighter">999</span>
                </div>
                <div className="bg-[#0231de] p-8 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold mb-2">Flood Information</h3>
                  <p className="text-white/80 mb-6">Flood Forecasting & Warning Centre (FFWC)</p>
                  <span className="text-7xl font-black tracking-tighter">1090</span>
                </div>
              </div>

              <div className="bg-[#192122] p-8 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold text-[#fec931] mb-8">Disaster Survival Checklist</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    "Keep dry food and clean water in sealed containers.",
                    "Pack an emergency bag with medicine and flashlights.",
                    "Charge all mobile phones and power banks.",
                    "Secure important documents in waterproof bags.",
                    "Identify the nearest designated flood shelter.",
                    "Disconnect electrical appliances before water enters."
                  ].map((task, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-xl">
                      <div className="w-6 h-6 rounded-full border-2 border-[#fec931] flex items-center justify-center shrink-0 mt-1">
                        <span className="text-xs font-bold text-[#fec931]">{i+1}</span>
                      </div>
                      <p className="text-[#bac9cc] text-sm leading-relaxed">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[calc(100vh-80px)] flex items-center justify-center p-8"
            >
              <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 p-8 rounded-2xl max-w-lg text-center backdrop-blur-xl">
                <AlertTriangle size={64} className="text-[#ffb4ab] mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-[#ffb4ab] mb-4">Intelligence Failure</h2>
                <p className="text-[#bac9cc] mb-8 leading-relaxed">{error}</p>
                <button 
                  onClick={reset}
                  className="px-8 py-3 bg-[#ffb4ab] text-[#93000a] font-bold rounded-xl hover:brightness-110 transition-all uppercase text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1516]/60 backdrop-blur-md"
            >
              <div className="flex flex-col items-center max-w-md text-center p-12">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-primary-container/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-primary-container/40 animate-pulse"></div>
                  <div className="absolute inset-6 rounded-full border-4 border-t-primary-container border-r-primary-container/30 border-b-primary-container/10 border-l-primary-container/50 animate-spin"></div>
                  <div className="absolute inset-[52px] bg-primary-container rounded-full shadow-[0_0_15px_rgba(0,229,255,0.8)]"></div>
                </div>
                <h2 className="text-3xl font-bold text-[#c3f5ff] mb-4">Analyzing climate data…</h2>
                <div className="font-mono text-sm text-[#bac9cc]/80 tracking-widest bg-surface-container-high/40 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md animate-pulse">
                   Consulting with the clouds...
                </div>
                <div className="mt-12 flex items-center gap-3 px-4 py-2 bg-primary-container/10 rounded-full border border-primary-container/20">
                  <Sparkles size={18} className="text-[#00e5ff]" />
                  <span className="font-mono text-xs text-[#00e5ff] uppercase tracking-tighter">Gemini Intelligence Active</span>
                </div>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 py-6 space-y-6 max-w-7xl mx-auto"
            >
              <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary-container mb-2">
                    <Compass size={16} />
                    <span className="font-mono text-xs tracking-widest uppercase">Real-Time Intelligence Hub</span>
                  </div>
                  <h1 className="text-4xl font-bold text-[#00daf3]">Analysis: {result.district} District</h1>
                  <p className="text-base text-[#bac9cc] max-w-2xl mt-2">Geospatial risk assessment powered by Google Cloud and Gemini AI model. Data latency: 1.4s.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#242b2d] px-4 py-3 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-[#bac9cc]">CURRENT STATUS</span>
                    <span className="text-2xl font-semibold">Active Monitoring</span>
                  </div>
                  <Cloud size={32} className="text-[#00e5ff]" />
                </div>
              </section>

              <div className="grid grid-cols-12 gap-6">
                {/* Main Risk Card */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="relative overflow-hidden bg-[#192122]/60 backdrop-blur-2xl rounded-xl border border-white/10 p-6">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-semibold mb-1">Flood Risk Card</h2>
                        <p className="text-sm text-[#bac9cc]">Automated classification based on fluvial and pluvial data models.</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`flex items-center gap-2 border px-4 py-2 rounded-full animate-pulse ${
                          result.analysis.riskLevel === 'HIGH' ? 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]' :
                          result.analysis.riskLevel === 'MODERATE' ? 'bg-orange-500/20 border-orange-500/30 text-orange-500' :
                          'bg-green-500/20 border-green-500/30 text-green-500'
                        }`}>
                          <AlertTriangle size={18} />
                          <span className="text-sm font-bold uppercase">{result.analysis.riskLevel} RISK</span>
                        </div>
                        <span className="text-xs text-[#bac9cc] mt-2">Update: Just now</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-[#151d1e] p-4 rounded-lg border border-white/5">
                        <span className="text-xs text-[#bac9cc] block mb-2 uppercase font-mono">Precipitation (24h)</span>
                        <span className="text-2xl font-bold text-[#00e5ff]">{result.analysis.metrics.precipitation24h} mm</span>
                        <div className="mt-2 h-1 bg-[#2e3638] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(result.analysis.metrics.precipitation24h, 100)}%` }} className="bg-[#00e5ff] h-full" />
                        </div>
                      </div>
                      <div className="bg-[#151d1e] p-4 rounded-lg border border-white/5">
                        <span className="text-xs text-[#bac9cc] block mb-2 uppercase font-mono">Saturation Level</span>
                        <span className={`text-2xl font-bold ${result.analysis.metrics.saturationLevel > 80 ? 'text-[#ffb4ab]' : 'text-orange-400'}`}>
                          {result.analysis.metrics.saturationLevel}%
                        </span>
                        <div className="mt-2 h-1 bg-[#2e3638] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.analysis.metrics.saturationLevel}%` }} className={`h-full ${result.analysis.metrics.saturationLevel > 80 ? 'bg-[#ffb4ab]' : 'bg-orange-400'}`} />
                        </div>
                      </div>
                      <div className="bg-[#151d1e] p-4 rounded-lg border border-white/5">
                        <span className="text-xs text-[#bac9cc] block mb-2 uppercase font-mono">Probability</span>
                        <span className="text-2xl font-bold text-[#f3bf26]">{result.analysis.probability}%</span>
                        <div className="mt-2 h-1 bg-[#2e3638] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.analysis.probability}%` }} className="bg-[#f3bf26] h-full" />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#2e3638]/40 p-4 rounded-xl border-l-4 border-[#ffb4ab]">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe size={14} className="text-[#bac9cc]" />
                          <span className="font-mono text-xs text-[#bac9cc] uppercase">English Alert</span>
                        </div>
                        <p className="text-base font-medium leading-relaxed">{result.analysis.explanation}</p>
                      </div>
                      <div className="bg-[#2e3638]/40 p-4 rounded-xl border-l-4 border-primary-container">
                        <div className="flex items-center gap-2 mb-2">
                          <Languages size={14} className="text-[#bac9cc]" />
                          <span className="font-mono text-xs text-[#bac9cc] uppercase">বাংলা সতর্কতা</span>
                        </div>
                        <p className="text-base font-medium leading-relaxed">{result.analysis.translationBangla}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-[#242b2d]/40 rounded-xl border border-primary-container/20 p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/20">
                      <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
                      <span className="font-mono text-xs text-primary-container">GEMINI AI INSIGHTS</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-[#00e5ff]" />
                      Why this risk?
                    </h3>
                    <div className="space-y-4">
                      {result.analysis.explanation.split('. ').map((point, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-1 bg-[#6f5500] rounded-full shrink-0"></div>
                          <p className="text-[#bac9cc] leading-relaxed">{point}.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Safety Tips */}
                  <div className="bg-[#192122] rounded-xl border border-white/5 p-6">
                    <h3 className="text-2xl font-bold mb-6">Emergency Safety Tips</h3>
                    <div className="space-y-4">
                      {result.analysis.safetyTips.map((tip, i) => {
                        const icons = [<Zap />, <Droplets />, <Radio />];
                        return (
                          <div key={i} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-[#fec931] group-hover:scale-110 transition-transform">
                              {icons[i] || <Radio />}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#ffdf96]">{tip.split(':')[0]}</h4>
                              <p className="text-xs text-[#bac9cc]">{tip.split(':')[1] || 'Immediate action required.'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button className="w-full mt-6 bg-[#00e5ff] text-[#00363d] font-bold py-4 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase text-sm">
                      View All Safety Protocols
                    </button>
                  </div>

                  {/* Emergency Helpline */}
                  <div className="bg-[#0231de] p-6 rounded-xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="text-white">
                      <Siren size={40} className="mb-4" />
                      <h4 className="text-2xl font-bold mb-2">Emergency Helpline</h4>
                      <p className="text-white/80 mb-4">Immediate rescue or medical assistance is available 24/7.</p>
                      <span className="text-5xl font-bold block">999</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative min-h-[calc(100vh-80px)] flex items-center"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJakvvSPJbdJjbSuxQR6YJMQWQRYbuluxbfU6gmkgSNKQq2xQYMTVQnLVXqTEHM1Whv9stL6a6s0bX4cWxxBLQSFSMmvFgj0db3Zy-tjvv6DIS3TD_86XhmjdFDnkrj-C20DtPaF1yCJajAD9P2EwTgqzKPJyxP7IQqtxIzQSF9pvt1-V-DqAS3Uwk8PDuGW-jEcRk9Tn6GM5QEwkul3N1idICpGqlrOzjYbB3lMYYLqdAaxR5zkBsMYm0nh7r0FSm3scBeHOfxNH5" 
                  className="w-full h-full object-cover opacity-20 grayscale contrast-125"
                  alt="Mapping background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d1516] via-transparent to-[#0d1516]"></div>
              </div>

              <div className="relative z-10 px-8 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 mb-6">
                    <Bolt size={16} className="text-[#00e5ff]" />
                    <span className="font-mono text-xs text-[#00e5ff] uppercase tracking-widest">Real-Time Predictive AI</span>
                  </div>
                  <h1 className="text-6xl font-bold text-[#c3f5ff] mb-6 leading-tight">Bangladesh Flood Intelligence</h1>
                  <p className="text-xl text-[#bac9cc] mb-10 max-w-xl">
                    Harnessing the power of Google Cloud, Gemini AI, NASA EONET (Natural Events Tracker), and NASA POWER (Rainfall Telemetry) to provide high-precision flood forecasting and hyper-local risk assessment for the delta.
                  </p>
                  
                  <div className="glass-card p-8 rounded-xl max-w-2xl cyan-glow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-grow relative">
                        <label className="text-xs text-[#bac9cc] block mb-2 uppercase tracking-tighter font-mono">Target District</label>
                        <select 
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full bg-[#242b2d] border-b border-[#3b494c] text-[#dce4e5] py-4 px-4 rounded-lg focus:outline-none focus:border-[#00e5ff] transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select localized area...</option>
                          {DISTRICTS.map(d => (
                            <option key={d.id} value={d.id} className="bg-[#192122]">{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 bottom-4 pointer-events-none text-[#bac9cc]" />
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={handleAnalyze}
                          disabled={!selectedDistrict}
                          className="w-full md:w-auto px-8 py-4 bg-primary-container text-[#00363d] font-bold text-xl rounded-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Analyze Risk
                          <BarChart3 />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-5">
                  <div className="glass-card p-6 rounded-xl ai-shimmer border border-primary-container/20">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
                        <span className="font-mono text-sm text-[#00e5ff] uppercase">Processing Live Feed</span>
                      </div>
                      <span className="font-mono text-xs text-[#bac9cc]">V 4.2.0-Alpha</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-32 rounded-lg bg-[#2e3638]/50 relative overflow-hidden border border-white/5">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfMTrNxnPcW5J-kmXECdJ4j09TlZQifwcyjz_ll3Tbe0oz_F8DsmwLzFtpNaoVL1qyytSaqgZYL2mPq0FcugnZ5ODH8-j31vlZevE3RFbMkobPegau2fXIPuDv_lcQlD6piQX6CX1mvJCf_yr5S_BgjLc3p-I8EDFOh1u-c9jysjAi0s_VSiYRqhHXDEMnpXv-rQPIW0tkuZ1Ud43_BAt--c21R0dj7_9Ea-ShR-4rJ1LW1HC6Lbx3Cmouh-605clcz9poqxoQodWv"
                          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                          alt="Processing viz"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl text-[#00e5ff] font-bold">98.4%</div>
                            <div className="font-mono text-xs text-[#bac9cc] uppercase">Model Confidence</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#151d1e] p-3 rounded-lg border border-white/5">
                          <div className="font-mono text-xs text-[#bac9cc]">Cloud Nodes</div>
                          <div className="text-xl font-bold text-[#c3f5ff]">1,240</div>
                        </div>
                        <div className="bg-[#151d1e] p-3 rounded-lg border border-white/5">
                          <div className="font-mono text-xs text-[#bac9cc]">Active Streams</div>
                          <div className="text-xl font-bold text-[#f3bf26]">84</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Sections */}
        {(!result && !isAnalyzing) && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="px-8 py-24 max-w-7xl mx-auto"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#c3f5ff] mb-4">Autonomous Risk Governance</h2>
              <p className="text-base text-[#bac9cc] max-w-2xl">
                FloodSense BD leverages planetary-scale datasets from NASA's Earth Observatory (EONET) and meteorological archives (POWER) to provide authorities with the precision needed to save lives.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center border border-white/5 group hover:border-primary-container/30 transition-all duration-500">
                <div className="flex-shrink-0 w-full md:w-1/3 aspect-square rounded-xl overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzuafGxSIcJPPQBMLJCP2SPd5h3-X_MikD1bcjIBd6uHpP0SOF5P1_tQH_zOfbCVKhEKWysX1FW-e2esm4vUzepb0qvF1ZSNORaB3_mnAdUu8c809OSnQQw-bQAPMocqctvXMPFRnZaqjCoCqqp7EncV7lu_up4A5SECmT-VsxkHLgwEyXAJljrGglJ21FQd6Qs47t25t1RwxwIHxSI3KPBMMYiuMabaVLm-cn6l-5_-lxPftWG-8wAB4KwP0iut5A4UM34bfrZM14" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Satellite Fusion" />
                </div>
                <div className="flex-grow">
                  <div className="font-mono text-xs text-[#00e5ff] mb-2 uppercase tracking-widest">Global Surveillance</div>
                  <h3 className="text-2xl font-bold mb-4">Multi-Spectral Satellite Fusion</h3>
                  <p className="text-base text-[#bac9cc]">
                    Our system integrates NASA EONET flood events with NASA POWER rainfall telemetry and SAR imagery to ensure 24/7 visibility even during the heaviest monsoon rains.
                  </p>
                  <button 
                    onClick={() => setIsDataSourcesModalOpen(true)}
                    className="mt-6 flex items-center gap-2 text-[#c3f5ff] font-mono text-sm hover:translate-x-2 transition-transform cursor-pointer"
                  >
                    Learn about Data Sources
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                <div>
                  <Database className="text-[#00e5ff] w-10 h-10 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Gemini Analysis</h3>
                  <p className="text-base text-[#bac9cc]">
                    LLM-driven situational reports translating complex telemetry into actionable human language.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <span className="font-mono text-xs text-[#fec931]">INTEGRATED WITH GEMINI 3 FLASH</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Data Sources Modal */}
      <AnimatePresence>
        {isDataSourcesModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div 
              className="absolute inset-0 bg-[#0d1516]/90 backdrop-blur-md" 
              onClick={() => setIsDataSourcesModalOpen(false)}
            ></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#192122] border border-white/10 p-8 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setIsDataSourcesModalOpen(false)}
                  className="text-[#bac9cc] hover:text-white transition-colors cursor-pointer"
                >
                  <AlertTriangle className="rotate-45" size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary-container/20 rounded-xl">
                  <Database className="text-primary-container" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Planetary Data Stack</h2>
                  <p className="text-[#bac9cc] font-mono text-xs uppercase tracking-widest">Core Technical Architecture</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-[#00e5ff]/30 flex items-center justify-center shrink-0">
                    <Globe className="text-[#00e5ff]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#00e5ff] mb-2">NASA EONET v3</h4>
                    <p className="text-[#bac9cc] leading-relaxed text-sm">
                      The Earth Observatory Natural Event Tracker provides a near real-time stream of natural event metadata. We specifically pull data for current and historical flood events within a 330km radius of the target coordinates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-[#fec931]/30 flex items-center justify-center shrink-0">
                    <Cloud className="text-[#fec931]" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#fec931] mb-2">NASA POWER API</h4>
                    <p className="text-[#bac9cc] leading-relaxed text-sm">
                      The Prediction of Worldwide Energy Resources API provides high-resolution meteorological telemetry. We analyze 30-day precipitation trends (PRECTOTCORR) to model soil saturation and fluvial risk.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full border border-primary-container/30 flex items-center justify-center shrink-0">
                    <Sparkles className="text-primary-container" size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary-container mb-2">Gemini 3 Flash</h4>
                    <p className="text-[#bac9cc] leading-relaxed text-sm">
                      Our intelligence layer uses Google's latest generative model to synthesize raw NASA telemetry into actionable insights. It performs secondary reasoning on the saturation vs. historical event correlation.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsDataSourcesModalOpen(false)}
                className="w-full mt-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all uppercase text-sm tracking-widest"
              >
                Close Technical Specs
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#192122]/60 backdrop-blur-md border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-8 w-full gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-mono text-sm font-bold text-[#c3f5ff]">FloodSense BD</span>
            <p className="font-mono text-xs text-[#bac9cc]">© 2024 FloodSense BD. Powered by Google Cloud, Gemini AI, NASA EONET & NASA POWER</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-8 opacity-50">
              <Cloud size={20} />
              <Globe size={20} />
              <Database size={20} />
            </div>
            <a href="#" className="font-mono text-xs text-[#bac9cc] hover:text-[#00e5ff] transition-colors">Contact Support</a>
            <a href="#" className="font-mono text-xs text-[#bac9cc] hover:text-[#00e5ff] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
