import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [userContext, setUserContext] = useState({
    fitnessLevel: null,
    goals: [],
    preferences: [],
    recentTopics: []
  });
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Load messages from localStorage or use default
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      { text: "Hi there! I'm your advanced AI fitness assistant. I can help with personalized workouts, nutrition advice, form corrections, and much more. How can I assist you today?", sender: 'bot' }
    ];
  });
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Stop pulsing animation after a few seconds
  useEffect(() => {
    if (isPulsing) {
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPulsing]);

  // Memoized scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Memoized fitness knowledge base
  const fitnessKnowledge = useMemo(() => ({
    workouts: {
      beginner: {
        cardio: ["Walking (30-45 min, 3-5x/week)", "Light jogging (20-30 min, 2-3x/week)", "Cycling (30 min, 3x/week)"],
        strength: ["Bodyweight squats (3x10-15)", "Push-ups (3x5-10)", "Planks (3x20-30s)", "Wall sits (3x30-60s)"]
      },
      intermediate: {
        cardio: ["Running (30-45 min, 3-4x/week)", "HIIT (20-30 min, 2-3x/week)", "Cycling intervals (45 min, 3x/week)"],
        strength: ["Squats with weights (4x8-12)", "Deadlifts (3x6-10)", "Bench press (4x8-12)", "Pull-ups (3x5-10)"]
      }
    },
    nutrition: {
      macros: {
        protein: "1.6-2.2g per kg for muscle building",
        carbs: "3-7g per kg depending on activity",
        fats: "0.8-1.2g per kg of body weight"
      },
      timing: {
        preWorkout: "2-3 hours before: complex carbs + protein",
        postWorkout: "Within 30 minutes: protein + carbs"
      }
    }
  }), []);

  // Memoized suggested questions
  const suggestedQuestions = useMemo(() => [
    "I'm a beginner wanting to lose weight. What's the best approach?",
    "How can I improve my squat form and prevent knee pain?",
    "What should I eat before and after my morning workout?",
    "I'm feeling unmotivated. How can I get back on track?",
    "How do I create a progressive overload program?",
    "What are the signs of overtraining and how to prevent it?"
  ], []);

  // Memoized quick actions
  const quickActions = useMemo(() => [
    {
      icon: "📎",
      label: "Attach",
      action: () => setShowAttachOptions(!showAttachOptions),
      bgColor: "bg-purple-100",
      textColor: "text-purple-800"
    },
    {
      icon: "⚡",
      label: "Workouts",
      href: "#workouts",
      bgColor: "bg-green-100",
      textColor: "text-green-800"
    },
    {
      icon: "🥗",
      label: "Nutrition",
      href: "#nutrition",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800"
    },
    {
      icon: "🧮",
      label: "BMI Calc",
      href: "#bmi-calculator",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800"
    }
  ], [showAttachOptions]);

  // Advanced response generation with context awareness
  const generateAdvancedResponse = useCallback((userMessage, context) => {
    const userMessageLower = userMessage.toLowerCase();
    
    // Extract intent and entities
    const intent = extractIntent(userMessageLower);
    const entities = extractEntities(userMessageLower);
    
    // Update user context
    if (entities.fitnessLevel) {
      setUserContext(prev => ({ ...prev, fitnessLevel: entities.fitnessLevel }));
    }
    if (entities.goal) {
      setUserContext(prev => ({ ...prev, goals: [...prev.goals, entities.goal] }));
    }
    
    // Generate contextual response
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
      case 'motivation':
        return generateMotivationResponse(context);
      case 'technical_support':
        return generateSupportResponse(entities, context);
      default:
        return generateFallbackResponse(userMessage, context);
    }
  }, [fitnessKnowledge]);

  // Intent extraction
  const extractIntent = useCallback((message) => {
    const patterns = {
      greeting: /(hi|hello|hey|good morning|good afternoon|good evening)/,
      workout_recommendation: /(workout|exercise|training|routine|program|plan)/,
      nutrition_advice: /(diet|nutrition|food|meal|protein|carbs|calories|eating)/,
      form_correction: /(form|technique|posture|correct|wrong|proper|squat|deadlift|bench)/,
      progress_tracking: /(progress|track|measure|improve|better|results|achievement)/,
      recovery_advice: /(rest|recovery|sleep|rest day|overtraining|burnout)/,
      goal_setting: /(goal|target|achieve|want to|trying to|aim for)/,
      motivation: /(motivated|motivation|stuck|bored|tired|difficult|hard)/,
      technical_support: /(subscription|plan|price|cost|payment|account|login|signup)/
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) return intent;
    }
    return 'general_inquiry';
  }, []);

  // Entity extraction
  const extractEntities = useCallback((message) => {
    const entities = {
      fitnessLevel: null,
      exercise: null,
      bodyPart: null,
      goal: null,
      timeFrame: null
    };

    if (message.includes('beginner')) entities.fitnessLevel = 'beginner';
    else if (message.includes('intermediate')) entities.fitnessLevel = 'intermediate';
    else if (message.includes('advanced')) entities.fitnessLevel = 'advanced';

    const exercises = ['squat', 'deadlift', 'bench press', 'pull-up', 'push-up', 'plank', 'yoga', 'running', 'cycling'];
    exercises.forEach(exercise => {
      if (message.includes(exercise)) entities.exercise = exercise;
    });

    const goals = ['lose weight', 'build muscle', 'get stronger', 'improve endurance', 'flexibility', 'cardio'];
    goals.forEach(goal => {
      if (message.includes(goal)) entities.goal = goal;
    });

    return entities;
  }, []);

  // Response generators
  const generateGreetingResponse = useCallback((context) => {
    const responses = [
      "Hello! I'm excited to help you on your fitness journey. What specific area would you like to focus on today?",
      "Hi there! I can help with workout plans, nutrition advice, form corrections, or any fitness questions. What's on your mind?",
      "Welcome! I'm here to provide personalized fitness guidance. Are you looking to start a new routine or improve your current one?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const generateWorkoutResponse = useCallback((entities, context) => {
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
  }, [fitnessKnowledge, userContext.fitnessLevel]);

  const generateNutritionResponse = useCallback((entities, context) => {
    let response = "**Nutrition Fundamentals:**\n\n";
    response += "**Macronutrient Guidelines:**\n";
    response += `• Protein: ${fitnessKnowledge.nutrition.macros.protein}\n`;
    response += `• Carbohydrates: ${fitnessKnowledge.nutrition.macros.carbs}\n`;
    response += `• Fats: ${fitnessKnowledge.nutrition.macros.fats}\n\n`;
    
    response += "**Meal Timing:**\n";
    response += `• Pre-workout: ${fitnessKnowledge.nutrition.timing.preWorkout}\n`;
    response += `• Post-workout: ${fitnessKnowledge.nutrition.timing.postWorkout}\n\n`;
    
    response += "**Key Principles:**\n";
    response += "• Eat whole, unprocessed foods\n";
    response += "• Stay hydrated throughout the day\n";
    response += "• Listen to your body's hunger cues\n";
    response += "• Plan meals ahead for consistency\n\n";
    
    response += "Would you like specific meal suggestions or help calculating your daily needs?";
    return response;
  }, [fitnessKnowledge]);

  const generateFormResponse = useCallback((entities, context) => {
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
  }, []);

  const generateProgressResponse = useCallback((entities, context) => {
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
  }, []);

  const generateRecoveryResponse = useCallback((entities, context) => {
    let response = "**Recovery Best Practices:**\n\n";
    response += "**Sleep:**\n";
    response += "• 7-9 hours per night for optimal recovery\n";
    response += "• Maintain consistent sleep schedule\n";
    response += "• Create a relaxing bedtime routine\n\n";
    
    response += "**Rest Days:**\n";
    response += "• 1-2 complete rest days per week\n";
    response += "• Listen to your body's signals\n";
    response += "• Don't feel guilty about rest\n\n";
    
    response += "**Active Recovery:**\n";
    response += "• Light walking, yoga, or swimming on rest days\n";
    response += "• Light stretching and mobility work\n";
    response += "• Foam rolling and massage\n\n";
    
    response += "**Recovery Signs:**\n";
    response += "• Feeling energized, not exhausted\n";
    response += "• Improved performance over time\n";
    response += "• Better sleep quality\n";
    response += "• Reduced muscle soreness\n\n";
    
    response += "Are you experiencing any specific recovery issues?";
    return response;
  }, []);

  const generateGoalResponse = useCallback((entities, context) => {
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
  }, []);

  const generateMotivationResponse = useCallback((context) => {
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
  }, []);

  const generateSupportResponse = useCallback((entities, context) => {
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
  }, []);

  const generateFallbackResponse = useCallback((userMessage, context) => {
    const fallbackResponses = [
      "I want to make sure I understand your question correctly. Could you rephrase that or ask about a specific fitness topic like workouts, nutrition, form, or recovery?",
      "That's an interesting question! I'm designed to help with fitness-related topics. Could you ask about workouts, nutrition, exercise form, or fitness goals?",
      "I'm here to help with your fitness journey. Try asking about workout recommendations, nutrition advice, exercise technique, or how to achieve your fitness goals.",
      "I want to provide you with the best possible help. Could you ask about specific fitness topics like training programs, nutrition plans, or exercise form?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }, []);

  // Optimized event handlers
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    
    if (!message.trim() && !uploadedImage) return;
    
    // Add user message with image if present
    setMessages(prev => [
      ...prev, 
      { 
        text: message, 
        sender: 'user', 
        image: uploadedImage 
      }
    ]);
    
    setMessage('');
    setUploadedImage(null);
    setShowSuggestions(false);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Generate advanced response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = "";
      
      if (uploadedImage) {
        botResponse = "I can see the exercise image you've shared. This looks like a good form! Make sure to keep your back straight and focus on controlled movements. Would you like more specific advice about this exercise?";
      } else {
        botResponse = generateAdvancedResponse(message, userContext);
      }
      
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      
      // Show suggestions again after bot response
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }, 1500);
  }, [message, uploadedImage, generateAdvancedResponse, userContext]);
  
  const handleSuggestionClick = useCallback((suggestion) => {
    setMessage(suggestion);
    handleSubmit();
  }, [handleSubmit]);
  
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
    setShowAttachOptions(false);
  }, []);
  
  const clearChat = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([{ text: "Hi there! I'm your advanced AI fitness assistant. I can help with personalized workouts, nutrition advice, form corrections, and much more. How can I assist you today?", sender: 'bot' }]);
      localStorage.removeItem('chatMessages');
      setUserContext({
        fitnessLevel: null,
        goals: [],
        preferences: [],
        recentTopics: []
      });
    }
  }, []);
  
  const removeUploadedImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
    setIsPulsing(false);
  }, [isOpen]);
  
  // Close chat if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.chat-container') && !e.target.closest('.chat-button')) {
        setIsOpen(false);
        setShowAttachOptions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Memoized message component
  const MessageComponent = useCallback(({ msg, index }) => (
    <div 
      className={`mb-3 ${
        msg.sender === 'user' ? 'text-right' : 'text-left'
      }`}
    >
      {/* If message contains an image */}
      {msg.image && (
        <div className="mb-2 inline-block">
          <img 
            src={msg.image} 
            alt="User uploaded exercise" 
            className="max-w-[200px] rounded-lg border border-gray-200"
          />
        </div>
      )}
      
      <div 
        className={`inline-block rounded-lg py-2 px-3 max-w-xs ${
          msg.sender === 'user' 
            ? 'bg-purple-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-line text-sm">{msg.text}</p>
      </div>
      {msg.sender === 'bot' && index === messages.length - 1 && (
        <div className="text-xs text-gray-500 mt-1">
          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}
    </div>
  ), [messages.length]);

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-button fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 hover:scale-110 active:scale-95 ${
          isPulsing && !isOpen ? 'animate-pulse-slow' : ''
        }`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open fitness assistant chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {messages.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                {messages.filter(m => m.sender === 'bot' && !m.read).length || ''}
              </span>
            )}
          </>
        )}
      </button>
      
      {/* Chat Container */}
      <div 
        className={`chat-container fixed bottom-24 right-6 w-full max-w-sm bg-white rounded-lg shadow-xl z-50 transition-all duration-300 overflow-hidden ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Fitness assistant chat"
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full text-purple-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold">Advanced AI Coach</h3>
              <p className="text-xs opacity-80">Context-Aware | Personalized</p>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={clearChat}
              className="text-white opacity-70 hover:opacity-100 mr-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50 custom-scrollbar" role="log" aria-label="Chat messages">
          {messages.map((msg, index) => (
            <MessageComponent key={index} msg={msg} index={index} />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="bg-gray-200 text-gray-800 rounded-lg py-2 px-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggested questions */}
          {showSuggestions && messages.length < 4 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium">SUGGESTED QUESTIONS</p>
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(q)}
                  className="block w-full text-left text-sm bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 hover:scale-105"
                  aria-label={`Ask: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          
          {/* Empty div for scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        <div className="p-3 bg-gray-100 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {quickActions.map((action, index) => (
              action.href ? (
                <a
                  key={index}
                  href={action.href}
                  className={`text-sm ${action.bgColor} ${action.textColor} rounded-lg p-2 flex flex-col items-center w-1/4 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                  aria-label={action.label}
                >
                  <span className="text-lg mb-1">{action.icon}</span>
                  <span>{action.label}</span>
                </a>
              ) : (
                <button
                  key={index}
                  onClick={action.action}
                  className={`text-sm ${action.bgColor} ${action.textColor} rounded-lg p-2 flex flex-col items-center w-1/4 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                  aria-label={action.label}
                >
                  <span className="text-lg mb-1">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          {/* Image attachment options */}
          {showAttachOptions && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload exercise image"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Upload Exercise Image</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Uploaded image preview */}
          {uploadedImage && (
            <div className="mb-3 relative">
              <img 
                src={uploadedImage} 
                alt="Uploaded exercise" 
                className="max-w-[200px] rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeUploadedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Remove uploaded image"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about fitness..."
              className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
              aria-label="Type your fitness question"
            />
            <button 
              type="submit" 
              className="ml-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={(!message.trim() && !uploadedImage) || isTyping}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Advanced AI with context awareness and personalized guidance
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatButton; 