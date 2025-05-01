/**
 * Dilekçe HTML şablon dosyası
 * Bu dosya, dilekçelerin HTML formatında oluşturulması için şablon sağlar
 */

/**
 * Dilekçe HTML şablonu oluşturur
 * @param {string} content - Dilekçe metni
 * @param {Object} userDetails - Kullanıcı bilgileri
 * @param {Object} receiver - Alıcı bilgileri
 * @param {string} dateStr - Tarih
 * @returns {string} - HTML şablonu
 */
const createPetitionTemplate = (content, userDetails, receiver, dateStr) => {
  // Paragrafları oluştur
  const paragraphs = content
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `<p>${line}</p>`)
    .join('');

  // HTML şablonu
  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dilekçe</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
        
        body {
          font-family: 'Noto Serif', 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
          background-color: white;
        }
        
        .container {
          width: 21cm;
          min-height: 29.7cm;
          padding: 2cm;
          box-sizing: border-box;
          background-color: white;
        }
        
        .date {
          text-align: right;
          margin-bottom: 1cm;
          font-weight: normal;
        }
        
        .receiver {
          text-align: center;
          margin-bottom: 1cm;
        }
        
        .receiver h2 {
          font-size: 14pt;
          margin: 5px 0;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .subject {
          font-weight: bold;
          margin-bottom: 1cm;
        }
        
        .content {
          text-align: justify;
          margin-bottom: 1cm;
        }
        
        .content p {
          margin-bottom: 0.5cm;
          text-align: justify;
          line-height: 1.5;
        }
        
        .signature {
          text-align: right;
          margin-bottom: 0.8cm;
        }
        
        .signature p {
          margin: 5px 0;
        }
        
        .personal-info {
          display: flex;
          justify-content: space-between;
          margin-top: 1cm;
          border-top: 1px solid #ddd;
          padding-top: 0.5cm;
        }
        
        .contact-info {
          width: 60%;
        }
        
        .signature-date {
          width: 35%;
          text-align: right;
        }
        
        .contact-info p, .signature-date p {
          margin: 3px 0;
          line-height: 1.3;
        }
        
        .signature-line {
          display: inline-block;
          width: 150px;
          border-bottom: 1px solid #000;
          margin-left: 5px;
          position: relative;
          top: -3px;
        }
        
        @page {
          size: A4;
          margin: 0;
        }
        
        @media print {
          html, body {
            width: 210mm;
            height: 297mm;
          }
          
          .container {
            padding: 20mm;
            width: 100%;
            height: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Tarih -->
        <div class="date">
          <p>${dateStr}</p>
        </div>
        
        <!-- Alıcı Bilgileri -->
        <div class="receiver">
          <h2>${receiver.name}</h2>
          ${receiver.department ? `<h2>${receiver.department}</h2>` : ''}
        </div>
        
        <!-- Konu -->
        <div class="subject">
          <p>KONU: ${userDetails.subject || 'Dilekçe'}</p>
        </div>
        
        <!-- İçerik -->
        <div class="content">
          ${paragraphs}
        </div>
        
        <!-- İmza -->
        <div class="signature">
          <p>Saygılarımla,</p>
          <p><strong>${userDetails.name}</strong></p>
        </div>
        
        <!-- Alt Bilgi -->
        <div class="personal-info">
          <div class="contact-info">
            <p><strong>Adres:</strong> ${userDetails.address}</p>
            ${userDetails.phone ? `<p><strong>Telefon:</strong> ${userDetails.phone}</p>` : ''}
            ${userDetails.email ? `<p><strong>E-posta:</strong> ${userDetails.email}</p>` : ''}
            ${userDetails.tcNo ? `<p><strong>T.C. Kimlik No:</strong> ${userDetails.tcNo}</p>` : ''}
          </div>
          
          <div class="signature-date">
            <p><strong>Tarih:</strong> ${dateStr}</p>
            <p><strong>İmza:</strong><span class="signature-line"></span></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

module.exports = { createPetitionTemplate }; 