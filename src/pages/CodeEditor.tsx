import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Edit3, Wand2, Check, Send, Bot, User, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const CodeEditor: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [readme, setReadme] = useState<string>('');
  const [isEditingCode, setIsEditingCode] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>('');
  const [editedRequirements, setEditedRequirements] = useState<string>('');
  const [editedReadme, setEditedReadme] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);
  const [isCopiedRequirements, setIsCopiedRequirements] = useState<boolean>(false);
  const [isCopiedReadme, setIsCopiedReadme] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<'chat' | 'refine'>('chat');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedModel = sessionStorage.getItem('selectedModel');
  const apiKey = sessionStorage.getItem('apiKey');
  const conversationContext = sessionStorage.getItem('conversationContext') || '';

  useEffect(() => {
    const storedCode = sessionStorage.getItem('generatedCode');
    const storedRequirements = sessionStorage.getItem('requirementsTxt');
    const storedReadme = sessionStorage.getItem('readmeMd');

    if (!storedCode || !selectedModel || !apiKey) {
      navigate('/select-model');
      return;
    }

    setCode(storedCode);
    setEditedCode(storedCode);
    setRequirements(storedRequirements || '');
    setEditedRequirements(storedRequirements || '');
    setReadme(storedReadme || '');
    setEditedReadme(storedReadme || '');
    setIsLoading(false);
  }, [selectedModel, apiKey, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const downloadFolder = async () => {
    const finalCode = isEditingCode ? editedCode : code;
    const finalRequirements = isEditingCode ? editedRequirements : requirements;
    const finalReadme = isEditingCode ? editedReadme : readme;

    const zip = new JSZip();
    const folder = zip.folder('automation_script');

    folder?.file('script.py', finalCode);
    folder?.file('requirements.txt', finalRequirements);
    folder?.file('README.md', finalReadme);

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'automation_script.zip');
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      setError('Failed to generate and download the folder.');
    }
  };

  const copyCode = async () => {
    const finalCode = isEditingCode ? editedCode : code;
    try {
      await navigator.clipboard.writeText(finalCode);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      setError('Failed to copy code to clipboard.');
    }
  };

  const copyRequirements = async () => {
    const finalRequirements = isEditingCode ? editedRequirements : requirements;
    try {
      await navigator.clipboard.writeText(finalRequirements);
      setIsCopiedRequirements(true);
      setTimeout(() => setIsCopiedRequirements(false), 2000);
    } catch (err) {
      console.error('Failed to copy requirements:', err);
      setError('Failed to copy requirements to clipboard.');
    }
  };

  const copyReadme = async () => {
    const finalReadme = isEditingCode ? editedReadme : readme;
    try {
      await navigator.clipboard.writeText(finalReadme);
      setIsCopiedReadme(true);
      setTimeout(() => setIsCopiedReadme(false), 2000);
    } catch (err) {
      console.error('Failed to copy README:', err);
      setError('Failed to copy README to clipboard.');
    }
  };

  const handleInputSubmit = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);

    if (mode === 'refine') {
      await refineCode();
    } else {
      await sendChatMessage();
    }

    setIsProcessing(false);
  };

  const refineCode = async () => {
    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000;

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
                content: `You are an expert Python developer. Update the provided Python automation script, requirements.txt, and README.md based on the user's modification request while maintaining existing functionality. 
Output format: First, the full updated Python code, then '---REQUIREMENTS---', then the updated contents of requirements.txt, then '---README---', then the updated contents of README.md as plain Markdown text.
Return only the complete, updated Python code with comments, requirements.txt, and README.md.`,
              },
              {
                role: 'user',
                content: `Current code:\n\n${isEditingCode ? editedCode : code}\n\nCurrent requirements.txt:\n\n${isEditingCode ? editedRequirements : requirements}\n\nCurrent README.md:\n\n${isEditingCode ? editedReadme : readme}\n\nModification request: ${inputText}\n\nReturn the complete updated code, requirements.txt, and README.md.`,
              },
            ],
            max_tokens: 9000,
            temperature: 0.4,
          }),
        });

        if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

        const data = await response.json();
        const refinedContent: string = data.choices[0]?.message?.content || '';

        if (!refinedContent.includes('---REQUIREMENTS---') || !refinedContent.includes('---README---')) {
          throw new Error('Invalid response format: Missing separators');
        }

        const [refinedCode, rest] = refinedContent.split('---REQUIREMENTS---').map(part => part.trim());
        const [refinedRequirements, refinedReadme] = rest.split('---README---').map(part => part.trim());

        setEditedCode(refinedCode);
        setEditedRequirements(refinedRequirements);
        setEditedReadme(refinedReadme);
        setIsEditingCode(true);
        setInputText('');
        return;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt === maxRetries) {
          setError(`Failed to refine code after ${maxRetries} attempts. Please try again later.`);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const sendChatMessage = async () => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputText('');

    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000;

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
                content: 'You are a helpful AI assistant for discussing and explaining the generated Python automation script. Provide insights, explanations, or suggestions, but do not generate or modify code here. For code changes, suggest using the refine feature.',
              },
              ...chatMessages.map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
              {
                role: 'user',
                content: `Conversation context from automation design: ${conversationContext}\n\n${inputText}`,
              },
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

        const data = await response.json();
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.choices[0]?.message?.content || 'No response from AI.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, aiResponse]);
        return;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt === maxRetries) {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: 'Sorry, I hit a snag after several tries. Please try again.',
            sender: 'ai',
            timestamp: new Date(),
          };
          setChatMessages((prev) => [...prev, errorMessage]);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          <div className="w-2 h-2 bg-white rounded-full" />
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>Loading...</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <p className="text-red-400">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white"
          onClick={() => navigate('/chat')}
        >
          Back to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset pointer-events-none">
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1">
        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <motion.button
            onClick={() => navigate('/chat')}
            className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Automation Script Editor
          </h1>
        </motion.header>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 80 }}
        >
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium text-sm shadow-md hover:shadow-purple-500/30 transition-all duration-300"
            onClick={() => setIsEditingCode(!isEditingCode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>{isEditingCode ? 'View Mode' : 'Edit Mode'}</span>
            </div>
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium text-sm shadow-md hover:shadow-purple-500/30 transition-all duration-300"
            onClick={copyCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              {isCopiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedCode ? 'Copied Code!' : 'Copy Code'}</span>
            </div>
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium text-sm shadow-md hover:shadow-purple-500/30 transition-all duration-300"
            onClick={copyRequirements}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              {isCopiedRequirements ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedRequirements ? 'Copied Req!' : 'Copy Req'}</span>
            </div>
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium text-sm shadow-md hover:shadow-purple-500/30 transition-all duration-300"
            onClick={copyReadme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              {isCopiedReadme ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedReadme ? 'Copied README!' : 'Copy README'}</span>
            </div>
          </motion.button>
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium text-sm shadow-md hover:shadow-purple-500/30 transition-all duration-300"
            onClick={downloadFolder}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Download Folder</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          {/* Code Files Section */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
          >
            {/* Python Code */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl flex flex-col min-h-[40vh] max-h-[40vh]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Code className="w-6 h-6 text-purple-400" />
                script.py
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isEditingCode ? (
                  <textarea
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="w-full h-full p-4 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none custom-scrollbar"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', lineHeight: '1.5', tabSize: 4 }}
                    spellCheck={false}
                  />
                ) : (
                  <div className="h-full overflow-y-auto custom-scrollbar">
                    <SyntaxHighlighter
                      language="python"
                      style={atomDark}
                      customStyle={{
                        margin: 0,
                        padding: '16px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        borderRadius: '12px',
                        height: '100%',
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements.txt */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl flex flex-col min-h-[20vh] max-h-[20vh]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Code className="w-6 h-6 text-purple-400" />
                requirements.txt
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isEditingCode ? (
                  <textarea
                    value={editedRequirements}
                    onChange={(e) => setEditedRequirements(e.target.value)}
                    className="w-full h-full p-4 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none custom-scrollbar"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', lineHeight: '1.5', tabSize: 4 }}
                    spellCheck={false}
                  />
                ) : (
                  <div className="h-full p-4 text-sm whitespace-pre-wrap bg-gray-800/70 rounded-xl overflow-y-auto custom-scrollbar">
                    {requirements}
                  </div>
                )}
              </div>
            </div>

            {/* README.md */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl flex flex-col min-h-[20vh] max-h-[20vh]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Code className="w-6 h-6 text-purple-400" />
                README.md
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isEditingCode ? (
                  <textarea
                    value={editedReadme}
                    onChange={(e) => setEditedReadme(e.target.value)}
                    className="w-full h-full p-4 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none custom-scrollbar"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace', lineHeight: '1.5', tabSize: 4 }}
                    spellCheck={false}
                  />
                ) : (
                  <div className="h-full p-4 text-sm whitespace-pre-wrap bg-gray-800/70 rounded-xl overflow-y-auto custom-scrollbar">
                    {readme}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Interaction Section */}
          <motion.div
            className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl flex flex-col flex-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 80 }}
          >
            {/* Mode Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                className={`flex items-center gap-2 text-white font-medium px-4 py-2 rounded-xl ${mode === 'chat' ? 'bg-purple-500/20 border-purple-500' : 'bg-gray-800/50 border-gray-700/50'} border transition-all duration-300`}
                onClick={() => setMode('chat')}
              >
                <Code className="w-5 h-5" />
                <span>Chat with AI</span>
              </button>
              <button
                className={`flex items-center gap-2 text-white font-medium px-4 py-2 rounded-xl ${mode === 'refine' ? 'bg-purple-500/20 border-purple-500' : 'bg-gray-800/50 border-gray-700/50'} border transition-all duration-300`}
                onClick={() => setMode('refine')}
              >
                <Wand2 className="w-5 h-5" />
                <span>Refine Code</span>
              </button>
            </div>

            {/* Chat Messages (Visible in Chat Mode) */}
            {mode === 'chat' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="flex-1 overflow-y-auto space-y-4 custom-scrollbar mb-4"
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[85%] ${
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
                        className={`p-3 rounded-xl text-sm ${
                          message.sender === 'user' ? 'bg-blue-600/50 text-white' : 'bg-gray-800/70 text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isProcessing && mode === 'chat' && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-purple-600">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-3 rounded-xl bg-gray-800/70">
                        <motion.div
                          className="flex gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                          <div className="w-2 h-2 bg-white/60 rounded-full" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </motion.div>
            )}

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-end gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={mode === 'chat' ? 'Ask about the automation script...' : 'Specify refinements (e.g., add logging, improve error handling, add new functionality)...'}
                  className="flex-1 px-4 py-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
                <motion.button
                  className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white disabled:opacity-50"
                  onClick={handleInputSubmit}
                  disabled={!inputText.trim() || isProcessing}
                  whileHover={{ scale: inputText.trim() && !isProcessing ? 1.05 : 1 }}
                  whileTap={{ scale: inputText.trim() && !isProcessing ? 0.95 : 1 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              {isProcessing && mode === 'refine' && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-300">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Refining code...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
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

export default CodeEditor;