import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePersistentFilters } from '../utils/filterStorage';
import videoAccessService from '../services/videoAccessService';
import PremiumVideoOverlay from '../components/PremiumVideoOverlay';
import { motion } from 'framer-motion';

const videos = [
  // YOGA SERIES - All related yoga content
  {
    id: 1,
    title: "30-Day Yoga Challenge",
    instructor: "Priya Sharma",
    duration: "20-30 min",
    level: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Transform your body and mind with this comprehensive 30-day yoga journey.",
    tags: ["yoga", "beginner", "flexibility", "meditation"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 15678,
    likes: 1245,
    date: "2023-05-20",
    equipmentNeeded: ["yoga mat", "optional: blocks"],
    category: "yoga"
  },
  {
    id: 2,
    title: "Advanced Power Yoga Flow",
    instructor: "Priya Sharma",
    duration: "60 min",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Challenge yourself with this intense power yoga sequence.",
    tags: ["yoga", "advanced", "power", "strength"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 9876,
    likes: 789,
    date: "2023-05-30",
    equipmentNeeded: ["yoga mat", "blocks", "strap"],
    category: "yoga"
  },
  {
    id: 3,
    title: "Gentle Morning Yoga",
    instructor: "Kavya Iyer",
    duration: "25 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1520&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Start your day with this gentle and energizing yoga flow.",
    tags: ["yoga", "morning", "gentle", "beginner"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 19876,
    likes: 1567,
    date: "2023-05-25",
    equipmentNeeded: ["yoga mat"],
    category: "yoga"
  },
  {
    id: 4,
    title: "Evening Relaxation Yoga",
    instructor: "Kavya Iyer",
    duration: "30 min",
    level: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "Unwind and relax with this soothing evening yoga practice.",
    tags: ["yoga", "evening", "relaxation", "stress-relief"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 180,
    views: 8765,
    likes: 654,
    date: "2023-06-07",
    equipmentNeeded: ["yoga mat", "bolster", "blocks"],
    category: "yoga"
  },

  // CARDIO SERIES - All related cardio content
  {
    id: 5,
    title: "HIIT Cardio Blast",
    instructor: "Arjun Patel",
    duration: "45 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "High-intensity interval training to boost your metabolism.",
    tags: ["cardio", "hiit", "intermediate", "fat-burning"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 23456,
    likes: 1890,
    date: "2023-06-10",
    equipmentNeeded: ["none"],
    category: "cardio"
  },
  {
    id: 6,
    title: "Advanced HIIT Circuit",
    instructor: "Arjun Patel",
    duration: "50 min",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    description: "Push your limits with this advanced HIIT circuit training.",
    tags: ["cardio", "hiit", "advanced", "circuit"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 16543,
    likes: 1234,
    date: "2023-06-11",
    equipmentNeeded: ["none"],
    category: "cardio"
  },
  {
    id: 7,
    title: "Dance Cardio Workout",
    instructor: "Nisha Rao",
    duration: "40 min",
    level: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    description: "Get your groove on with this fun dance cardio workout.",
    tags: ["dance", "cardio", "fun", "music"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 22345,
    likes: 1789,
    date: "2023-06-08",
    equipmentNeeded: ["none"],
    category: "dance"
  },
  {
    id: 8,
    title: "Barre Fitness Class",
    instructor: "Nisha Rao",
    duration: "45 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    description: "Tone and sculpt your body with this barre fitness class.",
    tags: ["barre", "toning", "intermediate", "ballet"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 16543,
    likes: 1234,
    date: "2023-06-11",
    equipmentNeeded: ["none"],
    category: "barre"
  },

  // STRENGTH SERIES - All related strength content
  {
    id: 9,
    title: "Full Body Strength",
    instructor: "Rahul Verma",
    duration: "50 min",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    description: "Build strength and muscle with this comprehensive full-body workout.",
    tags: ["strength", "full-body", "advanced", "muscle-building"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 18923,
    likes: 1456,
    date: "2023-05-28",
    equipmentNeeded: ["dumbbells", "resistance bands"],
    category: "strength"
  },
  {
    id: 10,
    title: "Upper Body Focus",
    instructor: "Rahul Verma",
    duration: "40 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    description: "Focus on building upper body strength and definition.",
    tags: ["strength", "upper-body", "intermediate", "arms"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 12345,
    likes: 987,
    date: "2023-06-14",
    equipmentNeeded: ["none"],
    category: "strength"
  },

  // PILATES SERIES - All related pilates content
  {
    id: 11,
    title: "Pilates for Core Strength",
    instructor: "Kavya Iyer",
    duration: "40 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1518310952931-b1de897abd40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Strengthen your core with this Pilates workout.",
    tags: ["pilates", "core", "intermediate", "toning"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 14567,
    likes: 1123,
    date: "2023-06-05",
    equipmentNeeded: ["yoga mat"],
    category: "pilates"
  },
  {
    id: 12,
    title: "Pilates for Beginners",
    instructor: "Kavya Iyer",
    duration: "30 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Perfect introduction to Pilates for beginners.",
    tags: ["pilates", "beginner", "core", "flexibility"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 19876,
    likes: 1567,
    date: "2023-05-25",
    equipmentNeeded: ["yoga mat"],
    category: "pilates"
  },

  // CORE/ABS SERIES - All related core content
  {
    id: 13,
    title: "Core Workout Challenge",
    instructor: "Vikram Malhotra",
    duration: "25 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "Challenge your core with this intense ab workout.",
    tags: ["core", "intermediate", "challenge", "abs"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 15678,
    likes: 1234,
    date: "2023-06-12",
    equipmentNeeded: ["none"],
    category: "core"
  },
  {
    id: 14,
    title: "Quick 10-Minute Ab Workout",
    instructor: "Aditya Kapoor",
    duration: "10 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    description: "Quick and effective 10-minute ab workout.",
    tags: ["core", "beginner", "quick", "abs"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 31234,
    likes: 2456,
    date: "2023-06-18",
    equipmentNeeded: ["none"],
    category: "core"
  },

  // BEGINNER SERIES - All related beginner content
  {
    id: 15,
    title: "Weight Loss Workout",
    instructor: "Sonia Mehra",
    duration: "30 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "A beginner-friendly workout designed specifically for weight loss. Combines light cardio with targeted exercises.",
    tags: ["weight-loss", "beginner", "toning", "cardio"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 34567,
    likes: 2345,
    date: "2023-06-15",
    equipmentNeeded: ["none", "optional: light dumbbells"],
    category: "beginner"
  },
  {
    id: 16,
    title: "Senior-Friendly Fitness",
    instructor: "Rajesh Kumar",
    duration: "25 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1571019613591-2f9e969b7ee4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    description: "Gentle fitness routine designed specifically for seniors.",
    tags: ["senior", "beginner", "gentle", "mobility"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 18765,
    likes: 1456,
    date: "2023-06-03",
    equipmentNeeded: ["chair", "optional: light weights"],
    category: "beginner"
  },

  // QUICK WORKOUTS SERIES - All related quick content
  {
    id: 17,
    title: "Morning Stretch Routine",
    instructor: "Emily Parker",
    duration: "15 min",
    level: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    description: "Start your day right with this quick morning stretch routine. Increase blood flow, reduce stiffness, and boost energy.",
    tags: ["stretching", "morning", "quick", "all-levels"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 27890,
    likes: 1987,
    date: "2023-06-05",
    equipmentNeeded: ["none"],
    category: "quick"
  },
  {
    id: 18,
    title: "Kettlebell Total Body",
    instructor: "Jaya Menon",
    duration: "35 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    description: "Full body workout using kettlebells for strength and conditioning.",
    tags: ["strength", "kettlebell", "intermediate", "full-body"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 12345,
    likes: 987,
    date: "2023-06-14",
    equipmentNeeded: ["kettlebell"],
    category: "strength"
  },
  {
    id: 19,
    title: "Boxing Cardio",
    instructor: "Amit Shah",
    duration: "45 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Get your heart pumping with this boxing cardio workout.",
    tags: ["boxing", "cardio", "intermediate", "self-defense"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 16543,
    likes: 1234,
    date: "2023-06-11",
    equipmentNeeded: ["none", "optional: boxing gloves"],
    category: "boxing"
  },
  {
    id: 20,
    title: "Advanced Boxing Skills",
    instructor: "Amit Shah",
    duration: "60 min",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "Master advanced boxing techniques and combinations.",
    tags: ["boxing", "advanced", "skills", "technique"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 16543,
    likes: 1234,
    date: "2023-06-11",
    equipmentNeeded: ["none"],
    category: "boxing"
  },
  {
    id: 21,
    title: "Core Workout Challenge",
    instructor: "Vikram Malhotra",
    duration: "25 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "Challenge your core with this intense ab workout.",
    tags: ["core", "intermediate", "challenge", "abs"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 15678,
    likes: 1234,
    date: "2023-06-12",
    equipmentNeeded: ["none"],
    category: "core"
  },
  {
    id: 22,
    title: "Quick 10-Minute Ab Workout",
    instructor: "Aditya Kapoor",
    duration: "10 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    description: "Quick and effective 10-minute ab workout.",
    tags: ["core", "beginner", "quick", "abs"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 31234,
    likes: 2456,
    date: "2023-06-18",
    equipmentNeeded: ["none"],
    category: "core"
  },
  {
    id: 23,
    title: "Kettlebell Total Body",
    instructor: "Jaya Menon",
    duration: "35 min",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    description: "Full body workout using kettlebells for strength and conditioning.",
    tags: ["strength", "kettlebell", "intermediate", "full-body"],
    requiresPayment: true,
    accessLevel: "premium",
    previewDuration: 180,
    views: 12345,
    likes: 987,
    date: "2023-06-14",
    equipmentNeeded: ["kettlebell"],
    category: "strength"
  },
  {
    id: 24,
    title: "Senior-Friendly Fitness",
    instructor: "Rajesh Kumar",
    duration: "25 min",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1571019613591-2f9e969b7ee4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    description: "Gentle fitness routine designed specifically for seniors.",
    tags: ["senior", "beginner", "gentle", "mobility"],
    requiresPayment: false,
    accessLevel: "free",
    previewDuration: 300,
    views: 8765,
    likes: 654,
    date: "2023-06-17",
    equipmentNeeded: ["none"],
    category: "senior"
  }
];

// Export videos array for use in other components
export { videos };

// Function to get related videos based on category and tags
export const getRelatedVideos = (currentVideo, allVideos, limit = 6) => {
  if (!currentVideo || !allVideos) return [];
  
  // Score videos based on relevance with category-based system
  const scoredVideos = allVideos
    .filter(v => v.id !== currentVideo.id) // Exclude current video
    .map(v => {
      let score = 0;
      
      // Same instructor (highest priority - 25 points)
      if (v.instructor === currentVideo.instructor) {
        score += 25;
      }
      
      // Same category (20 points) - This is the main relationship
      if (v.category === currentVideo.category) {
        score += 20;
      }
      
      // Same level (15 points)
      if (v.level === currentVideo.level) {
        score += 15;
      }
      
      // Common tags (5 points per tag)
      const commonTags = currentVideo.tags.filter(tag => v.tags.includes(tag));
      score += commonTags.length * 5;
      
      // Similar duration (within 15 minutes - 3 points)
      const currentDuration = parseInt(currentVideo.duration);
      const relatedDuration = parseInt(v.duration);
      if (Math.abs(currentDuration - relatedDuration) <= 15) {
        score += 3;
      }
      
      // Same equipment needs (2 points per common equipment)
      if (v.equipmentNeeded && currentVideo.equipmentNeeded) {
        const commonEquipment = v.equipmentNeeded.filter(item => 
          currentVideo.equipmentNeeded.includes(item)
        );
        score += commonEquipment.length * 2;
      }
      
      // Premium vs free preference (1 point for similar access)
      if (v.requiresPayment === currentVideo.requiresPayment) {
        score += 1;
      }
      
      return { ...v, relevanceScore: score };
    })
    .filter(v => v.relevanceScore > 0) // Only include videos with some relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, limit);
  
  return scoredVideos;
};

// Function to get videos by category
export const getVideosByCategory = (category, allVideos) => {
  return allVideos.filter(video => video.category === category);
};

const FeaturedVideosPage = ({ routing }) => {
  // Use persistent filters instead of regular state
  const [filters, updateFilters, resetFilters] = usePersistentFilters('featuredVideos', {
    selectedCategory: 'all',
    searchTerm: ''
  });
  
  const { selectedCategory, searchTerm } = filters;
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [userStatus, setUserStatus] = useState({});
  const [showRelatedVideos, setShowRelatedVideos] = useState(false);

  // Load user status and available videos
  useEffect(() => {
    const loadUserData = () => {
      const status = videoAccessService.getUserSubscriptionStatus();
      setUserStatus(status);
      
      const videosWithAccess = videoAccessService.getAvailableVideos(videos);
      setAvailableVideos(videosWithAccess);
    };

    loadUserData();
    
    // Set up interval to refresh user status
    const interval = setInterval(loadUserData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredVideos = availableVideos.filter(video => {
    // Filter by search term
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         video.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || video.tags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Videos' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'hiit', label: 'HIIT' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'strength', label: 'Strength' },
    { id: 'pilates', label: 'Pilates' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'core', label: 'Core & Abs' },
    { id: 'quick', label: 'Quick (<15 min)' },
    { id: 'low-impact', label: 'Low Impact' },
    { id: 'dance', label: 'Dance' },
    { id: 'barre', label: 'Barre' },
    { id: 'boxing', label: 'Boxing' },
    { id: 'senior', label: 'Senior' }
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowRelatedVideos(true);
    
    // Check if user can access the video
    const access = videoAccessService.canAccessVideo(video);
    if (!access.canAccess && access.reason === 'upgrade_required') {
      setShowPremiumOverlay(true);
    } else {
      // Navigate to video page
      if (routing && routing.navigateTo) {
        routing.navigateTo('video', { id: video.id });
      }
    }
  };

  const handleUpgrade = () => {
    setShowPremiumOverlay(false);
    if (routing && routing.navigateTo) {
      routing.navigateTo('subscription');
    }
  };

  const handleLogin = () => {
    setShowPremiumOverlay(false);
    if (routing && routing.navigateTo) {
      routing.navigateTo('login');
    }
  };

  const getFreeVideosCount = () => {
    return availableVideos.filter(video => !video.requiresPayment).length;
  };

  const getPremiumVideosCount = () => {
    return availableVideos.filter(video => video.requiresPayment).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      {/* Header */}
      <header className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Featured Workout Videos</h1>
          <p className="text-xl text-gray-300 max-w-3xl mb-6">Discover our collection of premium workout videos for all fitness levels and goals.</p>
          
          {/* Video Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-green-400 font-semibold">{getFreeVideosCount()}</span> Free Videos
            </div>
            <div className="bg-purple-500/20 rounded-lg px-4 py-2">
              <span className="text-purple-400 font-semibold">{getPremiumVideosCount()}</span> Premium Videos
            </div>
            {userStatus.subscription && (
              <div className="bg-blue-500/20 rounded-lg px-4 py-2">
                <span className="text-blue-400 font-semibold capitalize">{userStatus.subscription.currentPlan}</span> Plan
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Search and Filter */}
      <div className="bg-white py-6 shadow-md sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                  value={searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => updateFilters({ selectedCategory: category.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Videos Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative group aspect-video overflow-hidden bg-gray-200">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Premium Badge */}
                    {video.requiresPayment && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        PREMIUM
                      </div>
                    )}
                    
                    {/* Access Status Badge */}
                    {!video.canAccess && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        🔒 LOCKED
                      </div>
                    )}
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <div className="bg-white/90 hover:bg-white text-purple-600 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
                        {video.canAccess ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">{video.level}</span>
                      <span className="text-xs font-medium text-gray-500">{video.duration}</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">with {video.instructor}</span>
                      <div className="flex items-center space-x-2">
                        {video.canAccess ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Watch Now
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                            Upgrade to Watch
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No videos found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Related Videos Section */}
      {showRelatedVideos && selectedVideo && (
        <section className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Related to "{selectedVideo.title}"
              </h2>
              <button
                onClick={() => setShowRelatedVideos(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRelatedVideos(selectedVideo, availableVideos, 6).map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleVideoClick(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Premium Badge */}
                    {video.requiresPayment && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        PREMIUM
                      </div>
                    )}
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <div className="bg-white/90 hover:bg-white text-purple-600 rounded-full p-2 transform transition-transform duration-300 group-hover:scale-110">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">{video.level}</span>
                      <span className="text-xs font-medium text-gray-500">{video.duration}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">with {video.instructor}</span>
                      {video.relevanceScore && (
                        <span className="text-xs text-gray-400">
                          {video.relevanceScore}% match
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Premium Video Overlay */}
      <PremiumVideoOverlay
        video={selectedVideo}
        isVisible={showPremiumOverlay}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onClose={() => setShowPremiumOverlay(false)}
      />
      
      <Footer routing={routing} />
    </div>
  );
};

export default FeaturedVideosPage; 