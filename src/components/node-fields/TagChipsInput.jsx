import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TagChipsInput({ value = [], onChange, placeholder = 'Type and press Enter...' }) {
  const [inputVal, setInputVal] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInputVal('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="min-h-[38px] flex flex-wrap gap-1.5 items-center p-2 rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-200">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[12px] font-medium border border-primary/20"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
            aria-label={`Remove ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputVal.trim() && addTag(inputVal)}
        placeholder={value.length === 0 ? placeholder : ''}
        className={cn(
          'flex-1 min-w-[120px] outline-none bg-transparent text-[13px] text-text-dark placeholder:text-text-light',
        )}
      />
    </div>
  );
}
