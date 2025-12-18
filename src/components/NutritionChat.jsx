import React, { useState, useEffect, useRef } from 'react';

const NutritionChat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState({
    dietaryRestrictions: [],
    fitnessGoals: [],
    activityLevel: null,
    preferences: []
  });
  const messagesEndRef = useRef(null);

  // Enhanced food database with comprehensive nutrition information
  const foodDatabase = {
    // Protein Sources
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g', category: 'protein', benefits: 'Lean protein, rich in B vitamins' },
    'salmon': { calories: 208, protein: 22, carbs: 0, fats: 13, serving: '100g', category: 'protein', benefits: 'Omega-3 fatty acids, vitamin D' },
    'tuna': { calories: 132, protein: 28, carbs: 0, fats: 1.3, serving: '100g', category: 'protein', benefits: 'High protein, low fat, vitamin B12' },
    'turkey breast': { calories: 157, protein: 29, carbs: 0, fats: 2.5, serving: '100g', category: 'protein', benefits: 'Lean protein, tryptophan' },
    'lean beef': { calories: 250, protein: 26, carbs: 0, fats: 15, serving: '100g', category: 'protein', benefits: 'Iron, B vitamins, creatine' },
    'pork loin': { calories: 143, protein: 27, carbs: 0, fats: 3.5, serving: '100g', category: 'protein', benefits: 'B vitamins, selenium' },
    'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: '100g', category: 'protein', benefits: 'Complete protein, choline, vitamin D' },
    'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: '100g', category: 'protein', benefits: 'Probiotics, calcium, protein' },
    'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fats: 4.3, serving: '100g', category: 'protein', benefits: 'Casein protein, calcium' },
    'tofu': { calories: 76, protein: 8, carbs: 1.9, fats: 4.8, serving: '100g', category: 'protein', benefits: 'Plant protein, isoflavones' },
    'tempeh': { calories: 192, protein: 20, carbs: 7.6, fats: 11, serving: '100g', category: 'protein', benefits: 'Fermented soy, probiotics' },
    'seitan': { calories: 370, protein: 75, carbs: 14, fats: 1.9, serving: '100g', category: 'protein', benefits: 'High protein, low fat' },
    'protein powder': { calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: '30g', category: 'protein', benefits: 'Convenient protein source' },
    
    // Legumes and Beans
    'lentils': { calories: 116, protein: 9, carbs: 20, fats: 0.4, serving: '100g', category: 'legumes', benefits: 'Fiber, iron, folate' },
    'black beans': { calories: 132, protein: 8.9, carbs: 24, fats: 0.5, serving: '100g', category: 'legumes', benefits: 'Fiber, antioxidants' },
    'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fats: 2.6, serving: '100g', category: 'legumes', benefits: 'Fiber, protein, minerals' },
    'kidney beans': { calories: 127, protein: 8.7, carbs: 23, fats: 0.5, serving: '100g', category: 'legumes', benefits: 'Fiber, iron, potassium' },
    'edamame': { calories: 121, protein: 11.9, carbs: 9.9, fats: 5.2, serving: '100g', category: 'legumes', benefits: 'Complete protein, fiber' },
    
    // Grains and Cereals
    'quinoa': { calories: 120, protein: 4.4, carbs: 22, fats: 1.9, serving: '100g', category: 'grains', benefits: 'Complete protein, fiber' },
    'brown rice': { calories: 112, protein: 2.6, carbs: 24, fats: 0.9, serving: '100g', category: 'grains', benefits: 'Fiber, B vitamins' },
    'oats': { calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: '100g', category: 'grains', benefits: 'Beta-glucan, fiber' },
    'whole wheat bread': { calories: 247, protein: 9.4, carbs: 41, fats: 4.2, serving: '100g', category: 'grains', benefits: 'Fiber, B vitamins' },
    'barley': { calories: 354, protein: 12.5, carbs: 73, fats: 2.3, serving: '100g', category: 'grains', benefits: 'Beta-glucan, minerals' },
    
    // Vegetables
    'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g', category: 'vegetables', benefits: 'Vitamin C, fiber, sulforaphane' },
    'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: '100g', category: 'vegetables', benefits: 'Iron, folate, vitamin K' },
    'kale': { calories: 49, protein: 4.3, carbs: 8.8, fats: 0.9, serving: '100g', category: 'vegetables', benefits: 'Vitamin K, antioxidants' },
    'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g', category: 'vegetables', benefits: 'Beta-carotene, fiber' },
    'carrots': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, serving: '100g', category: 'vegetables', benefits: 'Beta-carotene, fiber' },
    
    // Fruits
    'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '100g', category: 'fruits', benefits: 'Potassium, vitamin B6' },
    'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, serving: '100g', category: 'fruits', benefits: 'Fiber, antioxidants' },
    'blueberries': { calories: 57, protein: 0.7, carbs: 14, fats: 0.3, serving: '100g', category: 'fruits', benefits: 'Antioxidants, vitamin C' },
    'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving: '100g', category: 'fruits', benefits: 'Vitamin C, fiber' },
    'strawberries': { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, serving: '100g', category: 'fruits', benefits: 'Vitamin C, antioxidants' },
    
    // Nuts and Seeds
    'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50, serving: '100g', category: 'nuts', benefits: 'Vitamin E, healthy fats' },
    'walnuts': { calories: 654, protein: 15, carbs: 14, fats: 65, serving: '100g', category: 'nuts', benefits: 'Omega-3, antioxidants' },
    'chia seeds': { calories: 486, protein: 17, carbs: 42, fats: 31, serving: '100g', category: 'seeds', benefits: 'Omega-3, fiber' },
    'flaxseeds': { calories: 534, protein: 18, carbs: 29, fats: 42, serving: '100g', category: 'seeds', benefits: 'Omega-3, lignans' },
    'pumpkin seeds': { calories: 559, protein: 30, carbs: 11, fats: 49, serving: '100g', category: 'seeds', benefits: 'Magnesium, zinc' },
    
    // Dairy and Alternatives
    'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, serving: '100ml', category: 'dairy', benefits: 'Calcium, vitamin D' },
    'cheese': { calories: 113, protein: 25, carbs: 4.1, fats: 0.3, serving: '100g', category: 'dairy', benefits: 'Calcium, protein' },
    'almond milk': { calories: 13, protein: 0.4, carbs: 0.6, fats: 1.1, serving: '100ml', category: 'dairy-alternative', benefits: 'Low calorie, vitamin E' },
    'soy milk': { calories: 33, protein: 3.3, carbs: 1.8, fats: 1.8, serving: '100ml', category: 'dairy-alternative', benefits: 'Complete protein' },
    
    // Fats and Oils
    'avocado': { calories: 160, protein: 2, carbs: 9, fats: 15, serving: '100g', category: 'fats', benefits: 'Healthy fats, fiber' },
    'olive oil': { calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml', category: 'fats', benefits: 'Monounsaturated fats' },
    'coconut oil': { calories: 862, protein: 0, carbs: 0, fats: 100, serving: '100ml', category: 'fats', benefits: 'Medium-chain triglycerides' },
    
    // Sweeteners
    'honey': { calories: 304, protein: 0.3, carbs: 82, fats: 0, serving: '100g', category: 'sweeteners', benefits: 'Antioxidants, natural' },
    'maple syrup': { calories: 260, protein: 0, carbs: 67, fats: 0, serving: '100g', category: 'sweeteners', benefits: 'Minerals, antioxidants' }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Advanced response generation with context awareness
  const generateAdvancedResponse = (userMessage) => {
    const userMessageLower = userMessage.toLowerCase();
    
    // Extract intent and entities
    const intent = extractIntent(userMessageLower);
    const entities = extractEntities(userMessageLower);
    
    // Update user context
    if (entities.dietaryRestriction) {
      setUserContext(prev => ({ 
        ...prev, 
        dietaryRestrictions: [...prev.dietaryRestrictions, entities.dietaryRestriction] 
      }));
    }
    if (entities.fitnessGoal) {
      setUserContext(prev => ({ 
        ...prev, 
        fitnessGoals: [...prev.fitnessGoals, entities.fitnessGoal] 
      }));
    }
    
    // Generate contextual response
    switch (intent) {
      case 'greeting':
        return generateGreetingResponse();
      case 'food_inquiry':
        return generateFoodResponse(entities);
      case 'meal_planning':
        return generateMealResponse(entities);
      case 'macro_calculation':
        return generateMacroResponse(entities);
      case 'dietary_advice':
        return generateDietaryResponse(entities);
      case 'supplement_inquiry':
        return generateSupplementResponse(entities);
      case 'timing_advice':
        return generateTimingResponse(entities);
      default:
        return generateFallbackResponse(userMessage);
    }
  };

  // Intent extraction
  const extractIntent = (message) => {
    const patterns = {
      greeting: /(hi|hello|hey|good morning|good afternoon|good evening)/,
      food_inquiry: /(calories|protein|carbs|fat|nutrition|vitamin|mineral|benefit)/,
      meal_planning: /(meal|breakfast|lunch|dinner|snack|plan|recipe|diet)/,
      macro_calculation: /(calculate|macro|daily|need|requirement|goal)/,
      dietary_advice: /(vegetarian|vegan|gluten|dairy|allergy|restriction)/,
      supplement_inquiry: /(supplement|vitamin|mineral|protein powder|creatine)/,
      timing_advice: /(before|after|during|workout|pre|post|timing)/
    };

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) return intent;
    }
    return 'general_inquiry';
  };

  // Entity extraction
  const extractEntities = (message) => {
    const entities = {
      food: null,
      dietaryRestriction: null,
      fitnessGoal: null,
      mealType: null,
      nutrient: null
    };

    // Extract food items
    for (const [food, nutrition] of Object.entries(foodDatabase)) {
      if (message.includes(food)) {
        entities.food = food;
        break;
      }
    }

    // Extract dietary restrictions
    const restrictions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'];
    restrictions.forEach(restriction => {
      if (message.includes(restriction)) entities.dietaryRestriction = restriction;
    });

    // Extract fitness goals
    const goals = ['weight loss', 'muscle gain', 'endurance', 'strength', 'maintenance'];
    goals.forEach(goal => {
      if (message.includes(goal)) entities.fitnessGoal = goal;
    });

    // Extract meal types
    const meals = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];
    meals.forEach(meal => {
      if (message.includes(meal)) entities.mealType = meal;
    });

    // Extract nutrients
    const nutrients = ['protein', 'carbs', 'carbohydrates', 'fat', 'fiber', 'vitamin', 'mineral'];
    nutrients.forEach(nutrient => {
      if (message.includes(nutrient)) entities.nutrient = nutrient;
    });

    return entities;
  };

  // Response generators
  const generateGreetingResponse = () => {
    const responses = [
      "Hello! I'm your advanced nutrition assistant. I can help you with detailed food information, meal planning, macro calculations, and dietary advice. What would you like to know?",
      "Hi there! I have comprehensive nutrition data for hundreds of foods. Ask me about calories, macros, vitamins, or meal planning!",
      "Welcome! I can provide detailed nutrition analysis, help with meal planning, and give dietary recommendations. What's on your mind?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateFoodResponse = (entities) => {
    if (entities.food && foodDatabase[entities.food]) {
      const food = foodDatabase[entities.food];
      let response = `**${entities.food.charAt(0).toUpperCase() + entities.food.slice(1)} (per ${food.serving}):**\n\n`;
      response += `• **Calories**: ${food.calories} kcal\n`;
      response += `• **Protein**: ${food.protein}g\n`;
      response += `• **Carbohydrates**: ${food.carbs}g\n`;
      response += `• **Fats**: ${food.fats}g\n`;
      response += `• **Category**: ${food.category}\n`;
      response += `• **Key Benefits**: ${food.benefits}\n\n`;
      
      // Add context-specific advice
      if (userContext.fitnessGoals.includes('muscle gain')) {
        response += "**For Muscle Building**: This is a great protein source! Consider pairing with complex carbs for optimal muscle growth.\n\n";
      } else if (userContext.fitnessGoals.includes('weight loss')) {
        response += "**For Weight Loss**: This food provides good satiety. Watch portion sizes and pair with vegetables.\n\n";
      }
      
      response += "Would you like to know how to incorporate this into your meals?";
      return response;
    }
    
    return "I don't have detailed information about that specific food. Try asking about common foods like chicken, salmon, eggs, quinoa, or almonds. I can also help with meal planning or macro calculations!";
  };

  const generateMealResponse = (entities) => {
    const mealType = entities.mealType || 'meal';
    let response = `**${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Planning Tips:**\n\n`;
    
    if (mealType === 'breakfast') {
      response += "**Breakfast Recommendations:**\n";
      response += "• Protein: Eggs, Greek yogurt, protein smoothie\n";
      response += "• Complex carbs: Oats, whole grain bread, quinoa\n";
      response += "• Healthy fats: Nuts, seeds, avocado\n";
      response += "• Fiber: Berries, chia seeds, vegetables\n\n";
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      response += "**Main Meal Structure:**\n";
      response += "• 1/2 plate: Vegetables (broccoli, spinach, kale)\n";
      response += "• 1/4 plate: Lean protein (chicken, fish, tofu)\n";
      response += "• 1/4 plate: Complex carbs (brown rice, quinoa, sweet potato)\n";
      response += "• Add healthy fats: Olive oil, nuts, avocado\n\n";
    } else if (mealType === 'pre-workout') {
      response += "**Pre-Workout Nutrition:**\n";
      response += "• Eat 2-3 hours before: Complex carbs + protein\n";
      response += "• Examples: Oats with protein, banana with nuts\n";
      response += "• Stay hydrated: 500ml water 2-3 hours before\n\n";
    } else if (mealType === 'post-workout') {
      response += "**Post-Workout Nutrition:**\n";
      response += "• Eat within 30 minutes: Protein + carbs\n";
      response += "• Examples: Protein shake with banana, chicken with rice\n";
      response += "• Rehydrate: 250ml water every 15-20 minutes\n\n";
    }
    
    response += "Would you like specific meal suggestions based on your goals?";
    return response;
  };

  const generateMacroResponse = (entities) => {
    let response = "**Macronutrient Guidelines:**\n\n";
    
    const goal = userContext.fitnessGoals[0] || 'general fitness';
    
    if (goal === 'muscle gain') {
      response += "**For Muscle Building:**\n";
      response += "• Protein: 1.6-2.2g per kg body weight\n";
      response += "• Carbohydrates: 4-7g per kg body weight\n";
      response += "• Fats: 0.8-1.2g per kg body weight\n";
      response += "• Caloric surplus: +300-500 calories\n\n";
    } else if (goal === 'weight loss') {
      response += "**For Weight Loss:**\n";
      response += "• Protein: 1.6-2.2g per kg body weight\n";
      response += "• Carbohydrates: 2-4g per kg body weight\n";
      response += "• Fats: 0.8-1.2g per kg body weight\n";
      response += "• Caloric deficit: -300-500 calories\n\n";
    } else {
      response += "**For General Fitness:**\n";
      response += "• Protein: 1.2-1.6g per kg body weight\n";
      response += "• Carbohydrates: 3-5g per kg body weight\n";
      response += "• Fats: 0.8-1.2g per kg body weight\n";
      response += "• Maintenance calories\n\n";
    }
    
    response += "**Sample Daily Breakdown (70kg person):**\n";
    response += "• Protein: 112-154g\n";
    response += "• Carbohydrates: 210-350g\n";
    response += "• Fats: 56-84g\n\n";
    
    response += "Would you like me to help calculate your specific needs?";
    return response;
  };

  const generateDietaryResponse = (entities) => {
    const restriction = entities.dietaryRestriction || 'dietary restriction';
    let response = `**${restriction.charAt(0).toUpperCase() + restriction.slice(1)} Nutrition Guide:**\n\n`;
    
    if (restriction === 'vegetarian') {
      response += "**Vegetarian Protein Sources:**\n";
      response += "• Legumes: Lentils, chickpeas, black beans\n";
      response += "• Dairy: Greek yogurt, cottage cheese, milk\n";
      response += "• Eggs: Complete protein source\n";
      response += "• Grains: Quinoa, whole grains\n";
      response += "• Nuts & Seeds: Almonds, chia seeds, pumpkin seeds\n\n";
    } else if (restriction === 'vegan') {
      response += "**Vegan Protein Sources:**\n";
      response += "• Legumes: All beans, lentils, chickpeas\n";
      response += "• Soy: Tofu, tempeh, edamame\n";
      response += "• Grains: Quinoa, whole grains\n";
      response += "• Nuts & Seeds: Almonds, chia, flax, hemp\n";
      response += "• Vegetables: Broccoli, spinach, kale\n\n";
    } else if (restriction === 'gluten-free') {
      response += "**Gluten-Free Alternatives:**\n";
      response += "• Grains: Quinoa, brown rice, oats (certified GF)\n";
      response += "• Flours: Almond, coconut, rice flour\n";
      response += "• Starches: Potato, tapioca, arrowroot\n";
      response += "• Focus on whole foods: Meat, fish, vegetables, fruits\n\n";
    }
    
    response += "**Key Considerations:**\n";
    response += "• Ensure adequate protein intake\n";
    response += "• Include variety for complete nutrition\n";
    response += "• Consider supplements if needed (B12 for vegans)\n";
    response += "• Monitor iron and calcium intake\n\n";
    
    response += "Would you like specific meal suggestions for your dietary needs?";
    return response;
  };

  const generateSupplementResponse = (entities) => {
    let response = "**Supplement Recommendations:**\n\n";
    
    response += "**Essential Supplements:**\n";
    response += "• **Multivitamin**: Fill nutritional gaps\n";
    response += "• **Vitamin D**: Especially if limited sun exposure\n";
    response += "• **Omega-3**: If not eating fatty fish regularly\n";
    response += "• **B12**: For vegetarians/vegans\n\n";
    
    response += "**Performance Supplements:**\n";
    response += "• **Protein Powder**: Convenient protein source\n";
    response += "• **Creatine**: 5g daily for strength/power\n";
    response += "• **Caffeine**: Pre-workout energy (200-400mg)\n";
    response += "• **BCAAs**: During fasted training\n\n";
    
    response += "**Important Notes:**\n";
    response += "• Supplements complement, don't replace whole foods\n";
    response += "• Consult healthcare provider before starting\n";
    response += "• Quality and dosage matter\n";
    response += "• Individual needs vary\n\n";
    
    response += "What specific supplement are you interested in?";
    return response;
  };

  const generateTimingResponse = (entities) => {
    let response = "**Nutrition Timing Guidelines:**\n\n";
    
    response += "**Pre-Workout (2-3 hours before):**\n";
    response += "• Complex carbs + protein\n";
    response += "• Examples: Oats with protein, chicken with rice\n";
    response += "• Hydration: 500ml water\n\n";
    
    response += "**During Workout (if >60 minutes):**\n";
    response += "• Simple carbs: Sports drink, banana\n";
    response += "• Hydration: 250ml every 15-20 minutes\n\n";
    
    response += "**Post-Workout (within 30 minutes):**\n";
    response += "• Protein + carbs for recovery\n";
    response += "• Examples: Protein shake, chicken with sweet potato\n";
    response += "• Rehydrate: 500ml water\n\n";
    
    response += "**General Meal Timing:**\n";
    response += "• Eat every 3-4 hours\n";
    response += "• Don't skip breakfast\n";
    response += "• Light dinner 2-3 hours before bed\n";
    response += "• Listen to hunger cues\n\n";
    
    response += "Would you like specific meal timing for your workout schedule?";
    return response;
  };

  const generateFallbackResponse = (userMessage) => {
    const fallbackResponses = [
      "I want to make sure I understand your nutrition question. Could you ask about specific foods, meal planning, macro calculations, or dietary restrictions?",
      "That's an interesting question! I'm designed to help with nutrition topics. Try asking about food nutrition, meal planning, or dietary advice.",
      "I'm here to help with your nutrition journey. Try asking about specific foods, meal timing, or how to meet your nutritional goals.",
      "I want to provide you with the best nutrition guidance. Could you ask about food information, meal planning, or dietary recommendations?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Add user message to chat
    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Process the message and generate response
    setTimeout(() => {
      const response = generateAdvancedResponse(userMessage);
      setChatHistory(prev => [...prev, { type: 'bot', text: response }]);
      setMessage('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <h2 className="text-xl font-bold">Advanced Nutrition AI</h2>
        <p className="text-sm opacity-90">Comprehensive nutrition guidance with context awareness</p>
      </div>
      
      <div className="h-96 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Ask me about any food's nutrition!</p>
              <p className="text-sm mt-2">Examples:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>"How many calories in chicken breast?"</li>
                <li>"What should I eat for breakfast?"</li>
                <li>"Help me plan a vegetarian meal"</li>
                <li>"Calculate my daily protein needs"</li>
              </ul>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about nutrition, foods, or meal planning..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NutritionChat; 