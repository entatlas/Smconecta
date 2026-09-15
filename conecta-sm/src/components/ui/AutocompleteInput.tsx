'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input/Input';
import { ChevronDown } from 'lucide-react';

export function AutocompleteInput({ 
  label, value, onChange, options, placeholder 
}: { 
  label: string, value: string, onChange: (val: string) => void, options: string[], placeholder?: string 
}) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val.trim() === '') {
      setFiltered(options);
      setOpen(true);
    } else {
      const match = options.filter(o => o.toLowerCase().includes(val.toLowerCase()));
      setFiltered(match);
      setOpen(match.length > 0);
    }
  };

  const handleFocus = () => {
    if (value.trim() === '') {
      setFiltered(options);
    } else {
      setFiltered(options.filter(o => o.toLowerCase().includes(value.toLowerCase())));
    }
    setOpen(true);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Input 
          label={label} 
          value={value} 
          onChange={handleInputChange} 
          placeholder={placeholder}
          onFocus={handleFocus}
          autoComplete="off"
        />
        <ChevronDown 
          size={16} 
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: label ? '36px' : '50%', 
            transform: label ? 'none' : 'translateY(-50%)', 
            color: '#8B9BB4',
            pointerEvents: 'none'
          }} 
        />
      </div>
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '220px',
          overflowY: 'auto',
          backgroundColor: '#031225',
          border: '1px solid #11284A',
          borderRadius: '8px',
          zIndex: 9999,
          marginTop: '4px',
          listStyle: 'none',
          padding: '4px 0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {filtered.map(opt => (
            <li 
              key={opt}
              style={{ padding: '10px 16px', cursor: 'pointer', color: '#EAF2FF', fontSize: '0.9rem', transition: 'background-color 0.1s' }}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#061A32'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
