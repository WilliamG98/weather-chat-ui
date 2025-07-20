import React, { useState, useRef, useEffect } from 'react';
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';

function App() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<{ credential: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot' as const, text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot' as const, text: 'Sorry, there was an error contacting the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setUser({ credential: credentialResponse.credential });
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <div className="h-[100dvh] bg-gray-100 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-2xl rounded-b-2xl mx-auto flex flex-col h-full">
        <div className="flex items-center justify-center relative">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-center py-3 sm:py-4 border-b border-gray-200 bg-blue-500 text-white rounded-t-2xl w-full">
            Weather Chat
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-blue-500 border border-blue-500 px-3 py-1 sm:px-4 sm:py-1.5 rounded shadow hover:bg-blue-50 transition-colors text-xs sm:text-sm font-semibold"
            >
              Sign out
            </button>
          )}
        </div>
        <div className="flex flex-col items-center py-2 sm:py-4">
          {!user && (
            <GoogleLogin onSuccess={handleLoginSuccess} onError={() => {}} />
          )}
        </div>
        {user && (
          <>
            <div className="flex-1 flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.sender === 'user'
                      ? 'self-end bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg max-w-[85vw] sm:max-w-lg text-sm sm:text-base'
                      : 'self-start bg-gray-200 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg max-w-[85vw] sm:max-w-lg text-sm sm:text-base'
                  }
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="self-start text-gray-400 italic">Bot is typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="flex gap-2 sm:gap-3 p-2 sm:p-4 border-t border-gray-200" onSubmit={handleSend}>
              <input
                type="text"
                className="flex-1 px-3 py-3 sm:px-3 sm:py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-base sm:text-lg"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-3 sm:px-5 sm:py-2 rounded hover:bg-blue-600 text-base sm:text-lg disabled:opacity-50"
                disabled={!input.trim() || loading}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
