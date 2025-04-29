// frontend/src/components/Header.jsx

import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Uygulama başlık çubuğu bileşeni
 */
function Header() {
  const { darkMode, toggleDarkMode, startNewConversation } = useChatContext();
  
  return (
    <header className={`flex justify-between items-center px-4 py-2 border-b ${
      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Hukuki Asistan</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Yeni konuşma butonu */}
        <button
          onClick={startNewConversation}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <span className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Yeni Konuşma
          </span>
        </button>
        
        {/* Koyu/Açık mod butonu */}
        <button
          onClick={toggleDarkMode}
          className={`p-1.5 rounded-full ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label={darkMode ? 'Açık moda geç' : 'Koyu moda geç'}
        >
          {darkMode ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;