import { useState, useRef, useEffect } from "react";

const COMPANIES = [
  {
    id: "ayat",
    name: "አያት ሪል እስቴት",
    nameEn: "Ayat Real Estate",
    tagline: "Since 1996 · Ethiopia's #1 Developer",
    phone: "+251 11 551 XXXX",
    areas: "CMC, Ayat, Bole, Summit",
    color: "#1a5276",
    accent: "#2e86c1",
    projects: "Ayat CMC Complex, Ayat Bole Villas, Summit Apartments",
    priceRange: "1.8M – 12M ETB",
  },
  {
    id: "noah",
    name: "ኖዓ ሪል እስቴት",
    nameEn: "Noah Real Estate",
    tagline: "Since 2013 · 3,600+ Homes Delivered",
    phone: "+251 11 XXXX XXXX",
    areas: "CMC, Summit, Ayat, Bole",
    color: "#145a32",
    accent: "#1e8449",
    projects: "Noah East Gate Apartments, Noah Summit, Airport Drive",
    priceRange: "2M – 4M ETB",
  },
  {
    id: "flintstone",
    name: "ፍሊንትስቶን ሆምስ",
    nameEn: "Flintstone Homes",
    tagline: "Trusted · On-Time Delivery",
    phone: "+251 11 XXXX XXXX",
    areas: "Bole, Sarbet, Old Airport, Gerji",
    color: "#6e2f1a",
    accent: "#c0392b",
    projects: "Twin Crossings, Oasis, Bole Residences",
    priceRange: "1.5M – 6M ETB",
  },
  {
    id: "metropolitan",
    name: "ሜትሮፖሊታን ሪል እስቴት",
    nameEn: "Metropolitan Real Estate",
    tagline: "American-Standard Luxury Living",
    phone: "+251 973 30 30 30",
    areas: "Bole, Sarbet, Kazanchis",
    color: "#4a235a",
    accent: "#8e44ad",
    projects: "Sarbet Gabriel, Bole Tower, Bole Midtown, Westview",
    priceRange: "3M – 15M ETB",
  },
];

const SYSTEM_PROMPT = (company) => `You are a bilingual AI sales assistant for ${company.nameEn} (${company.name}), one of the most reputable real estate developers in Addis Ababa, Ethiopia.

LANGUAGE RULE: Detect the language the user writes in.
- Amharic (Ethiopic script) → respond in Amharic
- English → respond in English
- Mixed → respond in both

Your job:
1. Warmly greet and ask if they are buying, selling, or renting
2. Qualify them: budget in ETB, preferred area (${company.areas}), number of bedrooms, timeline
3. Mention relevant projects: ${company.projects} (price range: ${company.priceRange})
4. Answer Ethiopian real estate questions about title deed, land lease, payment plans, condo lottery, diaspora buying
5. Collect name, Ethiopian phone number, and preferred callback time
6. Tell them a sales consultant from ${company.nameEn} will call within 2 hours

Keep responses SHORT (2-4 sentences). Warm, professional, conversational. Ask ONE question at a time.

When you have name + phone, say exactly: "አመሰግናለሁ — ከ${company.name} ሽያጭ ቡድን አንዱ በ2 ሰዓት ውስጥ ይደውሉልዎታል። / Thank you! A ${company.nameEn} sales consultant will call you within 2 hours."`;

