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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, there was an error contacting the server.' }]);
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-b-2xl scale-125 relative">
        <div className="flex items-center justify-center relative">
          <div className="text-2xl font-bold text-center py-4 border-b border-gray-200 bg-blue-500 text-white rounded-t-2xl w-full">
            Weather Chat
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white text-blue-500 border border-blue-500 px-4 py-1 rounded shadow hover:bg-blue-50 transition-colors text-sm font-semibold"
            >
              Sign out
            </button>
          )}
        </div>
        <div className="flex flex-col items-center py-4">
          {!user && (
            <GoogleLogin onSuccess={handleLoginSuccess} onError={() => {}} />
          )}
        </div>
        {user && (
          <>
            <div className="flex-1 flex flex-col gap-4 p-6 h-[28rem] overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.sender === 'user'
                      ? 'self-end bg-blue-500 text-white px-4 py-2 rounded-lg max-w-lg'
                      : 'self-start bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-lg'
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
            <form className="flex gap-3 p-6 border-t border-gray-200" onSubmit={handleSend}>
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 text-base disabled:opacity-50"
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
