'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Shield, Activity, Users, Heart, Brain, Utensils, Target, Zap } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import { useAuth } from '@/hooks/useAuth';

interface Resource {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: string;
  qa: Array<{ question: string; answer: string }>;
}

export default function ResourcesPage() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Stretching & Warm-Up Tips',
      icon: <Activity className="h-6 w-6" />,
      description: 'Essential stretching routines and warm-up exercises for young athletes',
      content: 'Proper stretching and warm-up are crucial for preventing injuries in youth sports. Dynamic stretching before activity and static stretching after can significantly reduce the risk of muscle strains and joint injuries.',
      qa: [
        {
          question: 'How long should a warm-up last?',
          answer: 'A proper warm-up should last 10-15 minutes and include light cardio followed by dynamic stretching.'
        },
        {
          question: 'What are the best stretches for soccer players?',
          answer: 'Focus on hip flexors, hamstrings, quadriceps, and calf muscles with dynamic movements like leg swings and walking lunges.'
        },
        {
          question: 'Why are warm-ups important?',
          answer: 'Warm-ups increase blood flow, raise muscle temperature, prepare joints for sports demands, reduce injury risk, and improve performance.'
        },
        {
          question: 'What should I do after activity?',
          answer: 'Perform static stretches for 20-30 seconds each to improve flexibility and reduce stiffness.'
        }
      ]
    },
    {
      id: '2',
      title: 'Common Youth Sports Injuries',
      icon: <Shield className="h-6 w-6" />,
      description: 'Understanding the most frequent injuries in youth sports',
      content: 'Youth sports injuries often include sprains, strains, growth plate injuries, and overuse injuries. Understanding these common injuries helps parents and coaches take preventive measures.',
      qa: [
        {
          question: 'What is the most common injury in youth sports?',
          answer: 'Ankle sprains are the most common injury, followed by knee injuries and growth plate fractures.'
        },
        {
          question: 'How can we prevent overuse injuries?',
          answer: 'Limit training hours, ensure proper rest days, and encourage cross-training to avoid repetitive stress on the same body parts.'
        },
        {
          question: 'What are the most common injury types?',
          answer: 'Ankle sprains, knee injuries (ACL sprains, patellar tendinitis), growth plate injuries, and overuse injuries like stress fractures and "Little League" elbow/shoulder.'
        },
        {
          question: 'When should I seek medical care?',
          answer: 'Seek care if pain, swelling, or loss of motion lasts more than 48 hours or if a limp develops.'
        }
      ]
    },
    {
      id: '3',
      title: 'When to See a Doctor',
      icon: <Heart className="h-6 w-6" />,
      description: 'Guidelines for when medical attention is necessary',
      content: 'Knowing when to seek medical attention is crucial for proper injury management. Some injuries require immediate medical care, while others can be managed at home with proper rest and care.',
      qa: [
        {
          question: 'When should I take my child to the emergency room?',
          answer: 'Seek immediate care for severe pain, inability to bear weight, visible deformity, or loss of consciousness.'
        },
        {
          question: 'How do I know if it\'s just a sprain or something more serious?',
          answer: 'If pain persists beyond 48 hours, swelling is severe, or there\'s significant bruising, consult a doctor.'
        },
        {
          question: 'What requires immediate medical attention?',
          answer: 'Go immediately for severe pain, inability to bear weight, obvious deformity, suspected fracture, head injury with confusion/vomiting, or numbness/tingling in limbs.'
        },
        {
          question: 'When should I see a doctor within 24-48 hours?',
          answer: 'See a doctor if pain/swelling persists despite rest and ice, recurrent joint instability, or declining sports performance due to discomfort.'
        }
      ]
    },
    {
      id: '4',
      title: 'Recovery Do\'s and Don\'ts',
      icon: <Target className="h-6 w-6" />,
      description: 'Best practices for injury recovery and rehabilitation',
      content: 'Proper recovery protocols are essential for returning to sports safely. Following the right do\'s and don\'ts can speed up recovery and prevent re-injury.',
      qa: [
        {
          question: 'Should I apply ice or heat to an injury?',
          answer: 'Use ice for the first 48-72 hours to reduce swelling, then switch to heat for muscle relaxation and blood flow.'
        },
        {
          question: 'How long should my child rest after an injury?',
          answer: 'Rest duration depends on injury severity, but generally 1-2 weeks for mild injuries, longer for moderate to severe injuries.'
        },
        {
          question: 'What should I do during recovery?',
          answer: 'Follow your healthcare provider\'s treatment plan, gradually reintroduce activity under supervision, maintain fitness with safe cross-training, and stay consistent with rehab exercises.'
        },
        {
          question: 'What should I avoid during recovery?',
          answer: 'Don\'t rush back into full activity, ignore pain or swelling, skip rest days, or self-diagnose without professional input.'
        }
      ]
    },
    {
      id: '5',
      title: 'Concussion Safety',
      icon: <Brain className="h-6 w-6" />,
      description: 'Understanding and managing concussions in youth sports',
      content: 'Concussions are serious brain injuries that require immediate attention and proper management. Understanding the signs, symptoms, and recovery process is crucial for young athletes.',
      qa: [
        {
          question: 'What are the signs of a concussion?',
          answer: 'Common signs include headache, confusion, dizziness, nausea, sensitivity to light, and changes in behavior or sleep patterns.'
        },
        {
          question: 'When can my child return to sports after a concussion?',
          answer: 'Return should be gradual and only after all symptoms have resolved and clearance is given by a healthcare professional.'
        },
        {
          question: 'What are the main concussion symptoms?',
          answer: 'Headache, dizziness, blurred vision, memory loss, confusion, trouble concentrating, sensitivity to light/noise, and nausea or vomiting.'
        },
        {
          question: 'What should I do if concussion is suspected?',
          answer: 'Remove athlete from play immediately, seek prompt medical evaluation, and do not return to sports the same day.'
        }
      ]
    },
    {
      id: '6',
      title: 'Injury Prevention for Athletes',
      icon: <Zap className="h-6 w-6" />,
      description: 'Proactive measures to prevent sports injuries',
      content: 'Prevention is always better than treatment. Implementing proper training techniques, equipment use, and conditioning programs can significantly reduce injury risk.',
      qa: [
        {
          question: 'What equipment is essential for injury prevention?',
          answer: 'Proper footwear, protective gear (helmets, pads), and well-fitted equipment are essential for injury prevention.'
        },
        {
          question: 'How can strength training help prevent injuries?',
          answer: 'Strength training builds muscle support around joints, improves balance, and enhances overall athletic performance while reducing injury risk.'
        },
        {
          question: 'What are key prevention practices?',
          answer: 'Warm up and cool down every session, use sport-specific conditioning, maintain proper technique, replace worn-out gear promptly, stay hydrated, and avoid overtraining.'
        },
        {
          question: 'How can I prevent overuse injuries?',
          answer: 'Schedule rest days, gradually increase training load, cross-train to reduce repetitive stress, and listen to your body\'s warning signs.'
        }
      ]
    },
    {
      id: '7',
      title: 'Nutrition & Hydration for Recovery',
      icon: <Utensils className="h-6 w-6" />,
      description: 'Fueling the body for optimal recovery and performance',
      content: 'Proper nutrition and hydration play a vital role in injury recovery and athletic performance. Understanding what to eat and drink can accelerate healing and prevent future injuries.',
      qa: [
        {
          question: 'What should my child eat after an injury?',
          answer: 'Focus on protein-rich foods, anti-inflammatory foods like fruits and vegetables, and adequate hydration to support healing.'
        },
        {
          question: 'How much water should young athletes drink?',
          answer: 'Aim for 8-10 glasses daily, plus additional fluids during and after exercise to maintain proper hydration.'
        },
        {
          question: 'What are key nutrients for recovery?',
          answer: 'Protein for muscle repair, carbs for energy replenishment, healthy fats to reduce inflammation, and micronutrients like calcium, vitamin D, and iron for bone health.'
        },
        {
          question: 'What are hydration best practices?',
          answer: 'Drink water before, during, and after activity, use electrolyte drinks for prolonged exercise in heat, and avoid high-sugar beverages.'
        }
      ]
    },
    {
      id: '8',
      title: 'Mental Health After Injury',
      icon: <Users className="h-6 w-6" />,
      description: 'Supporting emotional well-being during recovery',
      content: 'Injuries can take a toll on young athletes\' mental health. Understanding how to support emotional well-being during recovery is as important as physical rehabilitation.',
      qa: [
        {
          question: 'How can I help my child cope with being sidelined?',
          answer: 'Maintain routine, encourage other activities, stay connected with teammates, and focus on recovery goals rather than what they\'re missing.'
        },
        {
          question: 'When should I seek professional help for my child\'s mental health?',
          answer: 'Seek help if your child shows signs of depression, anxiety, or significant changes in behavior that persist beyond the initial injury period.'
        },
        {
          question: 'What are ways to support mental health during recovery?',
          answer: 'Stay connected with teammates, set small achievable rehab goals, practice mindfulness or relaxation techniques, and seek support from counselors or sports psychologists if needed.'
        },
        {
          question: 'How can I help my child stay motivated?',
          answer: 'Celebrate small progress milestones, maintain social connections, focus on what they can do rather than what they can\'t, and set realistic recovery expectations.'
        }
      ]
    },
    {
      id: '9',
      title: 'Returning to Sports Safely',
      icon: <Target className="h-6 w-6" />,
      description: 'Guidelines for safe return to play after injury',
      content: 'Returning to sports after an injury requires careful planning and gradual progression. Following proper return-to-play protocols ensures a safe and successful comeback.',
      qa: [
        {
          question: 'What is a return-to-play protocol?',
          answer: 'A structured, gradual progression of activity levels that allows safe return to full participation while monitoring for any signs of re-injury.'
        },
        {
          question: 'How do I know if my child is ready to return?',
          answer: 'Readiness is determined by pain-free movement, restored strength and flexibility, and clearance from healthcare professionals.'
        },
        {
          question: 'What should I check before return?',
          answer: 'Full pain-free range of motion, equal strength compared to uninjured side, clearance from healthcare provider, and completion of sport-specific drills without discomfort.'
        },
        {
          question: 'How should return be structured?',
          answer: 'Return should be gradual - starting with non-contact drills and slowly increasing intensity before full competition.'
        }
      ]
    },
    {
      id: '10',
      title: 'Protective Gear & Safe Play',
      icon: <Shield className="h-6 w-6" />,
      description: 'Essential safety equipment and safe play practices',
      content: 'Proper protective gear and safe play practices are fundamental to injury prevention in youth sports. Understanding what equipment is needed and how to use it properly can prevent many injuries.',
      qa: [
        {
          question: 'What protective gear is required for different sports?',
          answer: 'Requirements vary by sport but commonly include helmets, mouthguards, pads, and proper footwear. Check with your child\'s league for specific requirements.'
        },
        {
          question: 'How often should protective equipment be replaced?',
          answer: 'Replace equipment when it shows signs of wear, damage, or when your child outgrows it. Follow manufacturer guidelines for replacement schedules.'
        },
        {
          question: 'What equipment is essential for different sports?',
          answer: 'Helmets for biking, baseball, and contact sports; mouthguards for collision risk sports; shin guards for soccer/field hockey; properly fitted footwear for sport-specific demands.'
        },
        {
          question: 'How can I ensure safe play practices?',
          answer: 'Enforce rules to prevent dangerous play, ensure proper equipment fitting, teach proper technique, and maintain safe playing environments.'
        }
      ]
    },
    {
      id: '11',
      title: 'Detailed Warm-Up Routine',
      icon: <Activity className="h-6 w-6" />,
      description: 'Step-by-step warm-up protocol for optimal performance',
      content: 'A comprehensive 10-15 minute warm-up routine that prepares young athletes for sports activities. This structured approach includes light cardio, dynamic stretching, and sport-specific drills.',
      qa: [
        {
          question: 'What is the 3-phase warm-up structure?',
          answer: 'Phase 1: Light cardio (3-5 min) - jogging, jump rope, or high knees. Phase 2: Dynamic stretching (5-7 min) - leg swings, lunges, arm circles. Phase 3: Sport-specific drills (2-3 min) - sprints, ball-handling, agility work.'
        },
        {
          question: 'What are the best dynamic stretches?',
          answer: 'Leg swings (forward/backward & side-to-side), walking lunges with twist, arm circles, butt kicks, and skips. Hold each for 10-15 seconds.'
        },
        {
          question: 'How long should each warm-up phase last?',
          answer: 'Light cardio: 3-5 minutes, Dynamic stretching: 5-7 minutes, Sport-specific drills: 2-3 minutes. Total warm-up time: 10-15 minutes.'
        },
        {
          question: 'What should I do after activity?',
          answer: 'Perform static stretches for 20-30 seconds each to improve flexibility and reduce stiffness. Focus on major muscle groups used during the activity.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedResource ? (
          <>
            {/* Resources Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expert Resources for Youth Sports Recovery
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access comprehensive articles, tips, and Q&As from sports medicine professionals 
                to help your child recover safely and return to play stronger.
              </p>
            </div>

            {/* Resource Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <div className="text-blue-600">
                        {resource.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center text-blue-600 font-medium">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read More
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedResource(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </button>
            </div>

            {/* Resource Content */}
            <div className="card max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-6">
                  <div className="text-blue-600">
                    {selectedResource.icon}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedResource.title}</h1>
                  <p className="text-gray-600">{selectedResource.description}</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="prose max-w-none mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">{selectedResource.content}</p>
              </div>

              {/* Q&A Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Common Questions</h3>
                <div className="space-y-6">
                  {selectedResource.qa.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <ChatWidget />
    </div>
  );
} 