export default function App() {
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectCompany = (company) => {
    setSelected(company);
    setLeadCaptured(false);
    setMessages([{
      role: "assistant",
      content: `ሰላም! 👋 እንኳን ደህና መጡ — ${company.name}!\n\nHello! Welcome to ${company.nameEn}. I'm here to help you find your perfect property in Addis Ababa.\n\nቤት ለመግዛት፣ ለመሸጥ ወይስ ለመከራየት ፍላጎት አለዎት?\nAre you looking to buy, sell, or rent?`,
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !selected) return;
    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(selected),
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "ይቅርታ፣ እባክዎ እንደገና ይሞክሩ།";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (reply.includes("sales consultant will call") || reply.includes("ይደውሉልዎታል")) {
        setLeadCaptured(true);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "ይቅርታ፣ ችግር ተፈጥሯል። / Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickReplies = [
    { am: "ለመግዛት", en: "Buy" },
    { am: "ለመሸጥ", en: "Sell" },
    { am: "ለመከራየት", en: "Rent" },
    { am: "ፕሮጀክቶቻችሁ ምንድን ናቸው?", en: "Projects?" },
  ];

  if (!selected) {
    return (
      <div style={s.page}>
        <div style={s.flagBar}>
          <div style={{ background: "#078930", flex: 1 }} />
          <div style={{ background: "#FCDD09", flex: 1 }} />
          <div style={{ background: "#DA121A", flex: 1 }} />
        </div>
        <div style={s.selectorHeader}>
          <div style={s.selectorTitle}>🇪🇹 Addis Ababa Real Estate</div>
          <div style={s.selectorSub}>{"የትኛውን ድርጅት ለማናገር ይፈልጋሉ?\nWhich company would you like to chat with?"}</div>
        </div>
        <div style={s.companyList}>
          {COMPANIES.map((c) => (
            <button key={c.id} style={{ ...s.companyCard, borderLeft: `5px solid ${c.accent}` }} onClick={() => selectCompany(c)}>
              <div style={{ ...s.companyLogo, background: `linear-gradient(135deg, ${c.color}, ${c.accent})` }}>{c.nameEn.charAt(0)}</div>
              <div style={s.companyInfo}>
                <div style={s.companyNameAm}>{c.name}</div>
                <div style={s.companyNameEn}>{c.nameEn}</div>
                <div style={s.companyTagline}>{c.tagline}</div>
                <div style={s.companyAreas}>📍 {c.areas}</div>
              </div>
              <div style={{ ...s.arrow, color: c.accent }}>›</div>
            </button>
          ))}
        </div>
        <div style={s.selectorFooter}>🏠 Real estate demo · Addis Ababa, Ethiopia</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.flagBar}>
        <div style={{ background: "#078930", flex: 1 }} />
        <div style={{ background: "#FCDD09", flex: 1 }} />
        <div style={{ background: "#DA121A", flex: 1 }} />
      </div>
      <div style={{ ...s.header, background: selected.color }}>
        <button style={s.backBtn} onClick={() => setSelected(null)}>‹</button>
        <div style={s.headerCenter}>
          <div style={{ ...s.avatar, background: `linear-gradient(135deg, ${selected.color}, ${selected.accent})`, border: "2px solid rgba(255,255,255,0.3)" }}>{selected.nameEn.charAt(0)}</div>
          <div>
            <div style={s.agentName}>{selected.name}</div>
            <div style={s.agentSub}>{selected.nameEn} · አዲስ አበባ</div>
          </div>
        </div>
        <div style={s.onlinePill}><span style={s.dot} />ቀጥታ</div>
      </div>
      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.row, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={{ ...s.botAv, background: `linear-gradient(135deg, ${selected.color}, ${selected.accent})` }}>{selected.nameEn.charAt(0)}</div>}
            <div style={msg.role === "user" ? { ...s.userBubble, background: `linear-gradient(135deg, ${selected.color}, ${selected.accent})` } : s.botBubble}>
              {msg.content.split("\n").map((line, j) => (<span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>))}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...s.row, justifyContent: "flex-start" }}>
            <div style={{ ...s.botAv, background: `linear-gradient(135deg, ${selected.color}, ${selected.accent})` }}>{selected.nameEn.charAt(0)}</div>
            <div style={s.botBubble}><TypingDots /></div>
          </div>
        )}
        {leadCaptured && (
          <div style={s.successCard}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={s.successTitle}>ስልክዎን ተቀብያለሁ!</div>
              <div style={s.successSub}>Lead captured · {selected.nameEn} will call you soon</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {messages.length <= 2 && (
        <div style={s.quickRow}>
          {quickReplies.map((q, i) => (
            <button key={i} style={{ ...s.quickBtn, borderColor: selected.accent + "55" }} onClick={() => setInput(q.am)}>
              <span style={{ ...s.quickAm, color: selected.color }}>{q.am}</span>
              <span style={s.quickEn}>{q.en}</span>
            </button>
          ))}
        </div>
      )}
      <div style={s.inputArea}>
        <input style={s.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="ይጻፉ / Type a message..." disabled={loading} />
        <button style={{ ...s.sendBtn, background: `linear-gradient(135deg, ${selected.color}, ${selected.accent})`, opacity: input.trim() && !loading ? 1 : 0.45 }} onClick={sendMessage} disabled={!input.trim() || loading}>ላክ</button>
      </div>
      <div style={s.footer}>🇪🇹 {selected.nameEn} · {selected.phone}</div>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (<span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9ca3af", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </span>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", height: "100vh", maxWidth: 480, margin: "0 auto", fontFamily: "'Noto Sans Ethiopic','Inter',system-ui,sans-serif", background: "#fafaf8" },
  flagBar: { display: "flex", height: 5 },
  selectorHeader: { padding: "24px 20px 12px", background: "#1a1a2e", color: "#fff" },
  selectorTitle: { fontSize: 18, fontWeight: 800, color: "#f9fafb" },
  selectorSub: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.6, whiteSpace: "pre-line" },
  companyList: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 },
  companyCard: { display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left" },
  companyLogo: { width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 },
  companyInfo: { flex: 1 },
  companyNameAm: { fontSize: 14, fontWeight: 700, color: "#111827" },
  companyNameEn: { fontSize: 12, color: "#374151", marginTop: 1 },
  companyTagline: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  companyAreas: { fontSize: 11, color: "#9ca3af", marginTop: 3 },
  arrow: { fontSize: 24, fontWeight: 300 },
  selectorFooter: { textAlign: "center", fontSize: 11, color: "#9ca3af", padding: "10px", background: "#fff", borderTop: "1px solid #f3f4f6" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", color: "#fff" },
  backBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 22, borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  headerCenter: { display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" },
  avatar: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 },
  agentName: { fontWeight: 700, fontSize: 13, color: "#f9fafb" },
  agentSub: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  onlinePill: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#4ade80", fontWeight: 600, background: "rgba(74,222,128,0.15)", padding: "4px 10px", borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px #4ade80" },
  messages: { flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 },
  row: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAv: { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 },
  botBubble: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "18px 18px 18px 4px", padding: "11px 15px", fontSize: 14, lineHeight: 1.65, color: "#111827", maxWidth: "78%", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" },
  userBubble: { borderRadius: "18px 18px 4px 18px", padding: "11px 15px", fontSize: 14, lineHeight: 1.65, color: "#fff", maxWidth: "78%", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
  successCard: { display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "12px 16px" },
  successTitle: { fontWeight: 700, fontSize: 14, color: "#166534" },
  successSub: { fontSize: 12, color: "#4ade80", marginTop: 2 },
  quickRow: { display: "flex", gap: 6, padding: "0 14px 10px", flexWrap: "wrap" },
  quickBtn: { display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "7px 12px", cursor: "pointer" },
  quickAm: { fontSize: 13, fontWeight: 700 },
  quickEn: { fontSize: 10, color: "#6b7280", marginTop: 1 },
  inputArea: { display: "flex", gap: 8, padding: "12px 14px", background: "#fff", borderTop: "1px solid #e5e7eb" },
  input: { flex: 1, border: "1px solid #e5e7eb", borderRadius: 24, padding: "10px 16px", fontSize: 14, outline: "none", color: "#111827", background: "#f9fafb", fontFamily: "'Noto Sans Ethiopic','Inter',system-ui,sans-serif" },
  sendBtn: { color: "#fff", border: "none", borderRadius: 24, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  footer: { textAlign: "center", fontSize: 11, color: "#9ca3af", padding: "8px", background: "#fff", borderTop: "1px solid #f3f4f6" },
};
