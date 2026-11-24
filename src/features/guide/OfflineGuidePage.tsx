import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  AlertTriangle,
  Search,
  HeartPulse,
  Flame,
  Waves,
  ShieldAlert,
  WifiOff
} from 'lucide-react';
import { OFFLINE_EMERGENCY_GUIDES, FirstAidGuideSection } from '../../data/firstAid';
import { useSettingsStore } from '../../store/useSettingsStore';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../../lib/speech';
import { useToast } from '../../components/common/Toast';

export const OfflineGuidePage: React.FC = () => {
  const { showToast } = useToast();
  const { simpleLanguageMode, setSimpleLanguageMode } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [speakingSectionId, setSpeakingSectionId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Protocols' },
    { id: 'trauma', label: 'Trauma & Bleeding' },
    { id: 'medical', label: 'Medical CPR / Choking' },
    { id: 'fire', label: 'Fire & Burns' },
    { id: 'earthquake', label: 'Earthquake' },
    { id: 'flood', label: 'Flooding' },
  ];

  const filteredGuides = OFFLINE_EMERGENCY_GUIDES.filter((guide) => {
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReadAloud = (guide: FirstAidGuideSection) => {
    if (speakingSectionId === guide.id) {
      stopSpeaking();
      setSpeakingSectionId(null);
      return;
    }

    if (!isSpeechSynthesisSupported()) {
      showToast('Speech synthesis not supported in this browser.', 'error');
      return;
    }

    const stepsToRead = simpleLanguageMode ? guide.simpleSteps : guide.steps;
    const text = `${guide.title}. ${guide.summary}. Instructions: ${stepsToRead.join('. ')}`;

    setSpeakingSectionId(guide.id);
    speakText(text, {
      onEnd: () => setSpeakingSectionId(null),
      onError: () => setSpeakingSectionId(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Offline Emergency & First-Aid Guide</h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Pre-cached clinical stabilization and disaster survival instructions. Operates with zero network connectivity.
          </p>
        </div>

        {/* Simple Language Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold">Plain Language Mode:</span>
          <button
            type="button"
            onClick={() => setSimpleLanguageMode(!simpleLanguageMode)}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
              simpleLanguageMode ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            aria-label="Toggle Simple Language Mode"
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                simpleLanguageMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Offline Status Badge */}
      <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-cyan-400" />
          <span>
            <strong>PWA Pre-Cached Storage:</strong> All medical instructions and survival diagrams remain 100% accessible in airplane mode.
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency instructions (e.g., CPR, bleeding, burns, flood)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === c.id
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Protocols List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => {
          const isSpeakingThis = speakingSectionId === guide.id;
          const displayTitle = simpleLanguageMode ? guide.simpleTitle : guide.title;
          const displaySteps = simpleLanguageMode ? guide.simpleSteps : guide.steps;

          return (
            <div
              key={guide.id}
              className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {guide.category === 'trauma' && <HeartPulse className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    {guide.category === 'medical' && <ShieldAlert className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                    {guide.category === 'fire' && <Flame className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                    {guide.category === 'flood' && <Waves className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
                    {guide.category === 'earthquake' && <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0" />}

                    <h2 className="text-base font-bold text-white">{displayTitle}</h2>
                  </div>

                  <button
                    onClick={() => handleReadAloud(guide)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isSpeakingThis
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-slate-900 text-cyan-300 border-slate-800 hover:bg-slate-800'
                    }`}
                    title={isSpeakingThis ? 'Stop Audio' : 'Read aloud with Text-to-Speech'}
                    aria-label={`Read aloud instructions for ${displayTitle}`}
                  >
                    {isSpeakingThis ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{guide.summary}</p>

                {/* Steps */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Step-By-Step Actions
                  </h3>
                  <div className="space-y-2">
                    {displaySteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Warnings */}
                {guide.criticalWarnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/25 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Critical Hazard Warning
                    </span>
                    <ul className="space-y-1">
                      {guide.criticalWarnings.map((warn, wi) => (
                        <li key={wi} className="text-xs text-red-300 leading-relaxed">
                          • {warn}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Equipment Needed */}
              {guide.equipmentNeeded.length > 0 && (
                <div className="pt-3 border-t border-cyan-950 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Suggested Equipment:</span>
                  {guide.equipmentNeeded.map((eq, ei) => (
                    <span
                      key={ei}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredGuides.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
            No matching emergency protocols found for &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </div>
  );
};
