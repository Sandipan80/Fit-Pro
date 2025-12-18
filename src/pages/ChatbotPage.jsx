import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ChatbotPage = ({ routing }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm FitBot, your advanced AI fitness coach. I can help you with personalized workout plans, nutrition advice, form corrections, progress tracking, and much more. What would you like to work on today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState({
    fitnessLevel: null,
    goals: [],
    preferences: [],
    recentTopics: [],
    workoutHistory: []
  });
  const [conversationContext, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.setProperty('color', 'black', 'important');
      inputRef.current.style.setProperty('background', 'white', 'important');
      inputRef.current.style.setProperty('caretColor', '#7c3aed', 'important');
    }
  }, []);
  
  // Enhanced fitness knowledge base
  const fitnessKnowledge = {
    workouts: {
      beginner: {
        cardio: [
          "Walking (30-45 minutes, 3-5 times/week)",
          "Light jogging (20-30 minutes, 2-3 times/week)",
          "Cycling (30 minutes, 3 times/week)",
          "Swimming (20-30 minutes, 2-3 times/week)"
        ],
        strength: [
          "Bodyweight squats (3 sets of 10-15 reps)",
          "Push-ups (modified if needed, 3 sets of 5-10 reps)",
          "Planks (3 sets of 20-30 seconds)",
          "Wall sits (3 sets of 30-60 seconds)"
        ],
        flexibility: [
          "Cat-cow stretches",
          "Child's pose",
          "Gentle hamstring stretches",
          "Shoulder rolls"
        ]
      },
      intermediate: {
        cardio: [
          "Running (30-45 minutes, 3-4 times/week)",
          "HIIT workouts (20-30 minutes, 2-3 times/week)",
          "Cycling intervals (45 minutes, 3 times/week)",
          "Rowing (30 minutes, 3 times/week)"
        ],
        strength: [
          "Squats with weights (4 sets of 8-12 reps)",
          "Deadlifts (3 sets of 6-10 reps)",
          "Bench press (4 sets of 8-12 reps)",
          "Pull-ups (3 sets of 5-10 reps)"
        ]
      },
      advanced: {
        cardio: [
          "High-intensity interval training (HIIT)",
          "Sprint intervals",
          "CrossFit-style workouts",
          "Advanced circuit training"
        ],
        strength: [
          "Progressive overload training",
          "Compound movement complexes",
          "Olympic lifting variations",
          "Advanced bodyweight exercises"
        ]
      }
    },
    nutrition: {
      macros: {
        protein: "1.6-2.2g per kg of body weight for muscle building",
        carbs: "3-7g per kg depending on activity level",
        fats: "0.8-1.2g per kg of body weight"
      },
      timing: {
        preWorkout: "Eat 2-3 hours before: complex carbs + protein",
        postWorkout: "Eat within 30 minutes: protein + carbs",
        hydration: "Drink 500ml 2-3 hours before, 250ml every 15-20 minutes during"
      }
    },
    recovery: {
      sleep: "7-9 hours per night for optimal recovery",
      restDays: "1-2 complete rest days per week",
      activeRecovery: "Light walking, yoga, or swimming on rest days",
      stretching: "10-15 minutes daily, focus on major muscle groups"
    }
  };

  // Advanced response generation with context awareness
  const generateAdvancedResponse = (userMessage, context) => {
    const userMessageLower = userMessage.toLowerCase();
    const words = userMessageLower.split(' ');
    
    // Extract user intent and entities
    const intent = extractIntent(userMessageLower);
    const entities = extractEntities(userMessageLower);
    
    // Update conversation context
    const updatedContext = [...conversationContext, { user: userMessage, intent, entities }];
    setConversationContext(updatedContext.slice(-5)); // Keep last 5 exchanges
    
    // Generate personalized response based on intent and context
    switch (intent) {
      case 'greeting':
        return generateGreetingResponse(context);
      
      case 'workout_recommendation':
        return generateWorkoutResponse(entities, context);
      
      case 'nutrition_advice':
        return generateNutritionResponse(entities, context);
      
      case 'form_correction':
        return generateFormResponse(entities, context);
      
      case 'progress_tracking':
        return generateProgressResponse(entities, context);
      
      case 'recovery_advice':
        return generateRecoveryResponse(entities, context);
      
      case 'goal_setting':
        return generateGoalResponse(entities, context);
      
      case 'injury_prevention':
        return generateInjuryResponse(entities, context);
      
      case 'motivation':
        return generateMotivationResponse(context);
      
      case 'technical_support':
        return generateSupportResponse(entities, context);
      
      default:
        return generateFallbackResponse(userMessage, context);
    }
  };

  // Intent extraction using advanced pattern matching
  const extractIntent = (message) => {
    const patterns = {
      greeting: /(hi|hello|hey|good morning|good afternoon|good evening)/,
      workout_recommendation: /(workout|exercise|training|routine|program|plan)/,
      nutrition_advice: /(diet|nutrition|food|meal|protein|carbs|calories|eating)/,
      form_correction: /(form|technique|posture|correct|wrong|proper|squat|deadlift|bench)/,
      progress_tracking: /(progress|track|measure|improve|better|results|achievement)/,
      recovery_advice: /(rest|recovery|sleep|rest day|overtraining|burnout)/,
      goal_setting: /(goal|target|achieve|want to|trying to|aim for)/,
      injury_prevention: /(injury|pain|hurt|prevent|avoid|safe|protection)/,
      motivation: /(motivated|motivation|stuck|bored|tired|difficult|hard)/,
      technical_support: /(subscription|plan|price|cost|payment|account|login|signup)/
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    return 'general_inquiry';
  };

  // Entity extraction for better understanding
  const extractEntities = (message) => {
    const entities = {
      fitnessLevel: null,
      exercise: null,
      bodyPart: null,
      goal: null,
      timeFrame: null,
      equipment: null
    };

    // Extract fitness level
    if (message.includes('beginner')) entities.fitnessLevel = 'beginner';
    else if (message.includes('intermediate')) entities.fitnessLevel = 'intermediate';
    else if (message.includes('advanced')) entities.fitnessLevel = 'advanced';

    // Extract exercises
    const exercises = ['squat', 'deadlift', 'bench press', 'pull-up', 'push-up', 'plank', 'yoga', 'running', 'cycling', 'swimming'];
    exercises.forEach(exercise => {
      if (message.includes(exercise)) entities.exercise = exercise;
    });

    // Extract body parts
    const bodyParts = ['legs', 'arms', 'chest', 'back', 'shoulders', 'core', 'abs'];
    bodyParts.forEach(part => {
      if (message.includes(part)) entities.bodyPart = part;
    });

    // Extract goals
    const goals = ['lose weight', 'build muscle', 'get stronger', 'improve endurance', 'flexibility', 'cardio'];
    goals.forEach(goal => {
      if (message.includes(goal)) entities.goal = goal;
    });

    return entities;
  };

  // Generate contextual responses
  const generateGreetingResponse = (context) => {
    const responses = [
      "Hello! I'm excited to help you on your fitness journey. What specific area would you like to focus on today?",
      "Hi there! I can help with workout plans, nutrition advice, form corrections, or any fitness questions. What's on your mind?",
      "Welcome! I'm here to provide personalized fitness guidance. Are you looking to start a new routine or improve your current one?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateWorkoutResponse = (entities, context) => {
    const level = entities.fitnessLevel || userContext.fitnessLevel || 'beginner';
    const goal = entities.goal || 'general fitness';
    
    let response = `Based on your ${level} level and ${goal} goals, here's what I recommend:\n\n`;
    
    if (level === 'beginner') {
      response += "**For Beginners:**\n";
      response += "• Start with 2-3 workouts per week\n";
      response += "• Focus on full-body movements\n";
      response += "• Build consistency before intensity\n\n";
      response += "**Sample Beginner Routine:**\n";
      fitnessKnowledge.workouts.beginner.strength.forEach(exercise => {
        response += `• ${exercise}\n`;
      });
    } else if (level === 'intermediate') {
      response += "**For Intermediate:**\n";
      response += "• 3-4 workouts per week\n";
      response += "• Mix of strength and cardio\n";
      response += "• Progressive overload focus\n\n";
      response += "**Sample Intermediate Routine:**\n";
      fitnessKnowledge.workouts.intermediate.strength.forEach(exercise => {
        response += `• ${exercise}\n`;
      });
    }
    
    response += "\nWould you like me to create a more detailed plan for you?";
    return response;
  };

  const generateNutritionResponse = (entities, context) => {
    let response = "**Nutrition Fundamentals:**\n\n";
    response += "**Macronutrient Guidelines:**\n";
    response += `• Protein: ${fitnessKnowledge.nutrition.macros.protein}\n`;
    response += `• Carbohydrates: ${fitnessKnowledge.nutrition.macros.carbs}\n`;
    response += `• Fats: ${fitnessKnowledge.nutrition.macros.fats}\n\n`;
    
    response += "**Meal Timing:**\n";
    response += `• Pre-workout: ${fitnessKnowledge.nutrition.timing.preWorkout}\n`;
    response += `• Post-workout: ${fitnessKnowledge.nutrition.timing.postWorkout}\n`;
    response += `• Hydration: ${fitnessKnowledge.nutrition.timing.hydration}\n\n`;
    
    response += "**Key Principles:**\n";
    response += "• Eat whole, unprocessed foods\n";
    response += "• Stay hydrated throughout the day\n";
    response += "• Listen to your body's hunger cues\n";
    response += "• Plan meals ahead for consistency\n\n";
    
    response += "Would you like specific meal suggestions or help calculating your daily needs?";
    return response;
  };

  const generateFormResponse = (entities, context) => {
    const exercise = entities.exercise || 'exercise';
    let response = `**Proper Form for ${exercise.charAt(0).toUpperCase() + exercise.slice(1)}:**\n\n`;
    
    const formTips = {
      squat: "• Feet shoulder-width apart\n• Keep chest up, core engaged\n• Lower until thighs are parallel to ground\n• Push through heels to stand\n• Keep knees in line with toes",
      deadlift: "• Stand with feet hip-width apart\n• Grip bar with hands shoulder-width\n• Keep bar close to body\n• Lift with legs, not back\n• Keep spine neutral throughout",
      'bench press': "• Lie on bench with feet flat\n• Grip bar slightly wider than shoulders\n• Lower bar to chest with control\n• Press up explosively\n• Keep shoulder blades retracted",
      'push-up': "• Start in plank position\n• Hands slightly wider than shoulders\n• Lower chest to ground\n• Push up with full body\n• Keep core tight throughout"
    };
    
    response += formTips[exercise] || "• Focus on controlled movements\n• Maintain proper alignment\n• Breathe consistently\n• Start with lighter weights\n• Consider working with a trainer";
    
    response += "\n\n**Common Mistakes to Avoid:**\n";
    response += "• Rushing through movements\n• Using momentum instead of muscle\n• Poor breathing patterns\n• Not warming up properly\n\n";
    
    response += "Would you like me to explain any specific part in more detail?";
    return response;
  };

  const generateProgressResponse = (entities, context) => {
    let response = "**Progress Tracking Strategies:**\n\n";
    response += "**What to Track:**\n";
    response += "• Workout frequency and duration\n";
    response += "• Weight lifted and reps completed\n";
    response += "• Body measurements and photos\n";
    response += "• Energy levels and sleep quality\n";
    response += "• Mood and motivation\n\n";
    
    response += "**Measurement Methods:**\n";
    response += "• Weekly progress photos\n";
    response += "• Monthly body measurements\n";
    response += "• Workout log/journal\n";
    response += "• Performance benchmarks\n\n";
    
    response += "**Realistic Expectations:**\n";
    response += "• Strength gains: 2-4 weeks\n";
    response += "• Muscle growth: 4-8 weeks\n";
    response += "• Weight loss: 1-2 lbs per week\n";
    response += "• Endurance: 3-6 weeks\n\n";
    
    response += "Would you like help setting up a tracking system?";
    return response;
  };

  const generateRecoveryResponse = (entities, context) => {
    let response = "**Recovery Best Practices:**\n\n";
    response += "**Sleep:**\n";
    response += `• ${fitnessKnowledge.recovery.sleep}\n`;
    response += "• Maintain consistent sleep schedule\n";
    response += "• Create a relaxing bedtime routine\n\n";
    
    response += "**Rest Days:**\n";
    response += `• ${fitnessKnowledge.recovery.restDays}\n`;
    response += "• Listen to your body's signals\n";
    response += "• Don't feel guilty about rest\n\n";
    
    response += "**Active Recovery:**\n";
    response += `• ${fitnessKnowledge.recovery.activeRecovery}\n`;
    response += "• Light stretching and mobility work\n";
    response += "• Foam rolling and massage\n\n";
    
    response += "**Recovery Signs:**\n";
    response += "• Feeling energized, not exhausted\n";
    response += "• Improved performance over time\n";
    response += "• Better sleep quality\n";
    response += "• Reduced muscle soreness\n\n";
    
    response += "Are you experiencing any specific recovery issues?";
    return response;
  };

  const generateGoalResponse = (entities, context) => {
    const goal = entities.goal || 'general fitness';
    let response = `**Setting SMART Goals for ${goal}:**\n\n`;
    
    response += "**SMART Framework:**\n";
    response += "• **Specific**: Define exactly what you want to achieve\n";
    response += "• **Measurable**: Track progress with numbers\n";
    response += "• **Achievable**: Set realistic expectations\n";
    response += "• **Relevant**: Align with your values\n";
    response += "• **Time-bound**: Set deadlines\n\n";
    
    response += "**Example SMART Goals:**\n";
    if (goal.includes('weight')) {
      response += "• Lose 10 pounds in 3 months\n";
      response += "• Exercise 4 times per week\n";
      response += "• Track food intake daily\n";
    } else if (goal.includes('muscle')) {
      response += "• Gain 5 pounds of muscle in 6 months\n";
      response += "• Increase bench press by 20 pounds\n";
      response += "• Work out 3-4 times per week\n";
    } else {
      response += "• Run a 5K in 2 months\n";
      response += "• Complete 20 push-ups in a row\n";
      response += "• Exercise 30 minutes daily\n";
    }
    
    response += "\nWhat specific goal would you like to work on?";
    return response;
  };

  const generateInjuryResponse = (entities, context) => {
    let response = "**Injury Prevention Strategies:**\n\n";
    response += "**Prevention Tips:**\n";
    response += "• Always warm up properly (5-10 minutes)\n";
    response += "• Use proper form and technique\n";
    response += "• Progress gradually in intensity\n";
    response += "• Listen to your body's warning signs\n";
    response += "• Include rest days in your routine\n\n";
    
    response += "**Warning Signs:**\n";
    response += "• Sharp or shooting pain\n";
    response += "• Pain that doesn't improve with rest\n";
    response += "• Swelling or bruising\n";
    response += "• Limited range of motion\n";
    response += "• Pain that affects daily activities\n\n";
    
    response += "**If You're Injured:**\n";
    response += "• Stop the activity immediately\n";
    response += "• Apply RICE method (Rest, Ice, Compression, Elevation)\n";
    response += "• Consult a healthcare professional\n";
    response += "• Don't rush back to exercise\n\n";
    
    response += "Are you currently experiencing any pain or discomfort?";
    return response;
  };

  const generateMotivationResponse = (context) => {
    const motivationalQuotes = [
      "The only bad workout is the one that didn't happen.",
      "Progress, not perfection.",
      "Your body can do it. It's your mind you need to convince.",
      "The hardest part is showing up.",
      "Every expert was once a beginner.",
      "You don't have to be great to start, but you have to start to be great.",
      "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
      "The difference between try and triumph is just a little umph!"
    ];
    
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    let response = `**${quote}**\n\n`;
    response += "**Motivation Strategies:**\n";
    response += "• Set small, achievable daily goals\n";
    response += "• Find a workout buddy or accountability partner\n";
    response += "• Track your progress to see improvements\n";
    response += "• Mix up your routine to stay interested\n";
    response += "• Reward yourself for consistency\n";
    response += "• Remember your 'why' - why did you start?\n\n";
    
    response += "**When You're Struggling:**\n";
    response += "• Start with just 5 minutes of exercise\n";
    response += "• Focus on how you'll feel after, not before\n";
    response += "• Break big goals into smaller steps\n";
    response += "• Celebrate every small victory\n\n";
    
    response += "What's your biggest motivation challenge right now?";
    return response;
  };

  const generateSupportResponse = (entities, context) => {
    let response = "**Platform Support Information:**\n\n";
    response += "**Subscription Plans:**\n";
    response += "• **Free Plan**: Basic access to limited workouts\n";
    response += "• **Premium Plan**: ₹999/month - Full access to all workouts, personalized plans, nutrition guidance\n";
    response += "• **Family Plan**: ₹1499/month - Up to 5 family members\n\n";
    
    response += "**Features by Plan:**\n";
    response += "• Unlimited workout videos\n";
    response += "• Personalized fitness plans\n";
    response += "• Progress tracking tools\n";
    response += "• Nutrition guidance\n";
    response += "• 24/7 AI fitness coach (me!)\n\n";
    
    response += "**Getting Started:**\n";
    response += "• Create an account to save progress\n";
    response += "• Complete your fitness assessment\n";
    response += "• Choose your subscription plan\n";
    response += "• Start with beginner-friendly workouts\n\n";
    
    response += "Would you like help choosing the right plan for you?";
    return response;
  };

  const generateFallbackResponse = (userMessage, context) => {
    const fallbackResponses = [
      "I want to make sure I understand your question correctly. Could you rephrase that or ask about a specific fitness topic like workouts, nutrition, form, or recovery?",
      "That's an interesting question! I'm designed to help with fitness-related topics. Could you ask about workouts, nutrition, exercise form, or fitness goals?",
      "I'm here to help with your fitness journey. Try asking about workout recommendations, nutrition advice, exercise technique, or how to achieve your fitness goals.",
      "I want to provide you with the best possible help. Could you ask about specific fitness topics like training programs, nutrition plans, or exercise form?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Generate advanced response with context
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: generateAdvancedResponse(inputMessage, userContext),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Advanced FitBot AI Coach</h1>
              <p className="text-lg text-gray-600">Your intelligent fitness companion with personalized advice, form corrections, and comprehensive guidance</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="bg-purple-600 text-white p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">Advanced FitBot AI</h3>
                  <p className="text-xs text-purple-200">Online | AI Fitness Coach | Context-Aware</p>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: '0' }}>
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-purple-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about fitness, workouts, nutrition, or form..."
                    className="input-reset"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-r-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
            
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Advanced FitBot Capabilities:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">🤖 AI-Powered Responses</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Context-aware conversations</li>
                      <li>• Personalized recommendations</li>
                      <li>• Advanced pattern recognition</li>
                      <li>• Intelligent follow-up questions</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">💪 Comprehensive Fitness Knowledge</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Workout programming</li>
                      <li>• Nutrition science</li>
                      <li>• Form corrections</li>
                      <li>• Injury prevention</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">🎯 Personalized Guidance</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Goal-specific advice</li>
                      <li>• Fitness level adaptation</li>
                      <li>• Progress tracking</li>
                      <li>• Motivation strategies</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">🔬 Scientific Approach</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Evidence-based recommendations</li>
                      <li>• Proper exercise technique</li>
                      <li>• Recovery optimization</li>
                      <li>• Performance enhancement</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Try These Advanced Questions:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>"I'm a beginner wanting to lose weight. What's the best approach?"</div>
                    <div>"How can I improve my squat form and prevent knee pain?"</div>
                    <div>"What should I eat before and after my morning workout?"</div>
                    <div>"I'm feeling unmotivated. How can I get back on track?"</div>
                    <div>"How do I create a progressive overload program?"</div>
                    <div>"What are the signs of overtraining and how to prevent it?"</div>
                  </div>
                </div>
                
                <p className="mt-6 text-gray-600 text-sm">
                  <strong>Advanced AI Features:</strong> Context awareness, personalized responses, comprehensive fitness knowledge, form analysis, progress tracking, and motivational support. FitBot learns from your interactions to provide increasingly relevant advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer routing={routing} />
    </div>
  );
};

export default ChatbotPage; 