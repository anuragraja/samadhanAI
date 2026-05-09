import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const QUICK_REPLIES = [
  { label: '📋 Register Complaint', msg: 'How do I register a complaint?' },
  { label: '🔍 Track Status',       msg: 'How do I track my complaint status?' },
  { label: '🚨 Emergency Help',     msg: 'emergency help' },
  { label: '🏢 Departments',        msg: 'What departments are available?' },
  { label: '⏱️ Timeline',          msg: 'How long does resolution take?' },
];

export default function Chatbot() {
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '🙏 Namaste! I am SamadhanAI Assistant. I can help you register complaints, track their status, or answer civic questions. How can I help you today?' }
  ]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const messagesEndRef        = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, active]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setInput('');
    setTyping(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { message: msg });
      setTyping(false);
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: res.data.reply, time: new Date() }]);
      }
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Sorry, I am temporarily unavailable. Please try again shortly.', time: new Date() }]);
    }
  };

  const timeStr = (t) => t ? new Date(t).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <>
      {/* FAB */}
      <button
        className="chatbot-fab"
        onClick={() => setActive(true)}
        style={{ transform: active ? 'scale(0)' : 'scale(1)', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow:'0 5px 25px rgba(16,185,129,0.5)' }}
        title="Chat with SamadhanAI"
      >
        <i className="fa-solid fa-comment-dots" style={{ fontSize:'1.5rem' }}></i>
      </button>

      {/* Chat window */}
      <div className={`chatbot-widget glass-dark ${active ? 'active' : ''}`} style={{ border:'1px solid rgba(16,185,129,0.3)', boxShadow:'0 15px 50px rgba(0,0,0,0.6)', width:'360px', height:'560px' }}>

        {/* Header */}
        <div className="chatbot-header" style={{ background:'linear-gradient(135deg, #10b981, #059669)', padding:'14px 18px', flexShrink:0 }}>
          <div className="chatbot-title" style={{ color:'white', gap:'12px' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                <i className="fa-solid fa-robot"></i>
              </div>
              <span style={{ position:'absolute', bottom:0, right:0, width:'10px', height:'10px', background:'#00ff88', borderRadius:'50%', border:'2px solid #059669' }}></span>
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:'1rem' }}>SamadhanAI</div>
              <div style={{ fontSize:'0.72rem', opacity:0.85 }}>
                <i className="fa-solid fa-circle" style={{ fontSize:'0.5rem', color:'#00ff88', marginRight:'4px' }}></i> Online · AI Assistant
              </div>
            </div>
          </div>
          <button onClick={() => setActive(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" style={{ background:'#0d1117', flex:1, padding:'16px', display:'flex', flexDirection:'column', gap:'12px', overflowY:'auto' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`} style={{ maxWidth:'85%', padding:0 }}>
              <div style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #059669, #10b981)' : '#1e2a35',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                fontSize: '0.88rem',
                lineHeight: '1.6',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
                <div style={{ fontSize:'0.65rem', opacity:0.6, textAlign:'right', marginTop:'4px' }}>
                  {timeStr(msg.time)}
                  {msg.role === 'user' && <i className="fa-solid fa-check-double" style={{ marginLeft:'4px', color:'#a7f3d0' }}></i>}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="msg ai-msg">
              <div style={{ background:'#1e2a35', padding:'12px 16px', borderRadius:'4px 16px 16px 16px', display:'flex', gap:'5px', alignItems:'center' }}>
                {[0.1,0.2,0.3].map(d => (
                  <span key={d} style={{ width:'7px', height:'7px', background:'#64748b', borderRadius:'50%', animation:`bounce 1s infinite ${d}s` }}></span>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <div className="chatbot-chips" style={{ background:'#0d1117', padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          {QUICK_REPLIES.map(q => (
            <span key={q.label} className="chip"
              onClick={() => sendMessage(q.msg)}
              style={{ background:'#1e2a35', border:'1px solid rgba(255,255,255,0.1)', color:'#a7f3d0', fontSize:'0.72rem', cursor:'pointer', flexShrink:0 }}
              onMouseEnter={e => e.target.style.background='rgba(16,185,129,0.2)'}
              onMouseLeave={e => e.target.style.background='#1e2a35'}
            >
              {q.label}
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="chatbot-input" style={{ background:'#161b22', padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'10px 14px', color:'white', flex:1, fontSize:'0.88rem', outline:'none' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            style={{ width:'40px', height:'40px', borderRadius:'50%', border:'none', cursor:input.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', transition:'all 0.2s', background: input.trim() ? 'linear-gradient(135deg,#10b981,#059669)' : '#1e2a35', color: input.trim() ? '#fff' : '#64748b' }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}} />
    </>
  );
}
