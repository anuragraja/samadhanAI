import { useState } from 'react';

export default function Chatbot() {
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = "I'm sorry, I didn't understand that.";
      const lText = userText.toLowerCase();
      if(lText.includes('register') || lText.includes('complaint')) {
          reply = "You can register a complaint by clicking 'Raise Complaint' in the menu.";
      } else if(lText.includes('track') || lText.includes('status')) {
          reply = "Please go to 'Track Complaint' and enter your Complaint ID.";
      } else if(lText.includes('emergency') || lText.includes('help')) {
          reply = "For emergencies, please call our 24/7 helpline at 1900-111-222.";
      }
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setActive(true)} style={{ transform: active ? 'scale(0)' : 'scale(1)' }}>
        <div className="fab-icon-container">
          <i className="fa-solid fa-comment-dots"></i>
        </div>
      </button>

      <div className={`chatbot-widget glass-dark ${active ? 'active' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fa-solid fa-robot"></i> Samadhan Assistant
          </div>
          <button className="chatbot-close" onClick={() => setActive(false)}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}>
              <div className="msg-avatar">
                <i className={`fa-solid ${msg.role === 'ai' ? 'fa-robot' : 'fa-user'}`}></i>
              </div>
              <div className="msg-bubble">{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="chatbot-chips">
          <span className="chip" onClick={() => setInput('Register Complaint')}>Register Complaint</span>
          <span className="chip" onClick={() => setInput('Track Status')}>Track Status</span>
          <span className="chip" onClick={() => setInput('Emergency Help')}>Emergency Help</span>
        </div>
        <div className="chatbot-input">
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn-icon text-primary" onClick={handleSend}><i className="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </>
  );
}
