// frontend/src/components/ChatContainer.jsx

import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import DocumentView from './DocumentView';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Ana sohbet alanı bileşeni
 */
function ChatContainer() {
  const { 
    messages, 
    loading, 
    handleSendMessage,
    darkMode,
    documentView
  } = useChatContext();
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  
  // Mesaj alanına otomatik kaydırma
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Form gönderme işleyicisi
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !loading) {
      handleSendMessage(inputText);
      setInputText('');
    }
  };
  
  // Doküman görünümünü aktif ise onu göster
  if (documentView) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        <DocumentView />
      </div>
    );
  }
  
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-lg m-2`}>
      {/* Mesajlar Alanı */}
      {messages.length === 0 ? (
        <div className={`flex-1 flex items-center justify-center p-4 text-center ${
          darkMode ? 'text-gray-300' : 'text-gray-800'
        }`}>
          <div className="max-w-md">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Hukuki Asistana Hoş Geldiniz
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Yasal mevzuat, yönerge ve genelgelerle ilgili sorularınızı sorabilirsiniz.
            </p>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
              <h3 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
                Örnek Sorular:
              </h3>
              <ul className={`${darkMode ? 'text-gray-300' : 'text-blue-600'} text-sm space-y-2`}>
                <li>"İş sözleşmesi feshedildiğinde hangi tazminatları talep edebilirim?"</li>
                <li>"Kiracı olarak haklarım nelerdir?"</li>
                <li>"İdari para cezasına itiraz süresi ne kadardır?"</li>
                <li>"4857 sayılı İş Kanunu'nun 17. maddesi ne der?"</li>
                <li>"Boşanma davası açmak için hangi belgelere ihtiyaç var?"</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className={`flex-1 overflow-y-auto p-4 ${
            darkMode ? 'scrollbar-dark' : 'scrollbar-light'
          }`}
        >
          {messages.map((message, index) => (
            <Message
              key={index}
              role={message.role}
              content={message.content}
              legalReferences={message.legalReferences || []}
              documentContext={message.documentContext}
              documentName={message.documentName}
              error={message.error}
            />
          ))}
          {loading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Mesaj Girişi */}
      <form 
        onSubmit={handleSubmit} 
        className={`border-t p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hukuki sorunuzu yazın..."
            className={`flex-1 rounded-l-lg px-4 py-2 border focus:outline-none focus:ring-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 focus:ring-blue-500'
            }`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className={`px-4 py-2 rounded-r-lg ${
              loading || !inputText.trim()
                ? darkMode 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-300 text-white cursor-not-allowed'
                : darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatContainer;