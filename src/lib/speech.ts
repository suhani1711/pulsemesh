/**
 * Web Speech API wrappers: SpeechSynthesis (Text-to-Speech) and SpeechRecognition (Voice Navigation)
 */

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  voiceIndex?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function speakText(text: string, options: SpeechSynthesisOptions = {}): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;

  const voices = getAvailableVoices();
  if (options.voiceIndex !== undefined && voices[options.voiceIndex]) {
    utterance.voice = voices[options.voiceIndex];
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }
  if (options.onError) {
    utterance.onerror = options.onError;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition for Voice Navigation
export interface SpeechRecognitionListener {
  onResult: (command: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

let activeRecognition: any = null;

export function startListening(callbacks: SpeechRecognitionListener): boolean {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.('Speech recognition is not supported in this browser.');
    return false;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();
      callbacks.onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      callbacks.onError?.(event.error || 'Recognition error');
    };

    recognition.onend = () => {
      callbacks.onEnd?.();
      activeRecognition = null;
    };

    recognition.start();
    activeRecognition = recognition;
    return true;
  } catch (err: any) {
    callbacks.onError?.(err.message || 'Failed to start voice recognition');
    return false;
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
}
