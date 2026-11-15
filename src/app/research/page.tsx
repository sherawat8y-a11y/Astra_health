'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  Search, 
  BookOpen, 
  Info, 
  Dna, 
  Heart, 
  Brain, 
  Compass
} from 'lucide-react';
import { ResearchDataset, HRP_RISK_MAP } from '@/lib/types';

export default function NasaResearchDataPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [datasets, setDatasets] = useState<ResearchDataset[]>([]);
  const [hrpRisks, setHrpRisks] = useState<any[]>(HRP_RISK_MAP);
  const [sourceAttribution, setSourceAttribution] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'osdr' | 'hrp' | 'cipher'>('osdr');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadResearch() {
      setLoading(true);
      try {
        const res = await fetch(`/api/nasa/research?category=${categoryFilter}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDatasets(data.datasets);
            setSourceAttribution(data.attribution);
            if (data.hrpRisks) setHrpRisks(data.hrpRisks);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResearch();
  }, [categoryFilter]);

  const filteredDatasets = datasets.filter(ds => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ds.title.toLowerCase().includes(q) || 
           ds.accession.toLowerCase().includes(q) || 
           ds.description.toLowerCase().includes(q) ||
           ds.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Database className="h-4 w-4" />
            <span>NASA Open Science Data Repository (OSDR)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            NASA Research Data &amp; HRP Roadmap
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Direct scientific grounding with peer-reviewed spaceflight biological, physiological, and environmental omics datasets from NASA OSDR, HRP, and CIPHER.
          </p>
        </div>

        {/* Real Data vs Telemetry Distinction Banner */}
        <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#6E6E73] max-w-md shadow-xs">
          <div className="flex items-center gap-1.5 font-semibold mb-0.5 text-[#0071E3]">
            <Info className="h-4 w-4 shrink-0" />
            <span>SCIENTIFIC INTEGRITY NOTICE</span>
          </div>
          <p className="text-[11px] leading-tight">
            NASA research datasets cited here are authentic peer-reviewed spaceflight studies. They are used to validate physiological baselines and are never presented as live astronaut telemetry.
          </p>
        </div>
      </div>

      {/* Primary Repository Tabs (OSDR, HRP Roadmap, CIPHER) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5EA] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('osdr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
            activeTab === 'osdr'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-[#6E6E73] hover:text-[#1D1D1F] bg-white border border-[#E5E5EA]'
          }`}
        >
          <Dna className="h-4 w-4" />
          <span>NASA OSDR Studies ({filteredDatasets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hrp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
            activeTab === 'hrp'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-[#6E6E73] hover:text-[#1D1D1F] bg-white border border-[#E5E5EA]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>NASA Human Research Roadmap (HRR)</span>
        </button>

        <button
          onClick={() => setActiveTab('cipher')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold ${
            activeTab === 'cipher'
              ? 'bg-[#0071E3] text-white shadow-xs'
              : 'text-[#6E6E73] hover:text-[#1D1D1F] bg-white border border-[#E5E5EA]'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>NASA CIPHER Expedition Project</span>
        </button>
      </div>

      {/* TAB 1: NASA OSDR Datasets Explorer */}
      {activeTab === 'osdr' && (
        <div className="space-y-4">
          
          {/* Search and Category Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs shadow-sm">
            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 max-w-md bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3 py-1.5 focus-within:border-[#0071E3] transition-colors">
              <Search className="h-4 w-4 text-[#6E6E73]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search OSDR accessions (e.g. OSD-379, Twins, SANS, Bone)..."
                className="w-full bg-transparent text-[#1D1D1F] placeholder-[#6E6E73] focus:outline-none"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Cardiovascular', 'Immune', 'Musculoskeletal', 'Behavioral', 'Neuro-ocular'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                    categoryFilter === cat
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] border border-[#E5E5EA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dataset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDatasets.map(ds => (
              <div
                key={ds.id}
                className="rounded-2xl border border-[#E5E5EA] bg-white p-6 space-y-4 shadow-sm hover:shadow transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EBF5FF] text-[#0071E3] font-bold">
                      {ds.accession}
                    </span>
                    <span className="text-[#6E6E73] font-medium">{ds.category} • {ds.year}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#1D1D1F] mt-2.5 leading-snug">
                    {ds.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#F5F5F7] text-xs text-[#6E6E73]">
                    <div>
                      Organism: <span className="text-[#1D1D1F] italic font-semibold">{ds.organism}</span>
                    </div>
                    <div>
                      Mission: <span className="text-[#1D1D1F] font-semibold">{ds.mission}</span>
                    </div>
                    <div>
                      Payload: <span className="text-[#1D1D1F] font-semibold">{ds.payload}</span>
                    </div>
                    <div>
                      Samples: <span className="text-[#0071E3] font-bold">{ds.samplesCount}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6E73] leading-relaxed mt-3">
                    {ds.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ds.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F7] border border-[#E5E5EA] text-[#6E6E73]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F5F5F7] flex items-center justify-between text-xs">
                  <span className="text-[#6E6E73]">DOI: {ds.doi}</span>
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#0071E3] hover:underline font-semibold"
                  >
                    <span>View on NASA OSDR</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Attribution statement */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] text-center text-xs text-[#6E6E73] shadow-sm">
            Source Attribution: {sourceAttribution} • Direct OSDR Portal: <a href="https://osdr.nasa.gov/" target="_blank" rel="noreferrer" className="text-[#0071E3] underline font-semibold">osdr.nasa.gov</a>
          </div>

        </div>
      )}

      {/* TAB 2: NASA Human Research Roadmap (HRR) */}
      {activeTab === 'hrp' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] leading-relaxed shadow-sm">
            <span className="font-bold text-[#0071E3] block mb-1 text-sm">
              NASA Human Research Program (HRP) Evidence Framework
            </span>
            The NASA Human Research Roadmap (HRR) catalogs evidence, risk mitigation pathways, and research gaps across 5 primary human spaceflight disciplines to protect crew health on exploration missions beyond Low Earth Orbit.
          </div>

          <div className="space-y-3">
            {hrpRisks.map((risk, i) => (
              <div key={i} className="p-6 rounded-2xl border border-[#E5E5EA] bg-white space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#EBF5FF] text-[#0071E3] font-bold">
                      {risk.riskId} • {risk.discipline}
                    </span>
                    <h3 className="text-base font-bold text-[#1D1D1F] mt-1.5">{risk.name}</h3>
                  </div>
                  <a
                    href={risk.roadmapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-[#0071E3] hover:underline font-semibold"
                  >
                    <span>NASA Roadmap Link</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  <span className="font-semibold text-[#1D1D1F]">Aerospace Concern: </span>
                  {risk.concern}
                </p>

                <div className="pt-2 border-t border-[#F5F5F7]">
                  <span className="text-xs text-[#0071E3] font-semibold uppercase tracking-wider block mb-1.5">
                    Primary NASA HRP Countermeasures:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {risk.countermeasures.map((cm: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-medium">
                        ✓ {cm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NASA CIPHER Research Integration */}
      {activeTab === 'cipher' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-[#E5E5EA] bg-white space-y-3 shadow-sm">
            <span className="px-3 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-xs font-semibold uppercase">
              Flagship Expedition Research
            </span>
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              NASA CIPHER: Complement of Integrated Protocols for Human Exploration Research
            </h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed max-w-3xl">
              CIPHER is the first multi-mission human research project that directly synthesizes up to 14 individual physiological, psychological, and biomedical studies across entire astronaut cohorts across short, standard, and extended spaceflights before missions to Mars.
            </p>
            <div className="pt-2">
              <a
                href="https://www.nasa.gov/about-cipher/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <span>Read Official NASA CIPHER Overview</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl border border-[#E5E5EA] bg-white space-y-2 shadow-sm">
              <Heart className="h-5 w-5 text-[#D93025]" />
              <h3 className="font-bold text-[#1D1D1F] text-sm">1. Cardiovascular &amp; SANS</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Investigating cephalad venous fluid pressure, carotid arterial stiffening, and optic sheath fluid accumulation behind the retina during extended lunar transit.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5E5EA] bg-white space-y-2 shadow-sm">
              <Dna className="h-5 w-5 text-[#0071E3]" />
              <h3 className="font-bold text-[#1D1D1F] text-sm">2. Immune &amp; Microbiome</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Profiling persistent T-cell dysregulation, subclinical latent herpesvirus reactivation, and microbial community shifts in Gateway closed environmental life support.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#E5E5EA] bg-white space-y-2 shadow-sm">
              <Brain className="h-5 w-5 text-[#8E8E93]" />
              <h3 className="font-bold text-[#1D1D1F] text-sm">3. Neurobehavioral Resilience</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Standardizing psychomotor vigilance tests, sleep EEG actigraphy, and autonomous behavioral countermeasures in 1.28s to 20-minute communication delays.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
