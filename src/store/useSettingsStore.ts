import { create } from 'zustand';

export interface SettingsState {
  theme: 'dark' | 'high-contrast';
  largeButtonMode: boolean;
  simpleLanguageMode: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
  ttsVoiceIndex: number;
  ttsRate: number;
  voiceNavigationEnabled: boolean;
  
  setTheme: (theme: 'dark' | 'high-contrast') => void;
  setLargeButtonMode: (enabled: boolean) => void;
  setSimpleLanguageMode: (enabled: boolean) => void;
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  setTtsVoiceIndex: (index: number) => void;
  setTtsRate: (rate: number) => void;
  setVoiceNavigationEnabled: (enabled: boolean) => void;
  initFromStorage: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  largeButtonMode: false,
  simpleLanguageMode: false,
  textSize: 'normal',
  ttsVoiceIndex: 0,
  ttsRate: 1.0,
  voiceNavigationEnabled: false,

  setTheme: (theme) => {
    localStorage.setItem('pm_theme', theme);
    if (theme === 'high-contrast') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    set({ theme });
  },

  setLargeButtonMode: (largeButtonMode) => {
    localStorage.setItem('pm_large_button', String(largeButtonMode));
    if (largeButtonMode) {
      document.body.classList.add('large-button-mode');
    } else {
      document.body.classList.remove('large-button-mode');
    }
    set({ largeButtonMode });
  },

  setSimpleLanguageMode: (simpleLanguageMode) => {
    localStorage.setItem('pm_simple_lang', String(simpleLanguageMode));
    set({ simpleLanguageMode });
  },

  setTextSize: (textSize) => {
    localStorage.setItem('pm_text_size', textSize);
    document.documentElement.setAttribute('data-text-size', textSize);
    set({ textSize });
  },

  setTtsVoiceIndex: (ttsVoiceIndex) => {
    localStorage.setItem('pm_tts_voice', String(ttsVoiceIndex));
    set({ ttsVoiceIndex });
  },

  setTtsRate: (ttsRate) => {
    localStorage.setItem('pm_tts_rate', String(ttsRate));
    set({ ttsRate });
  },

  setVoiceNavigationEnabled: (voiceNavigationEnabled) => {
    localStorage.setItem('pm_voice_nav', String(voiceNavigationEnabled));
    set({ voiceNavigationEnabled });
  },

  initFromStorage: () => {
    const savedTheme = (localStorage.getItem('pm_theme') as 'dark' | 'high-contrast') || 'dark';
    const savedLargeBtn = localStorage.getItem('pm_large_button') === 'true';
    const savedSimpleLang = localStorage.getItem('pm_simple_lang') === 'true';
    const savedTextSize = (localStorage.getItem('pm_text_size') as 'normal' | 'large' | 'xlarge') || 'normal';
    const savedTtsVoice = Number(localStorage.getItem('pm_tts_voice') || '0');
    const savedTtsRate = Number(localStorage.getItem('pm_tts_rate') || '1.0');
    const savedVoiceNav = localStorage.getItem('pm_voice_nav') === 'true';

    if (savedTheme === 'high-contrast') {
      document.documentElement.classList.add('high-contrast');
    }
    if (savedLargeBtn) {
      document.body.classList.add('large-button-mode');
    }
    document.documentElement.setAttribute('data-text-size', savedTextSize);

    set({
      theme: savedTheme,
      largeButtonMode: savedLargeBtn,
      simpleLanguageMode: savedSimpleLang,
      textSize: savedTextSize,
      ttsVoiceIndex: savedTtsVoice,
      ttsRate: savedTtsRate,
      voiceNavigationEnabled: savedVoiceNav,
    });
  },
}));
