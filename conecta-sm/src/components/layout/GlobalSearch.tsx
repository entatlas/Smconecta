'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Users, Building2, Briefcase } from 'lucide-react';
import { globalSearch } from '@/app/admin/search/actions';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ candidates: [], companies: [], jobs: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ candidates: [], companies: [], jobs: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.candidates.length + results.companies.length + results.jobs.length;

  const handleNavigate = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  return (
    <div className="relative flex-1 max-w-[400px]" ref={dropdownRef}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-subtle, var(--color-bg-main))',
        borderRadius: 'var(--radius-full)',
        padding: '0.45rem 1rem',
        border: '1px solid var(--color-border)',
        width: '100%',
      }}>
        {loading ? (
          <Loader2 size={14} className="text-blue-500 animate-spin mr-2 shrink-0" />
        ) : (
          <Search size={14} color="var(--color-text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
        )}
        <input
          type="text"
          placeholder="Busca global..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setIsOpen(true) }}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'var(--color-text-primary)',
            width: '100%',
            fontSize: '0.85rem',
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading && totalResults === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">Buscando...</div>
          )}
          
          {!loading && totalResults === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">Nenhum resultado encontrado para "{query}"</div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {results.candidates.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <Users size={12} /> Candidatos
                </div>
                {results.candidates.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => handleNavigate(`/admin/candidatos/${c.candidate?.id || c.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex flex-col group"
                  >
                    <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400">{c.nome}</span>
                    <span className="text-xs text-slate-500">{c.email}</span>
                  </button>
                ))}
              </div>
            )}

            {results.companies.length > 0 && (
              <div className="p-2 border-t border-slate-800/50">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <Building2 size={12} /> Empresas
                </div>
                {results.companies.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => handleNavigate(`/admin/empresas/${c.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex flex-col group"
                  >
                    <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400">{c.companyName}</span>
                    <span className="text-xs text-slate-500">{c.industry || 'Empresa parceira'}</span>
                  </button>
                ))}
              </div>
            )}

            {results.jobs.length > 0 && (
              <div className="p-2 border-t border-slate-800/50">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                  <Briefcase size={12} /> Vagas
                </div>
                {results.jobs.map((j: any) => (
                  <button
                    key={j.id}
                    onClick={() => handleNavigate(`/admin/vagas/${j.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex flex-col group"
                  >
                    <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-400">{j.title}</span>
                    <span className="text-xs text-slate-500">{j.company?.companyName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
