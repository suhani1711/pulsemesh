export interface FirstAidGuideSection {
  id: string;
  category: 'medical' | 'fire' | 'flood' | 'earthquake' | 'trauma';
  title: string;
  simpleTitle: string;
  summary: string;
  steps: string[];
  simpleSteps: string[];
  criticalWarnings: string[];
  equipmentNeeded: string[];
}

export const OFFLINE_EMERGENCY_GUIDES: FirstAidGuideSection[] = [
  {
    id: 'severe-bleeding',
    category: 'trauma',
    title: 'Severe Bleeding & Hemorrhage Control',
    simpleTitle: 'How to Stop Heavy Bleeding',
    summary: 'Rapid arterial or venous blood loss requires immediate direct pressure to prevent lethal hypovolemic shock.',
    steps: [
      'Expose the wound completely to identify the exact origin of bleeding.',
      'Apply firm, continuous direct pressure with a sterile pad or cleanest available cloth.',
      'If bleeding soaks through, do NOT remove the first pad; add more pads directly on top and press harder.',
      'For severe limb bleeding when direct pressure fails and specialized training is available, apply a tourniquet 2-3 inches above the wound (never over a joint) and note the application time.',
      'Keep patient warm, lying flat with legs slightly elevated (unless head/chest injury is suspected).'
    ],
    simpleSteps: [
      'Push hard on the wound with a clean cloth.',
      'Do not let go. Keep pushing for at least 5 minutes.',
      'If blood leaks through, add another cloth on top.',
      'Keep the person lying down and warm.'
    ],
    criticalWarnings: [
      'NEVER loosen or remove a tourniquet once applied until qualified medical personnel take over.',
      'Do NOT try to clean deep open wounds in disaster fields; focus strictly on hemorrhage control.'
    ],
    equipmentNeeded: ['Sterile gauze or clean fabric', 'Tourniquet or wide belt', 'Thermal blanket']
  },
  {
    id: 'cpr-adult',
    category: 'medical',
    title: 'Hands-Only Adult CPR (Cardiopulmonary Resuscitation)',
    simpleTitle: 'CPR for Non-Breathing Person',
    summary: 'When a person collapses, does not respond, and is not breathing normally, immediate chest compressions double their survival rate.',
    steps: [
      'Verify scene safety. Tap the person’s shoulders firmly and shout: "Are you okay?".',
      'Look for normal breathing (gasping is NOT normal breathing) for no more than 10 seconds.',
      'Place heel of one hand in center of the chest (lower half of sternum), interlock fingers with your other hand.',
      'Compress hard and fast at a rate of 100–120 beats per minute (to the rhythm of "Stayin Alive"), allowing full chest recoil between compressions.',
      'Depress chest at least 2 inches (5 cm). Continue without interruption until peer takes over or person shows signs of life.'
    ],
    simpleSteps: [
      'Check if they wake up when tapped loudly.',
      'If not breathing, push down hard and fast in center of chest.',
      'Push 2 times every second.',
      'Do not stop until help arrives or someone replaces you.'
    ],
    criticalWarnings: [
      'Do NOT interrupt compressions for more than 10 seconds.',
      'Do not be afraid of pushing too hard; cracked ribs can heal, cardiac arrest without compressions is fatal.'
    ],
    equipmentNeeded: ['Firm flat surface (floor/ground)', 'AED if available']
  },
  {
    id: 'burns-thermal',
    category: 'fire',
    title: 'Thermal & Chemical Burns Management',
    simpleTitle: 'How to Treat Burns',
    summary: 'Immediate thermal cooling arrests the burning process and preserves viable skin tissue layers.',
    steps: [
      'Remove heat source immediately. Extinguish burning clothes (Stop, Drop, and Roll).',
      'Cool the burn under cool or cold running water for 10 to 20 minutes.',
      'Gently remove rings, watches, or tight clothing around the burn before swelling begins, but do NOT peel away clothing stuck to charred skin.',
      'Cover loosely with sterile plastic cling film or clean non-adherent dressing.',
      'Treat for shock and prevent hypothermia, especially when cooling large body surface areas.'
    ],
    simpleSteps: [
      'Put cool water on the burn for 15 minutes right away.',
      'Take off rings or bracelets before swelling starts.',
      'Cover with clean plastic wrap or clean dry cloth.',
      'Never put ice, butter, or oil on burns.'
    ],
    criticalWarnings: [
      'NEVER apply ice, iced water, butter, grease, or toothpaste to burns.',
      'Do NOT pop or puncture burn blisters; intact blister skin prevents severe infection.'
    ],
    equipmentNeeded: ['Clean cold water', 'Plastic wrap or sterile non-stick dressing']
  },
  {
    id: 'choking-airway',
    category: 'medical',
    title: 'Foreign Body Airway Obstruction (Choking)',
    simpleTitle: 'Helping a Choking Person',
    summary: 'Severe airway obstruction prevents speech, coughing, or breathing, requiring rapid mechanical clearance.',
    steps: [
      'Confirm severe choking: ask "Are you choking?". If the victim nods and cannot speak or cough, act immediately.',
      'Lean the person forward and deliver up to 5 sharp back blows between the shoulder blades with the heel of your hand.',
      'If unsuccessful, stand behind them, wrap your arms around their waist, make a fist above their navel and below the ribcage.',
      'Grasp your fist with your other hand and deliver up to 5 quick upward and inward abdominal thrusts (Heimlich maneuver).',
      'Alternate 5 back blows and 5 abdominal thrusts until object is expelled or person becomes unconscious (then begin CPR).'
    ],
    simpleSteps: [
      'Hit firmly between shoulder blades 5 times with palm.',
      'If still choking, wrap arms around stomach and pull in and up quickly 5 times.',
      'Repeat until object comes out.'
    ],
    criticalWarnings: [
      'Do NOT perform abdominal thrusts on infants under 1 year old (use gentle chest thrusts and back slaps instead).',
      'Never perform blind finger sweeps in the mouth unless the foreign object is clearly visible and loose.'
    ],
    equipmentNeeded: ['None (manual maneuvers)']
  },
  {
    id: 'earthquake-survival',
    category: 'earthquake',
    title: 'Earthquake Survival: Drop, Cover, and Hold On',
    simpleTitle: 'What to Do During an Earthquake',
    summary: 'During seismic shaking, ground movement rarely causes direct injury; collapsing non-structural objects and falling masonry pose the primary danger.',
    steps: [
      'DROP down onto your hands and knees immediately to prevent being knocked down.',
      'COVER your head and neck (and your entire body if possible) under a sturdy table or desk.',
      'HOLD ON to your shelter until shaking stops. If shelter moves, move along with it.',
      'If outdoors, move into an open area away from power lines, buildings, chimneys, and overpasses.',
      'After shaking ends, check for gas leaks, electrical damage, and prepare for strong aftershocks.'
    ],
    simpleSteps: [
      'Drop to hands and knees right away.',
      'Get under a sturdy table and protect your head.',
      'Hold the table legs until the shaking stops completely.',
      'Watch out for falling glass and wires.'
    ],
    criticalWarnings: [
      'Do NOT run outside during active shaking; falling glass and parapets along exterior walls cause the highest casualties.',
      'Do NOT use doorways for shelter (modern doorways are no stronger than the rest of the wall and leave you exposed).'
    ],
    equipmentNeeded: ['Sturdy furniture', 'Heavy shoes / flashlight for post-quake navigation']
  },
  {
    id: 'flood-survival',
    category: 'flood',
    title: 'Flood & Inundation Survival Protocol',
    simpleTitle: 'Surviving Flash Floods',
    summary: 'Rapid floodwaters carry hidden debris, open storm drains, and high electrocution hazards.',
    steps: [
      'Seek higher ground immediately. Evacuate before floodwaters enter structure.',
      'Turn off electricity at the main service panel before water reaches outlets if safely possible.',
      'Never walk through moving water. Fast-moving water only 6 inches (15 cm) deep can knock down an adult.',
      'Never drive into flooded roads; 12 inches (30 cm) of water can float small vehicles, and 24 inches (60 cm) can sweep away trucks.',
      'If trapped in a building, climb to the roof rather than an attic without roof egress.'
    ],
    simpleSteps: [
      'Climb to highest floor or roof right away.',
      'Turn off main electricity switch if you can reach it dry.',
      'Never step into moving flood water.',
      'Never drive a car into water.'
    ],
    criticalWarnings: [
      'Never touch electrical equipment while standing in water.',
      'Do NOT drink floodwater; it contains toxic chemicals and raw sewage.'
    ],
    equipmentNeeded: ['Personal flotation device / life vest', 'Signaling whistle / flashlight']
  }
];
