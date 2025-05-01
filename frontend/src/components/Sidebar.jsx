// frontend/src/components/Sidebar.jsx

import React, { useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import DocumentUploader from './DocumentUploader';
import DocumentList from './DocumentList';
import PetitionForm from './PetitionForm';

/**
 * Sidebar bileşeni
 */
function Sidebar() {
  const { 
    conversations, 
    currentConversation, 
    startNewConversation, 
    switchConversation, 
    deleteConversation,
    renameConversation,
    darkMode,
    documents,
    petitions
  } = useChatContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations', 'documents', 'petitions'
  
  /**
   * Tarih formatlar
   * @param {string} dateString - ISO tarih formatı
   * @returns {string} - Formatlanmış tarih
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // Bugün
    if (date.toDateString() === now.toDateString()) {
      return 'Bugün';
    }
    
    // Dün
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    }
    
    // Diğer günler
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };
  
  /**
   * Konuşma düzenleme modunu başlatır
   * @param {string} id - Konuşma ID'si
   * @param {string} title - Mevcut başlık
   * @param {Event} e - Tıklama olayı
   */
  const startEditing = (id, title, e) => {
    e.stopPropagation();
    setEditingConversationId(id);
    setEditingTitle(title);
  };
  
  /**
   * Konuşma başlığının düzenlenmesini kaydeder
   * @param {Event} e - Form gönderme olayı
   */
  const saveEditing = (e) => {
    e.preventDefault();
    if (editingTitle.trim()) {
      renameConversation(editingConversationId, editingTitle);
    }
    setEditingConversationId(null);
  };
  
  /**
   * Konuşmayı siler
   * @param {string} id - Konuşma ID'si
   * @param {Event} e - Tıklama olayı
   */
  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteConversation(id);
  };
  
  /**
   * Mobil menüyü açar/kapatır
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * İçerik sekmelerini değiştirir
   * @param {string} tab - Sekme adı
   */
  const switchTab = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <>
      {/* Mobil menü butonu */}
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
      
      {/* Mobil menü arkaplanı */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Kenar çubuğu */}
      <aside className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block 
        w-64 
        md:w-80 
        border-r 
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        overflow-y-auto
        z-20
        md:relative
        fixed
        top-0
        left-0
        h-full
        pt-14
        md:pt-0
      `}>
        <div className="p-4">
          {/* Yeni Konuşma butonu */}
          <div className="mb-4">
            <button
              onClick={startNewConversation}
              className={`w-full py-2 px-3 rounded-lg flex items-center justify-center ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Konuşma
            </button>
          </div>
          
          {/* Sekmeler */}
          <div className={`mb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <div className="flex">
              <button
                onClick={() => switchTab('conversations')}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'conversations'
                    ? darkMode 
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Konuşmalar
              </button>
              <button
                onClick={() => switchTab('documents')}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? darkMode 
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Belgeler {documents.length > 0 && `(${documents.length})`}
              </button>
              <button
                onClick={() => switchTab('petitions')}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'petitions'
                    ? darkMode 
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dilekçeler {petitions.length > 0 && `(${petitions.length})`}
              </button>
            </div>
          </div>
          
          {/* İçerik alanı */}
          <div>
            {activeTab === 'documents' && (
              <div>
                <DocumentUploader />
                <DocumentList />
              </div>
            )}

            {activeTab === 'petitions' && (
              <div>
                <PetitionForm />
              </div>
            )}
            
            {activeTab === 'conversations' && (
              conversations.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Henüz bir konuşma bulunmuyor.</p>
                  <p className="text-sm mt-2">Yeni bir konuşma başlatmak için yukarıdaki butonu kullanabilirsiniz.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {conversations
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))  // Konuşmaları oluşturulma tarihine göre sırala (en son en üstte)
                    .map((conversation) => (
                    <li key={conversation.id}>
                      {editingConversationId === conversation.id ? (
                        <form onSubmit={saveEditing} className="flex items-center">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
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
                            currentConversation && currentConversation.id === conversation.id
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
                              onClick={(e) => startEditing(conversation.id, conversation.title, e)}
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
                                  handleDelete(conversation.id, e);
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
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;