import React from 'react';
import { useChatContext } from '../contexts/ChatContext';

// Bilinen kanunlar ve numaraları
const KNOWN_LAWS = {
  // Temel kanunlar
  'TMK': { number: '4721', name: 'Türk Medeni Kanunu' },
  'TBK': { number: '6098', name: 'Türk Borçlar Kanunu' },
  'HMK': { number: '6100', name: 'Hukuk Muhakemeleri Kanunu' },
  'İYUK': { number: '2577', name: 'İdari Yargılama Usulü Kanunu' },
  'IYUK': { number: '2577', name: 'İdari Yargılama Usulü Kanunu' },
  'TTK': { number: '6102', name: 'Türk Ticaret Kanunu' },
  'İş Kanunu': { number: '4857', name: 'İş Kanunu' },
  'Is Kanunu': { number: '4857', name: 'İş Kanunu' },
  'TKHK': { number: '6502', name: 'Tüketicinin Korunması Hakkında Kanun' },
  'TCK': { number: '5237', name: 'Türk Ceza Kanunu' },
  'CMK': { number: '5271', name: 'Ceza Muhakemesi Kanunu' },
  'İİK': { number: '2004', name: 'İcra ve İflas Kanunu' },
  'IIK': { number: '2004', name: 'İcra ve İflas Kanunu' },
  'VUK': { number: '213', name: 'Vergi Usul Kanunu' },
  'SGK': { number: '5510', name: 'Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu' },
  'KVKK': { number: '6698', name: 'Kişisel Verilerin Korunması Kanunu' },
  'AYM': { number: '6216', name: 'Anayasa Mahkemesinin Kuruluşu ve Yargılama Usulleri Hakkında Kanun' },
  'KHK': { number: '', name: 'Kanun Hükmünde Kararname' },
  'HUMK': { number: '1086', name: 'Hukuk Usulü Muhakemeleri Kanunu' },
  // Ek kanunlar
  'SPK': { number: '6362', name: 'Sermaye Piyasası Kanunu' },
  'BTK': { number: '5809', name: 'Elektronik Haberleşme Kanunu' },
  'ÇK': { number: '4857', name: 'Çalışma Kanunu' },
  'FSEK': { number: '5846', name: 'Fikir ve Sanat Eserleri Kanunu' },
  'SK': { number: '7166', name: 'Sosyal Hizmetler Kanunu' },
  'KVK': { number: '5520', name: 'Kurumlar Vergisi Kanunu' },
  'GVK': { number: '193', name: 'Gelir Vergisi Kanunu' },
  'ASK': { number: '5718', name: 'Milletlerarası Özel Hukuk ve Usul Hukuku Hakkında Kanun' },
  'AK': { number: '2709', name: 'Türkiye Cumhuriyeti Anayasası' }
};

/**
 * Kanun maddeleri için tıklanabilir link bileşeni
 * @param {Object} props - Bileşen özellikleri
 * @param {Object} props.reference - Yasal referans verisi
 * @param {string} props.className - Ek CSS sınıfı
 */
const LegalReferenceLink = ({ reference, className = '' }) => {
  const { darkMode } = useChatContext();

  // Referansın link URL'ini oluştur
  const getLegalReferenceUrl = (ref) => {
    // Eğer URL doğrudan geldiyse kullan
    if (ref.url) {
      return ref.url;
    }

    // URL yoksa oluştur
    const kanunNo = ref.number || '';
    const maddeNo = ref.article || '';

    if (kanunNo && maddeNo) {
      return `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=${kanunNo}&MevzuatTur=1&MevzuatTertip=5#MADDE_${maddeNo}`;
    }

    return '#';
  };

  // Referans görüntü metnini oluştur
  const getReferenceDisplayText = (ref) => {
    // Doğrudan görüntü metni verilmişse
    if (ref.text) {
      // Yıldız ve tırnak işaretlerini temizle
      return ref.text.replace(/[\*"]/g, '');
    } 
    
    // Kanun numarası, ismi ve madde numarası varsa (tam format)
    if (ref.number && ref.name && ref.article) {
      return `${ref.number} sayılı ${ref.name} Madde ${ref.article}`;
    } 
    
    // Varsayılan gösterim
    return `${ref.name || ''} ${ref.article ? `Madde ${ref.article}` : ''}`;
  };
  
  // Referans için tooltip metni oluştur
  const getTooltipText = (ref) => {
    // Tam kanun adı ve madde numarasından oluşan tooltip
    if (ref.number && ref.name && ref.article) {
      return `${ref.number} sayılı ${ref.name} Madde ${ref.article} - Mevzuat bağlantısını aç`;
    } 
    
    if (ref.name && ref.article) {
      return `${ref.name} Madde ${ref.article} - Mevzuat bağlantısını aç`;
    }
    
    return 'Kanun maddesini görüntüle';
  };

  // Referans link URL'i
  const referenceUrl = getLegalReferenceUrl(reference);
  // Referans gösterim metni
  const displayText = getReferenceDisplayText(reference);
  // Tooltip metni
  const tooltipText = getTooltipText(reference);

  return (
    <a
      href={referenceUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={tooltipText}
      className={`law-link ${className} ${
        darkMode
          ? 'text-blue-300 hover:text-blue-100 hover:bg-blue-900/30'
          : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
      } transition-all duration-200 inline-flex items-center rounded px-2 py-1 text-sm font-medium`}
    >
      <span className="law-text">{displayText}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className="w-3.5 h-3.5 ml-1 mb-0.5"
      >
        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
      </svg>
    </a>
  );
};

export default LegalReferenceLink; 