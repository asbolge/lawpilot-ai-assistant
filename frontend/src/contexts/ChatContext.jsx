// frontend/src/contexts/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendMessage, fetchLegalReferenceDetails } from '../utils/api';

// Chat Context oluştur
const ChatContext = createContext();

// Hook oluştur
export const useChatContext = () => useContext(ChatContext);

/**
 * Chat Context Provider bileşeni
 * @param {Object} props - Bileşen özellikleri
 */
export const ChatProvider = ({ children }) => {
  // State tanımlamaları
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentConversation, setCurrentConversation] = useState({
    id: 'default',
    title: 'Yeni Konuşma',
    messages: [],
    history: []
  });
  const [activeReferenceModal, setActiveReferenceModal] = useState(null);
  const [referenceData, setReferenceData] = useState(null);
  const [referenceLoading, setReferenceLoading] = useState(false);

  // Local Storage'dan konuşmaları yükle
  useEffect(() => {
    const savedConversations = localStorage.getItem('hukuki-asistan-conversations');
    const savedDarkMode = localStorage.getItem('hukuki-asistan-dark-mode');
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        
        // Aktif konuşmayı ayarla
        const lastConversationId = localStorage.getItem('hukuki-asistan-active-conversation');
        if (lastConversationId) {
          const lastConv = parsed.find(conv => conv.id === lastConversationId);
          if (lastConv) {
            setCurrentConversation(lastConv);
            setMessages(lastConv.messages);
          }
        }
      } catch (error) {
        console.error('Konuşma geçmişi yüklenirken hata:', error);
      }
    }
    
    // Koyu mod ayarını yükle
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Konuşmaları Local Storage'a kaydet
  useEffect(() => {
    localStorage.setItem('hukuki-asistan-conversations', JSON.stringify(conversations));
    localStorage.setItem('hukuki-asistan-active-conversation', currentConversation.id);
  }, [conversations, currentConversation]);

  // Koyu mod ayarını Local Storage'a kaydet
  useEffect(() => {
    localStorage.setItem('hukuki-asistan-dark-mode', darkMode);
  }, [darkMode]);

  /**
   * Yeni bir konuşma başlatır
   */
  const startNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: 'Yeni Konuşma',
      messages: [],
      history: [],
      createdAt: new Date().toISOString()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
    setMessages([]);
  };

  /**
   * Bir konuşmayı aktif hale getirir
   * @param {string} conversationId - Konuşma ID'si
   */
  const switchConversation = (conversationId) => {
    const selectedConversation = conversations.find(conv => conv.id === conversationId);
    if (selectedConversation) {
      setCurrentConversation(selectedConversation);
      setMessages(selectedConversation.messages);
    }
  };

  /**
   * Bir konuşmayı kaldırır
   * @param {string} conversationId - Konuşma ID'si
   */
  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    // Eğer aktif konuşma silindiyse yeni bir konuşma başlat
    if (currentConversation.id === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[0]);
        setMessages(updatedConversations[0].messages);
      } else {
        startNewConversation();
      }
    }
  };

  /**
   * Bir konuşmanın başlığını günceller
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} newTitle - Yeni başlık
   */
  const renameConversation = (conversationId, newTitle) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, title: newTitle } : conv
    );
    
    setConversations(updatedConversations);
    
    if (currentConversation.id === conversationId) {
      setCurrentConversation({ ...currentConversation, title: newTitle });
    }
  };

  /**
   * Kullanıcı mesajını gönderir ve API yanıtını alır
   * @param {string} message - Kullanıcı mesajı
   */
  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return;
    
    setLoading(true);
    
    // Kullanıcı mesajını ekle
    const userMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // API'ye gönder
      const response = await sendMessage(message, currentConversation.history);
      
      // Asistan yanıtını ekle
      const assistantMessage = { 
        role: 'assistant', 
        content: response.text,
        legalReferences: response.legalReferences || []
      };
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);
      
      // Konuşma geçmişini güncelle
      const newHistoryItem = {
        userQuestion: message,
        assistantResponse: response.text
      };
      
      const updatedHistory = [...currentConversation.history, newHistoryItem];
      
      // Aktif konuşmayı güncelle
      const updatedCurrentConversation = {
        ...currentConversation,
        messages: newMessages,
        history: updatedHistory,
        title: currentConversation.title === 'Yeni Konuşma' && updatedHistory.length === 1 
          ? truncateText(message, 30) 
          : currentConversation.title
      };
      
      setCurrentConversation(updatedCurrentConversation);
      
      // Tüm konuşmaları güncelle
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversation.id ? updatedCurrentConversation : conv
      );
      
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      
      // Hata mesajını ekle
      const errorMessage = { 
        role: 'assistant', 
        content: 'Mesajınız işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
        error: true
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Yasal referans detaylarını gösterir
   * @param {string} reference - Yasal referans
   */
  const showLegalReferenceDetails = async (reference) => {
    setActiveReferenceModal(reference);
    setReferenceLoading(true);
    
    try {
      const data = await fetchLegalReferenceDetails(reference);
      setReferenceData(data);
    } catch (error) {
      console.error('Referans detayları alınırken hata:', error);
      setReferenceData(null);
    } finally {
      setReferenceLoading(false);
    }
  };

  /**
   * Koyu mod durumunu değiştirir
   */
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  /**
   * Metni belirli bir uzunlukta kısaltır
   * @param {string} text - Metin
   * @param {number} maxLength - Maksimum uzunluk
   * @returns {string} - Kısaltılmış metin
   */
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Provider değerlerini oluştur
  const contextValue = {
    messages,
    loading,
    conversations,
    currentConversation,
    darkMode,
    activeReferenceModal,
    referenceData,
    referenceLoading,
    startNewConversation,
    switchConversation,
    deleteConversation,
    renameConversation,
    handleSendMessage,
    showLegalReferenceDetails,
    closeLegalReferenceModal: () => setActiveReferenceModal(null),
    toggleDarkMode
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};