// frontend/src/components/LegalReferenceModal.jsx

import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

/**
 * Yasal referans detaylarını gösteren modal bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {string} props.reference - Yasal referans
 * @param {Object} props.data - Referans verileri
 * @param {boolean} props.loading - Yükleniyor durumu
 * @param {Function} props.onClose - Kapatma işlevi
 */
function LegalReferenceModal({ reference, data, loading, onClose }) {
  const { darkMode } = useChatContext();
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlık */}
        <div className={`border-b px-4 py-3 flex justify-between items-center ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className="font-bold">{reference}</h3>
          <button 
            onClick={onClose} 
            className={`text-gray-500 hover:text-gray-700 ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : ''
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        {/* Modal İçerik */}
        <div className={`p-4 overflow-y-auto max-h-[calc(80vh-8rem)] ${
          darkMode ? 'text-gray-200' : ''
        }`}>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : data ? (
            <div>
              <div className="mb-4">
                <h4 className={`font-semibold text-lg ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Kanun Metni
                </h4>
                <div className={`mt-2 p-3 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {data.text}
                </div>
              </div>
              
              {data.relatedCases && data.relatedCases.length > 0 && (
                <div className="mb-4">
                  <h4 className={`font-semibold text-lg ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    İlgili İçtihatlar
                  </h4>
                  <div className="mt-2">
                    {data.relatedCases.map((case_, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 mb-2 rounded border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{case_.title}</div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {case_.court} - {case_.date}
                        </div>
                        <div className="mt-1">{case_.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {data.doctrinePerspectives && (
                <div className="mb-4">
                  <h4 className={`font-semibold text-lg ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Doktrindeki Görüşler
                  </h4>
                  <div className={`mt-2 p-3 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {data.doctrinePerspectives}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>Bu referans için detaylı bilgi bulunamadı.</p>
            </div>
          )}
        </div>
        
        {/* Modal Alt Kısım */}
        <div className={`border-t px-4 py-3 flex justify-end ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalReferenceModal;