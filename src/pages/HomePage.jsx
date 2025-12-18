import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import FeaturedWorkouts from '../components/FeaturedWorkouts'
import WorkoutCategories from '../components/WorkoutCategories'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'
import NutritionDashboard from '../components/NutritionDashboard'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const HomePage = ({ routing }) => {
  // Set document title
  useEffect(() => {
    document.title = 'FitPro - Home';
  }, []);

  // Debug authentication state
  useEffect(() => {
    console.log('HomePage - Authentication state:', routing?.isAuthenticated);
    console.log('HomePage - Routing object:', routing);
  }, [routing?.isAuthenticated]);
  
  return (
    <AnimatePresence>
      <motion.div 
        className="min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Navbar routing={routing} />
        </motion.div>

        <main>
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              ease: [0.6, -0.05, 0.01, 0.99]
            }}
          >
            <Hero routing={routing} />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-16"
          >
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FeaturedWorkouts routing={routing} />
            </motion.div>

            <motion.div 
              className="container mx-auto px-4 py-8"
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-800 mb-6"
                variants={slideInLeft}
              >
                Your Fitness Dashboard
              </motion.h2>
              <motion.div 
                variants={scaleIn}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <NutritionDashboard routing={routing} />
              </motion.div>
            </motion.div>

            <motion.div 
              variants={slideInRight}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <WorkoutCategories routing={routing} />
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Testimonials />
            </motion.div>

            <motion.div 
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Pricing routing={routing} />
            </motion.div>
          </motion.div>
        </main>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <Footer routing={routing} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePage; 