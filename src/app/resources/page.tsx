'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Shield, Activity, Users, Heart, Brain, Utensils, Target, Zap } from 'lucide-react';

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
    </div>
  );
} 