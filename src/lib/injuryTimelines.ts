export interface InjuryTimeline {
  type: string;
  suggestedDays: number;
  description: string;
  tips: string[];
}

export const injuryTimelines: InjuryTimeline[] = [
  {
    type: 'Ankle Sprain',
    suggestedDays: 7,
    description: 'Mild to moderate ankle sprains typically require 1-2 weeks of rest and rehabilitation.',
    tips: [
      'RICE method: Rest, Ice, Compression, Elevation',
      'Gradual return to activity with proper support',
      'Strengthening exercises for ankle stability'
    ]
  },
  {
    type: 'Knee Injury',
    suggestedDays: 14,
    description: 'Knee injuries can range from minor strains to more serious ligament damage.',
    tips: [
      'Avoid activities that cause pain or swelling',
      'Strengthen surrounding muscles',
      'Consider physical therapy for proper rehabilitation'
    ]
  },
  {
    type: 'Concussion',
    suggestedDays: 21,
    description: 'Concussions require careful management and gradual return to activity.',
    tips: [
      'Complete rest from physical and cognitive activities',
      'Follow doctor\'s recommendations for return to play',
      'Monitor for any worsening symptoms'
    ]
  },
  {
    type: 'Shoulder Injury',
    suggestedDays: 10,
    description: 'Shoulder injuries often require rest and specific rehabilitation exercises.',
    tips: [
      'Avoid overhead activities initially',
      'Strengthen rotator cuff muscles',
      'Gradual return to throwing or overhead sports'
    ]
  },
  {
    type: 'Back Strain',
    suggestedDays: 7,
    description: 'Back strains typically improve with rest and proper body mechanics.',
    tips: [
      'Maintain good posture',
      'Avoid heavy lifting',
      'Gentle stretching and core strengthening'
    ]
  },
  {
    type: 'Wrist Injury',
    suggestedDays: 5,
    description: 'Wrist injuries often heal well with proper rest and support.',
    tips: [
      'Use wrist support if recommended',
      'Avoid repetitive motions',
      'Gradual return to gripping activities'
    ]
  },
  {
    type: 'Hamstring Strain',
    suggestedDays: 10,
    description: 'Hamstring strains require careful rehabilitation to prevent re-injury.',
    tips: [
      'Gentle stretching after initial rest period',
      'Strengthen hamstring and glute muscles',
      'Gradual return to running and jumping'
    ]
  },
  {
    type: 'Groin Strain',
    suggestedDays: 7,
    description: 'Groin strains need rest and specific rehabilitation exercises.',
    tips: [
      'Avoid activities that cause pain',
      'Gentle stretching of adductor muscles',
      'Gradual return to lateral movements'
    ]
  },
  {
    type: 'Shin Splints',
    suggestedDays: 14,
    description: 'Shin splints require rest and addressing underlying causes.',
    tips: [
      'Reduce impact activities',
      'Proper footwear and orthotics if needed',
      'Strengthen lower leg muscles'
    ]
  },
  {
    type: 'Elbow Injury',
    suggestedDays: 7,
    description: 'Elbow injuries often respond well to rest and proper rehabilitation.',
    tips: [
      'Avoid repetitive motions',
      'Strengthen forearm muscles',
      'Gradual return to throwing or gripping activities'
    ]
  }
];

export function getSuggestedTimeline(injuryType: string): InjuryTimeline | null {
  const normalizedType = injuryType.toLowerCase().trim();
  
  for (const timeline of injuryTimelines) {
    if (timeline.type.toLowerCase().includes(normalizedType) || 
        normalizedType.includes(timeline.type.toLowerCase())) {
      return timeline;
    }
  }
  
  // Default timeline for unknown injury types
  return {
    type: injuryType,
    suggestedDays: 7,
    description: 'Consult with a healthcare professional for specific recovery guidelines.',
    tips: [
      'Follow RICE method: Rest, Ice, Compression, Elevation',
      'Avoid activities that cause pain',
      'Gradual return to activity',
      'Seek medical attention if symptoms worsen'
    ]
  };
}

export function getTimelineByType(type: string): InjuryTimeline | null {
  return injuryTimelines.find(timeline => 
    timeline.type.toLowerCase() === type.toLowerCase()
  ) || null;
} 