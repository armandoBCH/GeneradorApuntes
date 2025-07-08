import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="p-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white">
                    Apunte Perfecto <span className="text-cyan-400">AI</span>
                </h1>
            </div>
        </header>
    );
};

const BookOpen: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);


export default Header;
