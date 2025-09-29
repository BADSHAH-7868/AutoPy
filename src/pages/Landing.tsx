import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Code, ChevronDown, ChevronUp } from 'lucide-react';
import Spline from '@splinetool/react-spline';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Do I need coding experience to use AutoPy AI?',
    answer:
      'No! AutoPy AI is designed for everyone. Just describe the task you want to automate, and our AI will generate a Python script with all dependencies included.',
  },
  {
    question: 'What kind of automation scripts can I create?',
    answer:
      'You can automate a wide range of tasks, including web scraping, file organization, API interactions, data processing, scheduling tasks, and more, using libraries like requests, selenium, pandas, and schedule.',
  },
  {
    question: 'Is the generated code ready to run?',
    answer:
      'Yes, the code is production-ready, complete with a requirements.txt file for easy setup. You can run it locally or deploy it on platforms like AWS, Google Cloud, or your own server.',
  },
  {
    question: 'How do I get an API key?',
    answer:
      'You can get a free OpenRouter API key from https://openrouter.ai/keys to access our supported AI models for code generation.',
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSpline, setShowSpline] = useState(true);

  // Detect viewport size and toggle Spline visibility
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Hide Spline if viewport is approximately 570x1270
      if (width <= 1000 && height <= 1700) {
        setShowSpline(false);
      } else {
        setShowSpline(true);
      }
    };

    // Run on mount and on resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans">
      {/* Hero Section with Spline Background */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Spline (conditionally rendered) */}
        {showSpline && (
          <div className="absolute inset-0 z-0">
            <Spline scene="https://prod.spline.design/ZUynamjHU4Dfp1ni/scene.splinecode" />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
          </div>
        )}

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Logo and Title */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="p-4 bg-gradient-to-r from-purple-700 to-blue-700 rounded-full shadow-2xl">
              <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Ahsan Labs AutoPy AI
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-xl sm:text-2xl lg:text-3xl text-gray-200 max-w-3xl mx-auto leading-relaxed mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Automate your future with AI-generated Python scripts.
          </motion.p>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            No coding skills required. Describe your task, and our AI crafts futuristic, production-ready Python code
            with libraries like selenium, requests, and pandas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/select-model')}
            >
              Build Your Automation Now
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-gray-800/50 rounded-full text-white font-semibold text-lg hover:bg-gray-700/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open("https://whatsapp.com/channel/0029Vb6cRL43GJOqdGUq4q0Q", "_blank")}
            >
              Join Ahsan Labs
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Why AutoPy AI Section */}
      <section id="why" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <motion.div
          className="container mx-auto text-center space-y-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Why Choose AutoPy AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(147, 51, 234, 0.3)' }}
            >
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Intelligent AI Generation</h3>
              <p className="text-gray-300 text-sm">
                Our AI crafts optimized, secure Python scripts tailored to your automation needs with futuristic precision.
              </p>
            </motion.div>
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 hover:border-cyan-500/50 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
            >
              <Code className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Production-Ready Code</h3>
              <p className="text-gray-300 text-sm">
                Receive complete Python scripts with requirements.txt, ready for local execution or deployment on any platform.
              </p>
            </motion.div>
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(147, 51, 234, 0.3)' }}
            >
              <Zap className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Futuristic Automation</h3>
              <p className="text-gray-300 text-sm">
                Automate tasks like web scraping and file management with AI-generated scripts, no coding expertise needed.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <motion.div
          className="container mx-auto text-center space-y-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-300 text-sm mb-4">
                "AutoPy AI transformed my workflow by generating a web scraping script in minutes. It’s futuristic and
                flawless!"
              </p>
              <p className="text-white font-semibold">Alex M., Data Analyst</p>
            </motion.div>
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-300 text-sm mb-4">
                "As a non-coder, I automated my business’s file organization with AutoPy AI. It’s like magic!"
              </p>
              <p className="text-white font-semibold">Sarah K., Small Business Owner</p>
            </motion.div>
            <motion.div
              className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-900/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-300 text-sm mb-4">
                "The AI-generated API scheduling script was perfect. I tweaked it easily with a few prompts!"
              </p>
              <p className="text-white font-semibold">James T., Developer</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <motion.div
          className="container mx-auto text-center space-y-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq: FAQ, index: number) => (
              <motion.div
                key={index}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-purple-900/50 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className="w-full flex justify-between items-center text-left text-white text-lg font-semibold"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.p
                    className="text-gray-300 text-sm mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Ready to Automate Your Future?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands of users streamlining their workflows with AutoPy AI’s futuristic Python scripts.
          </p>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/select-model')}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
