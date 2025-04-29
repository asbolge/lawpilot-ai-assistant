// frontend/src/components/Sidebar.jsx

import React, { useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Konuşma geçmişini gösteren kenar çubuğu bileşeni
 */
function Sidebar() {
  const { 
    conversations, 
    currentConversation, 
    switchConversation, 
    deleteConversation,
    renameConversation,
    darkMode
  } = useChatContext();
  
  const [isEditing, setIsEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Düzenleme modunu başlat
  const startEditing = (conversation) => {
    setIsEditing(conversation.id);
    setEditTitle(conversation.title);
  };
  
  // Başlık güncellemesini kaydet
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editTitle.trim() && isEditing) {
      renameConversation(isEditing, editTitle);
      setIsEditing(null);
    }
  };
  
  // Konuşma tarihini formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  // Mobil ekranlarda kenar çubuğunu aç/kapat
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <>
      {/* Mobil ekranlarda açma/kapama butonu */}
      <button
        className={`md:hidden fixed top-16 left-4 z-20 p-2 rounded-md ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
        onClick={toggleSidebar}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
          />
        </svg>
      </button>
      
      {/* Kenar çubuğu */}
      <aside className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block 
        w-64 
        md:w-80 
        border-r 
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        overflow-y-auto
        z-10
        md:relative
        fixed
        top-0
        left-0
        h-full
        pt-14
        md:pt-0
      `}>
        <div className="p-4">
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Konuşmalar
          </h2>
          
          {conversations.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Henüz bir konuşma bulunmuyor.</p>
              <p className="text-sm mt-2">Yeni bir konuşma başlatmak için sağ üstteki butonu kullanabilirsiniz.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  {isEditing === conversation.id ? (
                    <form onSubmit={handleSaveEdit} className="flex items-center">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={`flex-1 p-2 rounded-md border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className={`ml-2 p-1 rounded-md ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
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
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </button>
                    </form>
                  ) : (
                    <div
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        currentConversation.id === conversation.id
                          ? darkMode 
                            ? 'bg-gray-700 text-white'
                            : 'bg-blue-50 text-blue-800'
                          : darkMode 
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => switchConversation(conversation.id)}
                    >
                      <div className="flex-1 truncate">
                        <p className="font-medium">{conversation.title}</p>
                        {conversation.createdAt && (
                          <p className="text-xs opacity-70 mt-1">
                            {formatDate(conversation.createdAt)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conversation);
                          }}
                          className={`p-1 rounded-md ${
                            darkMode 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                          aria-label="Konuşma adını düzenle"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                            />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu konuşmayı silmek istediğinize emin misiniz?')) {
                              deleteConversation(conversation.id);
                            }
                          }}
                          className={`p-1 rounded-md ml-1 ${
                            darkMode 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                          aria-label="Konuşmayı sil"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;