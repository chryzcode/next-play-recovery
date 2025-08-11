export interface InjuryTimeline {
  type: string;
  suggestedDays: number;
  description: string;
  tips: string[];
}

export const injuryTimelines: InjuryTimeline[] = [
  {
    type: 'Ankle Sprain',
    suggestedDays: 14,
    description: 'Mild to moderate ankle sprains typically require 2-4 weeks of rest and rehabilitation.',
    tips: [
      'RICE method: Rest, Ice, Compression, Elevation',
      'Gradual return to activity with proper support',
      'Strengthening exercises for ankle stability'
    ]
  },
  {
    type: 'Knee Injury',
    suggestedDays: 28,
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
    suggestedDays: 21,
    description: 'Shoulder injuries often require rest and specific rehabilitation exercises.',
    tips: [
      'Avoid overhead activities initially',
      'Strengthen rotator cuff muscles',
      'Gradual return to throwing or overhead sports'
    ]
  },
  {
    type: 'Back Strain',
    suggestedDays: 14,
    description: 'Back strains typically improve with rest and proper body mechanics.',
    tips: [
      'Maintain good posture',
      'Avoid heavy lifting',
      'Gentle stretching and core strengthening'
    ]
  },
  {
    type: 'Wrist Injury',
    suggestedDays: 14,
    description: 'Wrist injuries often heal well with proper rest and support.',
    tips: [
      'Use wrist support if recommended',
      'Avoid repetitive motions',
      'Gradual return to gripping activities'
    ]
  },
  {
    type: 'Hamstring Strain',
    suggestedDays: 21,
    description: 'Hamstring strains require careful rehabilitation to prevent re-injury.',
    tips: [
      'Gentle stretching after initial rest period',
      'Strengthen hamstring and glute muscles',
      'Gradual return to running and jumping'
    ]
  },
  {
    type: 'Groin Strain',
    suggestedDays: 14,
    description: 'Groin strains need rest and specific rehabilitation exercises.',
    tips: [
      'Avoid activities that cause pain',
      'Gentle stretching of adductor muscles',
      'Gradual return to lateral movements'
    ]
  },
  {
    type: 'Shin Splints',
    suggestedDays: 21,
    description: 'Shin splints require rest and addressing underlying causes.',
    tips: [
      'Reduce impact activities',
      'Proper footwear and orthotics if needed',
      'Strengthen lower leg muscles'
    ]
  },
  {
    type: 'Elbow Injury',
    suggestedDays: 14,
    description: 'Elbow injuries often respond well to rest and proper rehabilitation.',
    tips: [
      'Avoid repetitive motions',
      'Strengthen forearm muscles',
      'Gradual return to throwing or gripping activities'
    ]
  },
  {
    type: 'Broken Bone',
    suggestedDays: 42,
    description: 'Broken bones require proper immobilization and healing time.',
    tips: [
      'Follow doctor\'s immobilization instructions',
      'Maintain good nutrition for bone healing',
      'Gradual return to activity after clearance'
    ]
  },
  {
    type: 'Fracture',
    suggestedDays: 42,
    description: 'Fractures need proper medical treatment and healing time.',
    tips: [
      'Seek immediate medical attention',
      'Follow immobilization protocol',
      'Physical therapy for strength and mobility'
    ]
  },
  {
    type: 'ACL Tear',
    suggestedDays: 180,
    description: 'ACL tears often require surgical intervention and extensive rehabilitation.',
    tips: [
      'Consult with orthopedic specialist',
      'Pre-surgery physical therapy',
      'Post-surgery rehabilitation program'
    ]
  },
  {
    type: 'Meniscus Tear',
    suggestedDays: 90,
    description: 'Meniscus tears may require surgery and rehabilitation.',
    tips: [
      'Consult with orthopedic specialist',
      'Follow rehabilitation protocol',
      'Gradual return to sports activities'
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
    suggestedDays: 21,
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