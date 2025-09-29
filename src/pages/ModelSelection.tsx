import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Cpu, Check } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

const FREE_MODELS: Model[] = [
  { id: 'x-ai/grok-4-fast:free', name: 'Grok-4 Fast', provider: 'x-ai', description: 'Fast and reliable AI assistant' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini-2.0-Flash-Exp', provider: 'Google', description: 'Slow But reliable AI assistant' },
 
];

const ModelSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const handleContinue = () => {
    if (selectedModel && apiKey) {
      sessionStorage.setItem('selectedModel', selectedModel);
      sessionStorage.setItem('apiKey', apiKey);
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-20%] w-[35rem] h-[35rem] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Configure Your AI Assistant
          </h1>
        </motion.header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Model Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
          >
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Cpu className="w-7 h-7 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Select AI Model</h2>
              </div>
              <div className="space-y-4 max-h-[32rem] overflow-y-auto custom-scrollbar pr-2">
                {FREE_MODELS.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 80 }}
                    className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                        : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-700/30'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <p className="text-sm text-gray-400">{model.provider}</p>
                        {model.description && (
                          <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {model.description}
                          </p>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <Check className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* API Key Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 80 }}
          >
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Key className="w-7 h-7 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">API Configuration</h2>
              </div>
              <div className="space-y-8">
                {/* API Input */}
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-3">
                    OpenRouter API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                      placeholder="Enter your OpenRouter API key"
                      className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Need an API Key?</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Get your free OpenRouter API key to access all available models.
                  </p>
                  <a
                    href="https://openrouter.ai/models?max_price=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    Get API Key →
                  </a>
                </div>

                {/* Continue Button */}
                <motion.button
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-base"
                  disabled={!selectedModel || !apiKey}
                  onClick={handleContinue}
                  whileHover={{ scale: selectedModel && apiKey ? 1.02 : 1 }}
                  whileTap={{ scale: selectedModel && apiKey ? 0.98 : 1 }}
                >
                  Continue to Chat
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(68, 1, 1, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ModelSelection;
