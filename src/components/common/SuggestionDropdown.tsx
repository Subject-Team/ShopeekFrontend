import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Check } from 'lucide-react';

const inputClass =
  'w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

interface SuggestionDropdownProps {
  value: string;
  items: string[];
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  disabled: boolean;
}

export const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  value,
  items,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter(item => item.toLowerCase().includes(query));
  }, [items, query]);

  const showCreate = query.length > 0 && !items.some(i => i.toLowerCase() === query);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClass} pl-10`}
          role="combobox"
          aria-expanded={open}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </span>
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5">
          {filtered.length > 0 ? (
            filtered.slice(0, 12).map(name => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onValueChange(name);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-right"
              >
                {value === name && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
                <span className="truncate">{name}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</p>
          )}

          {showCreate && (
            <button
              type="button"
              onClick={() => {
                onValueChange(value.trim());
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 font-semibold text-right border-t border-slate-100 dark:border-slate-700 mt-1"
            >
              <span>+ ایجاد «{value.trim()}»</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
