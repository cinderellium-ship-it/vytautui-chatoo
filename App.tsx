// Redeploy trigger Jan 18
import React, { useState, useCallback } from 'react';
import MessageList from './MessageList.tsx';
import MessageInput from './MessageInput.tsx';
import { Message } from './types';
import { INITIAL_MESSAGE } from './constants';
import { geminiService } from './geminiService.ts';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: INITIAL_MESSAGE, timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    let fullResponse = "";
    setMessages(prev => [...prev, { role: 'model', text: "", timestamp: new Date() }]);

    try {
      await geminiService.sendMessageStream(text, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { 
              role: 'model', 
              text: fullResponse, 
              timestamp: new Date() 
            };
            return updated;
        });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50 active:scale-90"
        aria-label="Toggle Chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] sm:h-[600px] max-h-[80vh] flex flex-col shadow-2xl bg-white rounded-2xl border border-gray-200 overflow-hidden z-40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <header className="bg-blue-700 text-white p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">Santechnikas Vytautas</h1>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Asistentas pasiruošęs padėti
                </p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white/70 hover:text-white sm:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </header>

          {/* Main Chat Area */}
          <MessageList messages={messages} isTyping={isTyping} />

          {/* Footer / Input */}
          <MessageInput onSend={handleSendMessage} disabled={isTyping} />
          
          <div className="bg-gray-50 px-4 py-1.5 text-center border-t border-gray-100">
            <p className="text-[9px] text-gray-400">
              Atsakymai generuojami automatiškai
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
