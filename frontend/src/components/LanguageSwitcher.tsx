import React from 'react';
//import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const current = i18n.language;

  return (
    <div style={{ display: 'flex', gap: '8px', marginRight: '20px' }}>
      <button
        onClick={() => changeLang('en')}
        style={{
          padding: '4px 8px',
          border: current === 'en' ? '2px solid #007bff' : '1px solid #fff',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        English
      </button>

      <button
        onClick={() => changeLang('zh')}
        style={{
          padding: '4px 8px',
          border: current === 'zh' ? '2px solid #007bff' : '1px solid #fff',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        中文
      </button>

      <button
        onClick={() => changeLang('es')}
        style={{
          padding: '4px 8px',
          border: current === 'es' ? '2px solid #007bff' : '1px solid #fff',
          background: 'transparent',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Español
      </button>
    </div>
  );
};

export default LanguageSwitcher;
