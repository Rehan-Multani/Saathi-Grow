import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

const MultiCategoryDropdown = ({
    categories = [],
    selected = [],
    onChange,
    placeholder = 'Choose categories',
    disabled = false,
    className = '',
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleCategory = (name) => {
        if (selected.includes(name)) {
            onChange(selected.filter((item) => item !== name));
            return;
        }
        onChange([...selected, name]);
    };

    const label = selected.length > 0
        ? `${selected.length} categor${selected.length > 1 ? 'ies' : 'y'} selected`
        : placeholder;

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selected.length === 0 ? 'text-slate-400' : 'text-slate-800'}`}
            >
                <span className="truncate font-bold">{label}</span>
                <ChevronDown size={16} className={`shrink-0 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selected.map((name) => (
                        <span
                            key={name}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700"
                        >
                            {name}
                            <button
                                type="button"
                                onClick={() => toggleCategory(name)}
                                className="text-blue-500 hover:text-blue-700"
                                aria-label={`Remove ${name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto pt-1 pb-1">
                    {categories.length === 0 && (
                        <li className="px-4 py-3 text-sm text-slate-400 text-center flex items-center justify-center gap-2">
                            <Search size={14} />
                            No categories available
                        </li>
                    )}
                    {categories.map((cat) => {
                        const isSelected = selected.includes(cat.name);
                        return (
                            <li
                                key={cat._id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(cat.name);
                                }}
                                className="px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-3"
                            >
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white'}`}>
                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={isSelected ? 'font-semibold text-slate-800' : 'text-slate-600'}>{cat.name}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MultiCategoryDropdown;
