import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post('http://localhost:4000/api/v1/aichat/chat', { message: input });
      const botMessage = { from: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { from: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-24 right-5 w-80 h-[28rem] bg-white rounded-xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'transform scale-100' : 'transform scale-0'}`}>
        <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-xl">
          <h3 className="font-bold text-lg">Gemini AI Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><FaTimes /></button>
        </div>
        <div className="h-80 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`my-2 p-3 rounded-lg max-w-xs ${msg.from === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          ))}
          {isLoading && <div className="my-2 p-3 rounded-lg max-w-xs bg-gray-200"><p className="text-sm">Thinking...</p></div>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={() => setIsOpen(true)} 
        className={`fixed bottom-5 right-5 w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all duration-300 ${isOpen ? 'transform scale-0' : 'transform scale-100'}`}
      >
        <img src="https://static.vecteezy.com/system/resources/previews/056/850/690/non_2x/gemini-ai-app-icon-with-transparent-background-free-png.png" alt="Chat" className="w-10 h-10" />
      </button>
    </>
  );
};

export default AIChatBot; 