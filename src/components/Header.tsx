import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Sun, 
  Moon, 
  Sparkles, 
  Layers, 
  Beaker, 
  FileCode2, 
  UploadCloud, 
  UserCheck
} from 'lucide-react';
import { Role } from '../types/passport';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  researchMode: boolean;
  onToggleResearchMode: () => void;
  onOpenCustomBuilder: () => void;
  onExecuteNlQuery: (query: string) => void;
}

const ROLES: Role[] = [
  'Data Engineer',
  'Data Analyst',
  'Data Scientist',
  'ML Engineer',
  'Business Analyst',
  'AI Engineer',
  'Backend Engineer',
  'Platform Engineer',
  'Research Engineer',
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isDarkMode,
  onToggleDarkMode,
  seniorMode,
  onToggleSeniorMode,
  researchMode,
  onToggleResearchMode,
  onOpenCustomBuilder,
  onExecuteNlQuery,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [showQueryBox, setShowQueryBox] = useState(false);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      onExecuteNlQuery(queryInput.trim());
      setShowQueryBox(false);
    }
  };

  const sampleQueries = [
    'Show monthly revenue for enterprise customers',
    'Show revenue for APAC region',
    'Average order value for mid-market',
  ];

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 dark:text-stone-100 tracking-tight text-base">
                  DataPassport
                </span>
                <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 hidden sm:block">
                Metric Lineage · Evidence · Trust Engine
              </p>
            </div>
          </div>

          {/* Quick NLP Query Bar */}
          <div className="flex-1 max-w-lg hidden md:block relative">
            <form onSubmit={handleQuerySubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onFocus={() => setShowQueryBox(true)}
                placeholder="Ask: 'Show monthly revenue for enterprise customers'..."
                className="w-full pl-9 pr-24 py-1.5 text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[11px] font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
              >
                Compile
              </button>
            </form>

            {/* Quick Suggestions Dropdown */}
            {showQueryBox && (
              <div 
                className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-lg p-2 z-50 text-xs"
                onMouseLeave={() => setShowQueryBox(false)}
              >
                <div className="text-[11px] text-stone-500 dark:text-stone-400 px-2 py-1 font-medium">
                  Deterministic Analysis Queries:
                </div>
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryInput(q);
                      onExecuteNlQuery(q);
                      setShowQueryBox(false);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-700 dark:text-stone-300 flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <span className="text-[10px] text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 font-mono">
                      Run →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Center & Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Custom CSV Upload */}
            <button
              onClick={onOpenCustomBuilder}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 transition-colors"
              title="Upload CSV & Mint Metric Passport"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Mint CSV</span>
            </button>

            {/* Research Mode Toggle */}
            <button
              onClick={onToggleResearchMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                researchMode 
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
                  : 'text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900'
              }`}
              title="Compare Experiment Versions & Definitions"
            >
              <Beaker className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Research</span>
            </button>

            {/* Senior Mode Toggle */}
            <button
              onClick={onToggleSeniorMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                seniorMode 
                  ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900' 
                  : 'text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900'
              }`}
              title="Contracts, Lineage APIs, SLAs, Audit Logs, ADRs"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Senior Mode</span>
            </button>

            {/* Role Lens Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-800">
              <UserCheck className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                aria-label="Select active persona lens"
                className="bg-transparent text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer pr-1"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                    {role} Lens
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
