// frontend/src/components/LoadingIndicator.jsx

import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Yükleniyor göstergesi bileşeni
 */
function LoadingIndicator() {
  const { darkMode } = useChatContext();
  
  return (
    <div className="flex items-center mb-4">
      <div 
        className={`inline-block max-w-3xl rounded-lg p-3 ${
          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="font-bold mb-1">Hukuki Asistan</div>
        <div className="flex items-center">
          <div className="animate-pulse flex space-x-2">
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
          </div>
          <span className="ml-3 text-sm">Cevap hazırlanıyor...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingIndicator;