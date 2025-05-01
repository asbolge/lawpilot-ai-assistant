// frontend/src/App.jsx

import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { useChatContext } from './contexts/ChatContext';

/**
 * Ana uygulama bileşeni
 */
function App() {
  const { darkMode } = useChatContext();
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatContainer />
      </main>
    </div>
  );
}

export default App;