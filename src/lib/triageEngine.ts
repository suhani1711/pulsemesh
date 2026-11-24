import { TriageResult } from '../types';

export interface ImageAnalysisData {
  file?: File;
  previewUrl?: string;
  category: 'injury' | 'fire' | 'structural' | 'flooding' | 'other';
}

export interface TriageEngine {
  analyze(input: ImageAnalysisData): Promise<TriageResult>;
}

/**
 * Transparent Rule-Based Demo Triage Engine
 * Prominently badged as SIMULATED RESULT. No real medical diagnosis or real ML computer vision occurs.
 * Extracts basic client-side image metrics (dominant color, brightness) as a visible demo heuristic.
 */
export class RuleBasedTriageEngine implements TriageEngine {
  async analyze(input: ImageAnalysisData): Promise<TriageResult> {
    // Simulate heuristic processing delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Demo image stats extraction
    let dominantColor = '#4A6984';
    let brightness = 68;
    let dimensions = 'N/A';

    if (input.previewUrl) {
      try {
        const stats = await this.extractImageStats(input.previewUrl);
        dominantColor = stats.color;
        brightness = stats.brightness;
        dimensions = stats.dimensions;
      } catch (e) {
        // Fallback gracefully
      }
    }

    const { category } = input;

    switch (category) {
      case 'injury':
        return {
          id: 'tri_' + Date.now(),
          timestamp: Date.now(),
          category: 'Physical Injury / Trauma',
          riskLevel: 'High',
          summary: 'Rule-based analysis indicates potential soft tissue trauma or bleeding risk requiring urgent first-aid stabilization.',
          immediateSafetySteps: [
            'Do NOT move person if spinal or head injury is suspected unless immediate environmental danger threatens.',
            'Apply direct, steady pressure using clean cloth or sterile bandage to active bleeding areas.',
            'Keep patient warm, calm, and lying flat to guard against physical shock.',
            'Check breathing and airway regularly.'
          ],
          whenToSeekHelp: [
            'Uncontrolled spurting bleeding after 5 minutes of firm direct pressure',
            'Loss of consciousness, dizziness, or confusion',
            'Severe numbness, visible deformity of limbs, or exposed bone',
            'Difficulty breathing or cyanosis (blue discoloration of lips/fingernails)'
          ],
          firstAidGuidance: [
            'Elevate wounded extremity above heart level if no fracture is suspected.',
            'Do not attempt to push back protruding tissue or remove deeply embedded objects.',
            'Monitor pulse and mental responsiveness every 3 minutes.'
          ],
          isDemoHeuristic: true,
          imageStats: { dominantColor, brightness, dimensions }
        };

      case 'fire':
        return {
          id: 'tri_' + Date.now(),
          timestamp: Date.now(),
          category: 'Fire / Thermal Hazard',
          riskLevel: 'Critical',
          summary: 'High thermal hazard and smoke inhalation risk detected. Immediate evacuation priority.',
          immediateSafetySteps: [
            'Evacuate immediately away from structure downwind; stay low to the floor where air is cooler and cleaner.',
            'Cover mouth and nose with a damp cloth or sleeve to filter toxic smoke particulates.',
            'Check closed doors with the back of your hand before opening; do not open hot doors.',
            'Never re-enter a burning or smoke-filled building for any reason.'
          ],
          whenToSeekHelp: [
            'Inhalation of smoke or soot (wheezing, coughing, burned nasal hairs)',
            'Thermal burns covering area larger than palm of hand or blistering',
            'Burns to face, neck, groin, or airway passages'
          ],
          firstAidGuidance: [
            'Cool thermal burns under clean cold running water for 10-20 minutes. Do NOT apply ice or butter.',
            'Cover cooled burn area loosely with sterile plastic wrap or clean dry dressing.',
            'Elevate burned extremities if possible.'
          ],
          isDemoHeuristic: true,
          imageStats: { dominantColor, brightness, dimensions }
        };

      case 'structural':
        return {
          id: 'tri_' + Date.now(),
          timestamp: Date.now(),
          category: 'Structural Damage / Collapse',
          riskLevel: 'High',
          summary: 'Compromised building integrity and secondary collapse hazard.',
          immediateSafetySteps: [
            'Vacate structure immediately and establish at least 1.5x building height perimeter clearance.',
            'Shut off gas valves and electrical main breaker if safely accessible without entering danger zone.',
            'Watch for downed power lines; treat all fallen wires as live and maintain 10m distance.',
            'Do not use elevators or light matches / open flames due to potential gas leaks.'
          ],
          whenToSeekHelp: [
            'Trapped individuals under heavy load or debris',
            'Smell of natural gas or electrical sparking sounds',
            'Cracking sounds or shifting load-bearing supports'
          ],
          firstAidGuidance: [
            'If someone is pinned by debris, do not pull violently. Protect their airway from dust.',
            'Signal rescuers with periodic tapping on metal pipes or three whistle blasts.'
          ],
          isDemoHeuristic: true,
          imageStats: { dominantColor, brightness, dimensions }
        };

      case 'flooding':
        return {
          id: 'tri_' + Date.now(),
          timestamp: Date.now(),
          category: 'Flooding / Water Inundation',
          riskLevel: 'Moderate',
          summary: 'Rapid water accumulation hazard with electrocution and waterborne contamination risks.',
          immediateSafetySteps: [
            'Move immediately to higher ground or upper floor; avoid basements and low-lying ground.',
            'Never walk, swim, or drive through moving water. Just 15cm (6 inches) of water can sweep you off feet.',
            'Avoid contact with floodwater which may be electrically charged or contaminated with sewage.'
          ],
          whenToSeekHelp: [
            'Rapidly rising water threatening living quarters or high-ground shelter',
            'Hypothermia symptoms (uncontrollable shivering, slurred speech, lethargy)',
            'Ingestion of contaminated water leading to severe distress'
          ],
          firstAidGuidance: [
            'Remove wet clothing and wrap victim in dry blankets to treat hypothermia.',
            'Disinfect any skin abrasions immediately with antiseptic wash.'
          ],
          isDemoHeuristic: true,
          imageStats: { dominantColor, brightness, dimensions }
        };

      default:
        return {
          id: 'tri_' + Date.now(),
          timestamp: Date.now(),
          category: 'General Hazard / Environmental Threat',
          riskLevel: 'Moderate',
          summary: 'Unspecified emergency environmental risk. Prioritize situational awareness and shelter-in-place safety.',
          immediateSafetySteps: [
            'Stay calm and survey surrounding perimeter for hazards (wires, debris, chemical odors).',
            'Formulate an emergency exit plan with all household members.',
            'Keep emergency radio and PulseMesh local broadcast active for peer coordination.'
          ],
          whenToSeekHelp: [
            'Unresolved injuries or escalating environmental instability',
            'Shortage of potable water or essential life-sustaining medications'
          ],
          firstAidGuidance: [
            'Ration clean drinking water.',
            'Attend to vulnerable individuals (infants, elderly, injured).'
          ],
          isDemoHeuristic: true,
          imageStats: { dominantColor, brightness, dimensions }
        };
    }
  }

  private async extractImageStats(imageUrl: string): Promise<{ color: string; brightness: number; dimensions: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 32;
          canvas.height = 32;
          if (!ctx) {
            resolve({ color: '#2B4C6F', brightness: 75, dimensions: `${img.width}x${img.height}` });
            return;
          }
          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          const pixelCount = data.length / 4;
          r = Math.round(r / pixelCount);
          g = Math.round(g / pixelCount);
          b = Math.round(b / pixelCount);
          const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          resolve({
            color: hex,
            brightness,
            dimensions: `${img.width}x${img.height} px`
          });
        } catch {
          resolve({ color: '#00D9FF', brightness: 80, dimensions: `${img.width}x${img.height}` });
        }
      };
      img.onerror = () => {
        resolve({ color: '#FF3B4F', brightness: 50, dimensions: 'Unknown' });
      };
      img.src = imageUrl;
    });
  }
}

export const triageEngine: TriageEngine = new RuleBasedTriageEngine();
