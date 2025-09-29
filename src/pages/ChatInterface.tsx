import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Wand2, Code } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your AI assistant for building Python automation scripts. Let's automate something amazing! What kind of task would you like to automate? For example:\n\n• Web scraping data from a website\n• Organizing files in a folder\n• Scheduling API calls\n• Processing CSV files\n\nShare your idea, and I'll guide you step-by-step!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const selectedModel = sessionStorage.getItem('selectedModel');
  const apiKey = sessionStorage.getItem('apiKey');

  useEffect(() => {
    if (!selectedModel || !apiKey) {
      navigate('/select-model');
    }
  }, [selectedModel, apiKey, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000; // Initial delay in ms

    while (attempt < maxRetries) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content:
                  'You are a professional AI assistant specializing in creating Python automation scripts. Guide users to refine their automation task requirements with clear, conversational questions about functionality, inputs, outputs, and dependencies. Ensure detailed requirements for generating Python code later, focusing on a single-file script. Do not generate code yet, only create a plan for the automation task also to the point answer and good ui answer no ** or no ## , make everything neat and clean.',
              },
              ...messages.map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
              {
                role: 'user',
                content: inputMessage,
              },
            ],
            max_tokens: 5000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

        const data = await response.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.choices[0].message.content,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
        return; // Success, exit the loop
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt === maxRetries) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, I hit a snag after several tries. Please check your API key and try again.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  };

  const generateAutomation = async () => {
    setIsGenerating(true);
    const conversationContext = messages.map((msg) => `${msg.sender}: ${msg.content}`).join('\n\n');

    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000; // Initial delay in ms

    while (attempt < maxRetries) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: 'system',
                content: `You are an expert Python developer specializing in automation scripts. Generate a complete, production-ready Python script for an automation task based on the conversation history, along with a full requirements.txt file listing all dependencies, and a comprehensive README.md with A-Z instructions on structure, setup, and running the script.

Requirements:
1. Use relevant Python libraries based on the task (e.g., requests, selenium, pandas, schedule, openpyxl)
2. Include all necessary imports
3. Add comprehensive error handling
4. Include detailed comments
5. Add configuration variables
6. Implement all discussed features
7. Ensure modular, readable code
8. Prefer a single-file script, but if additional files, folders, or configurations (e.g., data directories, config files) are needed, describe them clearly in the README with creation instructions. Do not generate .env files; use inline configs or command-line args.
9. Make sure the generated code doesn't show errors when run, with proper commenting etc
10. Never wrap the code inside triple backticks ('''python''') — output must be plain Python code only
11. For the requirements.txt, list all necessary packages with versions (e.g., requests==2.32.3, pandas==2.2.2)
12. For the README.md, provide full A-Z structure: project overview, required files/folders (if any), installation steps (including pip install -r requirements.txt), configuration, how to run (command-line examples), troubleshooting, etc. Output as plain Markdown text.
13. Output format: First, the full Python code with comments, then a separator '---REQUIREMENTS---', then the contents of requirements.txt as plain text, then '---README---', then the contents of README.md as plain Markdown text.

Output only the Python code with comments, followed by the separators, requirements.txt content, and README.md content.`,
              },
              {
                role: 'user',
                content: `Based on our conversation:\n\n${conversationContext}\n\nGenerate a complete Python automation script with all discussed features, the full requirements.txt, and a comprehensive README.md.`,
              },
            ],
            max_tokens: 8000,
            temperature: 0.6,
          }),
        });

        if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

        const data = await response.json();
        const generatedContent: string = data.choices[0].message.content;

        // Split the content into Python code, requirements.txt, and README.md
        const [generatedCode, rest] = generatedContent.split('---REQUIREMENTS---').map(part => part.trim());
        const [requirementsContent, readmeContent] = rest.split('---README---').map(part => part.trim());

        sessionStorage.setItem('generatedCode', generatedCode);
        sessionStorage.setItem('requirementsTxt', requirementsContent);
        sessionStorage.setItem('readmeMd', readmeContent);
        sessionStorage.setItem('conversationContext', conversationContext);

        navigate('/code-editor');
        setIsGenerating(false);
        return; // Success, exit the loop
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt === maxRetries) {
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: 'I ran into an issue generating your automation script after several tries. Please try again.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsGenerating(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute pointer-events-none">
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

      {/* Header */}
      <motion.header
        className="bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/50 p-4 sticky top-0 z-20 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/select-model')}
              className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Automation Script Designer
                </h1>
                <p className="text-sm text-gray-400 hidden sm:block">Craft your perfect Python automation script</p>
              </div>
            </div>
          </div>
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg w-full sm:w-auto"
            onClick={generateAutomation}
            disabled={messages.length <= 1 || isGenerating}
            whileHover={{ scale: messages.length > 1 && !isGenerating ? 1.05 : 1 }}
            whileTap={{ scale: messages.length > 1 && !isGenerating ? 0.95 : 1 }}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                <span>Generate Automation</span>
              </div>
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 container mx-auto space-y-4 custom-scrollbar relative z-10 max-h-[calc(100vh-200px)]"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 80 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start gap-3 max-w-xs sm:max-w-md lg:max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`p-4 rounded-2xl shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-900/60 backdrop-blur-xl text-white border border-gray-700/50'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs mt-2 text-gray-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3 max-w-xs sm:max-w-md lg:max-w-2xl">
              <div className="p-2 rounded-full bg-purple-600">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                  </motion.div>
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.footer
        className="bg-gray-900/60 backdrop-blur-xl border-t border-gray-700/50 p-4 sticky bottom-0 z-20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your automation task in detail..."
            className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm"
            rows={3}
            disabled={isLoading}
          />
          <motion.button
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            whileHover={{ scale: inputMessage.trim() && !isLoading ? 1.05 : 1 }}
            whileTap={{ scale: inputMessage.trim() && !isLoading ? 0.95 : 1 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.footer>

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

export default ChatInterface;