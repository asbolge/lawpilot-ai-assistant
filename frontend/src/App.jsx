// frontend/src/App.jsx

import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import TestLegalReference from './components/TestLegalReference';
import { useChatContext } from './contexts/ChatContext';

/**
 * Ana uygulama bileşeni
 */
function App() {
  const { darkMode } = useChatContext();
  const [showTest, setShowTest] = useState(false);
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <div className="flex justify-center py-2">
        <button 
          onClick={() => setShowTest(!showTest)}
          className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {showTest ? 'Ana Uygulamaya Dön' : 'Kanun Referans Test Ekranını Göster'}
        </button>
      </div>
      <main className="flex flex-1 overflow-hidden">
        {showTest ? (
          <div className="w-full overflow-auto">
            <TestLegalReference />
          </div>
        ) : (
          <>
            <Sidebar />
            <ChatContainer />
          </>
        )}
      </main>
    </div>
  );
}

export default App;