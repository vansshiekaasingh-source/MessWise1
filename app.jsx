const { useState, useEffect, createContext, useContext } = React;

// --- SOUND ENGINE (Web Audio API Synthesizer) ---
class SoundEngine {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
  }
  playSuccess() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.25);
  }
  playWarning() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(349.23, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.35);
  }
  playError() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(164.81, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  }
}
const sound = new SoundEngine();

// --- MNNIT ALLAHABAD SEED DATA ---
const mnnitMesses = [
  { id: 'mess-svh', name: 'SVH Mega Mess', location: 'Swami Vivekananda Hostel Complex', capacity: 900 },
  { id: 'mess-central-boys', name: 'Patel-Tilak Central Mess', location: 'Central Boys Hostel Quad', capacity: 750 },
  { id: 'mess-tandon', name: 'PD Tandon & Malaviya Combined Mess', location: 'Tandon Quadrangle', capacity: 600 },
  { id: 'mess-girls-composite', name: 'Girls Hostels Composite Refectory', location: 'SN-KNGH-DJGH Common Block', capacity: 650 }
];

const mnnitHostels = [
  { id: 'h-svh', name: 'Swami Vivekananda Hostel', shortCode: 'SVH', type: 'boys', messId: 'mess-svh', capacity: 850, notes: 'Multi-storey; typically 1st year UG (3-seater)' },
  { id: 'h-patel', name: 'Sardar Vallabh Bhai Patel Hostel', shortCode: 'Patel', type: 'boys', messId: 'mess-central-boys', capacity: 420, notes: 'Senior UG (2-seater / 4-seater)' },
  { id: 'h-tilak', name: 'Bal Gangadhar Tilak Hostel', shortCode: 'Tilak', type: 'boys', messId: 'mess-central-boys', capacity: 380, notes: 'Senior UG' },
  { id: 'h-tagore', name: 'Kaviguru Rabindranath Tagore Hostel', shortCode: 'Tagore', type: 'boys', messId: 'mess-central-boys', capacity: 350, notes: 'Pre-final & Final year UG' },
  { id: 'h-tandon', name: 'Purushottam Das Tandon Hostel', shortCode: 'PD Tandon', type: 'boys', messId: 'mess-tandon', capacity: 320, notes: 'Senior UG & PG' },
  { id: 'h-malaviya', name: 'Pt. Madan Mohan Malaviya Hostel', shortCode: 'Malaviya', type: 'boys', messId: 'mess-tandon', capacity: 300, notes: 'Senior UG' },
  { id: 'h-raman', name: 'Sir C.V. Raman Hostel', shortCode: 'Raman', type: 'boys', messId: 'mess-tandon', capacity: 280, notes: 'PG & Research Scholars' },
  { id: 'h-boys-8', name: '(Eighth Boys Hostel - Slot to be confirmed)', shortCode: 'BH-08', type: 'boys', messId: 'mess-central-boys', capacity: 300, notes: 'Pending confirmation with MNNIT Hostel Office' },
  { id: 'h-sngh', name: 'Sarojini Naidu Girls Hostel', shortCode: 'SNGH', type: 'girls', messId: 'mess-girls-composite', capacity: 360, notes: 'UG Girls Residents' },
  { id: 'h-kngh', name: 'Kamala Nehru Girls Hostel', shortCode: 'KNGH', type: 'girls', messId: 'mess-girls-composite', capacity: 280, notes: 'UG & PG Girls Residents' },
  { id: 'h-djgh', name: 'Diamond Jubilee Girls Hostel', shortCode: 'DJGH', type: 'girls', messId: 'mess-girls-composite', capacity: 320, notes: 'Senior UG Girls' }
];

const mnnitMenuCatalogue = {
  breakfast: [
    { id: 'bf-1', nameEn: 'Stuffed Paneer Paratha', nameHi: 'पनीर पराठा', category: 'paneer', stdGrams: 150, unit: 'g' },
    { id: 'bf-2', nameEn: 'Steamed Idli & Vada with Sambhar', nameHi: 'इडली वड़ा व सांभर', category: 'south-indian', stdGrams: 200, unit: 'g' },
    { id: 'bf-3', nameEn: 'Hot Tea & Coffee Powder', nameHi: 'चाय व कॉफी', category: 'beverage', stdGrams: 150, unit: 'ml' }
  ],
  lunch: [
    { id: 'lu-1', nameEn: 'Dehradun Jeera Rice', nameHi: 'जीरा राइस', category: 'rice', stdGrams: 150, unit: 'g' },
    { id: 'lu-2', nameEn: 'Dal Makhani (Slow Simmered)', nameHi: 'दाल मखनी', category: 'dal', stdGrams: 180, unit: 'ml' },
    { id: 'lu-3', nameEn: 'Fresh Phulka / Tawa Roti', nameHi: 'तवा रोटी', category: 'bread', stdGrams: 3, unit: 'pc' },
    { id: 'lu-4', nameEn: 'Fruit Custard Dessert', nameHi: 'फ्रूट कस्टर्ड', category: 'sweet', stdGrams: 100, unit: 'ml' }
  ],
  snacks: [
    { id: 'sn-1', nameEn: 'Samosa with Chutney', nameHi: 'समोसा व चटनी', category: 'fried', stdGrams: 2, unit: 'pc' },
    { id: 'sn-2', nameEn: 'Adrak Masala Chai', nameHi: 'अदरक मसाला चाय', category: 'beverage', stdGrams: 150, unit: 'ml' }
  ],
  dinner: [
    { id: 'di-1', nameEn: 'Paneer Butter Masala', nameHi: 'पनीर बटर मसाला', category: 'paneer', stdGrams: 150, unit: 'g' },
    { id: 'di-2', nameEn: 'Arhar Dal Tadka', nameHi: 'अरहर दाल तड़का', category: 'dal', stdGrams: 180, unit: 'ml' },
    { id: 'di-3', nameEn: 'Ghee Phulka Roti & Rice', nameHi: 'घी फुल्का व चावल', category: 'bread', stdGrams: 180, unit: 'g' },
    { id: 'di-4', nameEn: 'Warm Gulab Jamun', nameHi: 'गुलाब जामुन', category: 'sweet', stdGrams: 2, unit: 'pc' },
    { id: 'di-5', nameEn: 'Night Milk with Bournvita', nameHi: 'दूध व बॉर्नविटा', category: 'beverage', stdGrams: 200, unit: 'ml' }
  ]
};

const initialSchedule = [
  { id: 'sch-bf', type: 'breakfast', title: 'MNNIT Morning Breakfast', state: 'SERVED', startTime: '07:30', endTime: '09:30', cutoffTime: '06:00', items: mnnitMenuCatalogue.breakfast, confirmedHeadcount: 780, actualCheckIns: 742 },
  { id: 'sch-lu', type: 'lunch', title: 'Sunday Feast Lunch', state: 'LOCKED', startTime: '12:30', endTime: '14:30', cutoffTime: '10:00', items: mnnitMenuCatalogue.lunch, confirmedHeadcount: 810, actualCheckIns: 418 },
  { id: 'sch-sn', type: 'snacks', title: 'Evening Refreshment', state: 'OPEN', startTime: '17:00', endTime: '18:15', cutoffTime: '15:30', isMessOff: false, items: mnnitMenuCatalogue.snacks, confirmedHeadcount: 690, actualCheckIns: 0 },
  { id: 'sch-di', type: 'dinner', title: 'Deluxe Special Dinner', state: 'OPEN', startTime: '19:45', endTime: '21:45', cutoffTime: '18:00', items: mnnitMenuCatalogue.dinner, confirmedHeadcount: 760, actualCheckIns: 0 }
];

const mnnitPersonas = [
  { id: 'p-1', name: 'Arjun Sharma', regNo: '20234012', hostelName: 'Swami Vivekananda Hostel (SVH)', messId: 'mess-svh', room: 'B-314 (3-Seater)', role: 'student' },
  { id: 'p-2', name: 'Priyanshu Patel', regNo: '20223045', hostelName: 'PD Tandon Hostel', messId: 'mess-tandon', room: 'Quad-102 (Single)', role: 'student' },
  { id: 'p-3', name: 'Chef Rameshwar Dayal', regNo: 'STAFF-902', hostelName: 'SVH Refectory', messId: 'mess-svh', room: 'Kitchen Desk', role: 'staff' },
  { id: 'p-4', name: 'Prof. R.K. Srivastava', regNo: 'FAC-W01', hostelName: 'Chief Warden Office', messId: 'all', room: 'Warden Quarters', role: 'admin' }
];

// --- APP CONTEXT ---
const MessContext = createContext(null);

const MessProvider = ({ children }) => {
  const [currentPersona, setCurrentPersona] = useState(mnnitPersonas[0]);
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');
  const [schedule, setSchedule] = useState(initialSchedule);
  const [studentBookings, setStudentBookings] = useState({
    'sch-bf': 'consumed',
    'sch-lu': 'confirmed',
    'sch-sn': 'confirmed',
    'sch-di': 'confirmed'
  });
  const [platePledgeStreak, setPlatePledgeStreak] = useState(16);
  const [rebateBalanceRs, setRebateBalanceRs] = useState(600);
  const [assistantMessages, setAssistantMessages] = useState([
    { id: 'm-init', sender: 'assistant', text: 'Namaste! I am Rasoi Sahayak (रसोई सहायक). Ask me about today\'s MNNIT menu, sweet schedule, or prepare a cancellation.' }
  ]);
  const [pendingActionCard, setPendingActionCard] = useState(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleMealBooking = (mealId) => {
    const meal = schedule.find(s => s.id === mealId);
    if (!meal) return;
    if (meal.isMessOff) return;
    if (meal.state !== 'OPEN') {
      sound.playWarning();
      return;
    }
    const currentStatus = studentBookings[mealId];
    if (currentStatus === 'confirmed') {
      setStudentBookings(prev => ({ ...prev, [mealId]: 'cancelled' }));
      setSchedule(prev => prev.map(m => m.id === mealId ? { ...m, confirmedHeadcount: m.confirmedHeadcount - 1 } : m));
      setRebateBalanceRs(r => r + 75);
      setPlatePledgeStreak(s => s + 1);
      sound.playSuccess();
    } else {
      setStudentBookings(prev => ({ ...prev, [mealId]: 'confirmed' }));
      setSchedule(prev => prev.map(m => m.id === mealId ? { ...m, confirmedHeadcount: m.confirmedHeadcount + 1 } : m));
      setRebateBalanceRs(r => Math.max(0, r - 75));
      sound.playSuccess();
    }
  };

  const simulateGateScan = (qrCodeData) => {
    if (qrCodeData.includes('WRONG_MESS') || qrCodeData.includes('TANDON')) {
      sound.playWarning();
      return { code: 'WRONG_MESS', message: 'Wrong Mess Hall! Pass registered for PD Tandon Mess, not SVH.', student: 'Priyanshu Patel (PD Tandon)' };
    }
    if (qrCodeData.includes('USED')) {
      sound.playWarning();
      return { code: 'ALREADY_USED', message: 'Pass Already Scanned at 12:44 PM! Double-dipping blocked.', student: 'Arjun Sharma (SVH)' };
    }
    sound.playSuccess();
    setSchedule(prev => prev.map(s => s.id === 'sch-lu' ? { ...s, actualCheckIns: s.actualCheckIns + 1 } : s));
    setStudentBookings(prev => ({ ...prev, 'sch-lu': 'consumed' }));
    return { code: 'SUCCESS', message: 'Pass Verified: Sunday Lunch Approved', student: 'Arjun Sharma (20234012) • SVH' };
  };

  const toggleMessOff = (slotId) => {
    setSchedule(prev => prev.map(s => s.id === slotId ? { ...s, isMessOff: !s.isMessOff } : s));
  };

  const askAssistant = (query) => {
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setAssistantMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let botReply = '';
      let action = null;

      if (lower.includes('dinner') || lower.includes('रात') || lower.includes('sweet') || lower.includes('मीठा')) {
        botReply = 'Tonight at SVH Mess: Paneer Butter Masala, Arhar Dal Tadka, Ghee Phulka & Warm Gulab Jamun (गुलाब जामुन). Bournvita milk after 21:00.';
      } else if (lower.includes('paneer') || lower.includes('पनीर')) {
        botReply = 'Paneer dishes at MNNIT this week: Sunday Dinner (Paneer Butter Masala), and Friday Breakfast (Stuffed Paneer Paratha).';
      } else if (lower.includes('cancel') || lower.includes('skip') || lower.includes('रद्द')) {
        botReply = 'Tonight\'s dinner cutoff is 18:00. Would you like to cancel and receive a ₹75 rebate credit?';
        action = { type: 'CANCEL_DINNER', mealId: 'sch-di', title: 'Cancel Sunday Dinner at SVH Refectory', rebateAmt: 75, cutoffTime: '18:00' };
      } else {
        botReply = 'I found today\'s verified SVH menu: Lunch has Dal Makhani & Fruit Custard. Dinner has Paneer Butter Masala & Gulab Jamun.';
      }

      setPendingActionCard(action);
      setAssistantMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', text: botReply }]);
    }, 400);
  };

  return (
    <MessContext.Provider value={{
      currentPersona, setCurrentPersona,
      lang, setLang,
      theme, setTheme,
      schedule,
      studentBookings,
      platePledgeStreak,
      rebateBalanceRs,
      assistantMessages,
      pendingActionCard, setPendingActionCard,
      askAssistant,
      toggleMealBooking,
      simulateGateScan,
      toggleMessOff
    }}>
      {children}
    </MessContext.Provider>
  );
};

const useMess = () => useContext(MessContext);

// --- RASOI SAHAYAK WIDGET ---
const RasoiSahayakWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const { assistantMessages, askAssistant, pendingActionCard, setPendingActionCard, toggleMealBooking } = useMess();

  const handleSend = (e) => {
    e && e.preventDefault();
    if (!inputQuery.trim()) return;
    askAssistant(inputQuery);
    setInputQuery('');
  };

  return (
    <React.Fragment>
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 bg-gradient-to-r from-deepMaroon to-terracotta text-white text-xs font-bold rounded-full shadow-2xl border-2 border-turmericGold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="text-base">👨‍🍳</span>
          <span>Rasoi Sahayak (रसोई सहायक)</span>
          <span className="w-2 h-2 rounded-full bg-turmericGold animate-ping"></span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-32 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-riceWhite dark:bg-surface border-2 border-turmericGold/60 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-deepMaroon text-white p-3.5 flex justify-between items-center border-b border-turmericGold/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-turmericGold text-deepMaroon flex items-center justify-center font-bold text-sm">र</div>
              <div>
                <h3 className="font-bold text-xs">Rasoi Sahayak • रसोई सहायक</h3>
                <p className="text-[10px] text-white/70">MNNIT Refectory AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-warmIvory/30 dark:bg-surfaceElevated/40">
            {assistantMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-deepMaroon text-white' : 'bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {pendingActionCard && (
              <div className="p-3 bg-white dark:bg-surface border-2 border-terracotta rounded-xl shadow-md space-y-2">
                <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider block">⚡ Action Card</span>
                <h4 className="font-bold text-xs">{pendingActionCard.title}</h4>
                <p className="text-[11px] text-mutedStone">Rebate: <strong>+₹{pendingActionCard.rebateAmt}</strong> • Cutoff: {pendingActionCard.cutoffTime}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { toggleMealBooking(pendingActionCard.mealId); setPendingActionCard(null); }}
                    className="flex-1 py-1.5 bg-leafGreen text-white rounded font-bold text-xs"
                  >
                    ✓ Confirm Opt-Out
                  </button>
                  <button onClick={() => setPendingActionCard(null)} className="px-3 py-1.5 border border-softBorder rounded text-xs">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-2 bg-riceWhite dark:bg-surface border-t border-softBorder flex gap-1.5">
            <input
              type="text"
              placeholder="Ask in English or हिन्दी..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 text-xs p-2 rounded-lg border border-softBorder dark:border-borderDark bg-warmIvory dark:bg-surfaceElevated"
            />
            <button type="submit" className="px-3 py-2 bg-deepMaroon text-white text-xs font-bold rounded-lg">Send</button>
          </form>
        </div>
      )}
    </React.Fragment>
  );
};

// --- STUDENT VIEW ---
const StudentView = () => {
  const { currentPersona, schedule, studentBookings, toggleMealBooking, platePledgeStreak, rebateBalanceRs, lang } = useMess();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-deepMaroon to-[#531b25] text-riceWhite p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-turmericGold/20 text-turmericGold rounded-full border border-turmericGold/30">
            {currentPersona.hostelName} • Room {currentPersona.room}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-serif mt-2">Namaste, {currentPersona.name}</h1>
          <p className="text-xs text-white/80 mt-1">Reg No: {currentPersona.regNo} • Assigned: <strong>SVH Mega Mess</strong></p>
        </div>
        <div className="flex gap-4">
          <div className="bg-black/25 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] uppercase text-white/70 block">Streak</span>
            <span className="text-xl font-bold font-mono text-turmericGold">🔥 {platePledgeStreak} Days</span>
          </div>
          <div className="bg-black/25 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] uppercase text-white/70 block">Rebate</span>
            <span className="text-xl font-bold font-mono text-leafGreen">₹{rebateBalanceRs}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((meal) => {
          const status = studentBookings[meal.id] || 'confirmed';
          const isLocked = meal.state !== 'OPEN';

          return (
            <div key={meal.id} className="bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-terracotta">{meal.type} • {meal.startTime} - {meal.endTime}</span>
                  <h3 className="font-bold text-base text-charcoal dark:text-textPrimary mt-0.5">{meal.title}</h3>
                </div>
                {meal.isMessOff ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-warningAmber/20 text-warningAmber">Mess Off</span>
                ) : (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    status === 'confirmed' ? 'bg-mutedSage text-leafGreen' :
                    status === 'consumed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-errorRed'
                  }`}>
                    {status}
                  </span>
                )}
              </div>

              <div className="border-y border-softBorder/60 dark:border-borderDark/60 py-2.5 space-y-1 text-xs">
                {meal.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-mutedStone dark:text-textMuted">
                    <span className="font-medium text-charcoal dark:text-textPrimary">{lang === 'hi' ? it.nameHi : it.nameEn}</span>
                    <span className="text-[10px] capitalize bg-warmIvory dark:bg-surfaceElevated px-1.5 py-0.5 rounded">{it.category}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-[10px] text-mutedStone block">Cutoff:</span>
                  <span className="text-xs font-mono font-bold text-charcoal dark:text-textPrimary">{isLocked ? 'Locked' : `${meal.cutoffTime} IST`}</span>
                </div>
                {status === 'consumed' ? (
                  <span className="text-xs font-semibold text-leafGreen">✓ Redeemed</span>
                ) : meal.isMessOff ? (
                  <span className="text-xs text-mutedStone italic">Closed slot</span>
                ) : (
                  <button
                    disabled={isLocked}
                    onClick={() => toggleMealBooking(meal.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      isLocked ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed' :
                      status === 'confirmed' ? 'border border-errorRed text-errorRed hover:bg-errorRed hover:text-white' :
                      'bg-deepMaroon text-white'
                    }`}
                  >
                    {isLocked ? 'Cutoff Passed' : status === 'confirmed' ? 'Cancel & Rebate ₹75' : 'Confirm Plate'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- GATE SCANNER VIEW ---
const StaffScannerView = () => {
  const { simulateGateScan, schedule } = useMess();
  const [scanResult, setScanResult] = useState(null);
  const lunch = schedule.find(s => s.id === 'sch-lu');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-deepMaroon dark:text-primaryAccent">SVH Mega Mess Gate Scanner</h3>
            <p className="text-xs text-mutedStone">Cross-hostel dining rejection active</p>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 bg-leafGreen/10 text-leafGreen border border-leafGreen/30 rounded-full">
            {lunch.actualCheckIns} / {lunch.confirmedHeadcount} Check-Ins
          </span>
        </div>

        <div className="w-full h-60 bg-black rounded-xl border-4 border-mutedStone/40 flex flex-col items-center justify-center relative">
          <div className="w-40 h-40 border-2 border-turmericGold relative flex items-center justify-center animate-pulse">
            <span className="text-[11px] text-white/70 font-mono">Camera Active</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={() => setScanResult(simulateGateScan('VALID_PASS_SVH'))} className="px-3 py-2 bg-leafGreen text-white text-xs font-medium rounded-lg">
            Scan Valid SVH Pass
          </button>
          <button onClick={() => setScanResult(simulateGateScan('WRONG_MESS_TANDON_PASS'))} className="px-3 py-2 bg-warningAmber text-white text-xs font-medium rounded-lg">
            Scan Wrong-Mess Pass (Tandon Resident)
          </button>
          <button onClick={() => setScanResult(simulateGateScan('USED_PASS_DUPLICATE'))} className="px-3 py-2 bg-errorRed text-white text-xs font-medium rounded-lg">
            Scan Already-Used Pass
          </button>
        </div>
      </div>

      <div className="bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-mutedStone mb-3">Redemption Status</h4>
          {scanResult ? (
            <div className={`p-5 rounded-xl border text-center ${
              scanResult.code === 'SUCCESS' ? 'bg-leafGreen/10 border-leafGreen text-leafGreen' :
              scanResult.code === 'WRONG_MESS' ? 'bg-warningAmber/15 border-warningAmber text-warningAmber' :
              'bg-errorRed/10 border-errorRed text-errorRed'
            }`}>
              <div className="text-3xl mb-1">{scanResult.code === 'SUCCESS' ? '✓' : '⚠️'}</div>
              <div className="font-bold font-mono">{scanResult.code}</div>
              <p className="text-xs mt-1">{scanResult.message}</p>
              {scanResult.student && <div className="mt-2 text-[11px] font-mono border-t pt-1">{scanResult.student}</div>}
            </div>
          ) : (
            <div className="p-8 text-center text-mutedStone text-xs border-2 border-dashed border-softBorder rounded-xl">
              Ready at Gate. Click any scan button on the left to verify.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN HOSTEL VIEW ---
const AdminHostelsView = () => {
  const { toggleMessOff, schedule } = useMess();
  const snacks = schedule.find(s => s.id === 'sch-sn');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-deepMaroon dark:text-primaryAccent">MNNIT Allahabad Hostel Registry</h2>
          <span className="text-[10px] px-2 py-0.5 bg-turmericGold/20 text-turmericGold font-bold rounded">Seed data, confirm with Hostel Office</span>
        </div>
        <button
          onClick={() => toggleMessOff('sch-sn')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${snacks.isMessOff ? 'bg-leafGreen text-white' : 'bg-warningAmber text-white'}`}
        >
          {snacks.isMessOff ? 'Re-open Snacks Slot' : 'Declare "Mess Off"'}
        </button>
      </div>

      <div className="bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-warmIvory dark:bg-surfaceElevated text-mutedStone uppercase text-[10px]">
            <tr>
              <th className="p-3">Hostel Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Assigned Mess</th>
              <th className="p-3">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-softBorder dark:divide-borderDark">
            {mnnitHostels.map((h) => (
              <tr key={h.id} className="hover:bg-warmIvory/30">
                <td className="p-3 font-semibold">{h.name}</td>
                <td className="p-3 font-mono">{h.shortCode}</td>
                <td className="p-3 uppercase">{h.type}</td>
                <td className="p-3 text-terracotta">{mnnitMesses.find(m => m.id === h.messId)?.name}</td>
                <td className="p-3 font-mono">{h.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- JUDGE DEMO CONSOLE ---
const JudgeDemoConsole = () => {
  const { currentPersona, setCurrentPersona, askAssistant } = useMess();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <React.Fragment>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-deepMaroon dark:bg-primaryDark text-riceWhite font-medium text-xs rounded-full shadow-2xl border-2 border-turmericGold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span>Demo Console</span>
          <kbd className="px-1.5 py-0.5 bg-black/30 rounded text-[10px]">Ctrl+Shift+D</kbd>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-riceWhite dark:bg-surface border-l border-softBorder shadow-2xl z-50 p-5 text-charcoal dark:text-textPrimary overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-deepMaroon dark:text-primaryAccent">MNNIT Evaluator Console</h3>
            <button onClick={() => setIsOpen(false)} className="text-mutedStone">✕</button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold uppercase text-mutedStone block mb-2">Switch Persona</label>
              <div className="space-y-1.5">
                {mnnitPersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentPersona(p)}
                    className={`w-full p-2.5 rounded-lg border text-left ${currentPersona.id === p.id ? 'bg-deepMaroon text-white' : 'bg-warmIvory'}`}
                  >
                    <div className="font-bold">{p.name} ({p.role})</div>
                    <div className="text-[10px] opacity-80">{p.hostelName}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-mutedSage/30 rounded-xl space-y-1.5">
              <label className="font-bold text-leafGreen block">Scripted Assistant Prompts</label>
              <button onClick={() => askAssistant("What's for dinner tonight?")} className="w-full text-left p-1.5 bg-white rounded border text-[11px]">
                "What's for dinner tonight?"
              </button>
              <button onClick={() => askAssistant("Cancel my dinner tonight")} className="w-full text-left p-1.5 bg-white rounded border text-[11px]">
                "Cancel my dinner tonight"
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

// --- APP SHELL ---
const App = () => {
  const { currentPersona, lang, setLang, theme, setTheme } = useMess();
  const [currentNav, setCurrentNav] = useState('student');

  return (
    <div className="min-h-screen bg-warmIvory dark:bg-appDark text-charcoal dark:text-textPrimary flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-riceWhite/95 dark:bg-surface/95 backdrop-blur border-b border-softBorder dark:border-borderDark px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-deepMaroon flex items-center justify-center text-turmericGold font-serif font-black text-lg">M</div>
          <div>
            <span className="font-serif font-bold text-base text-deepMaroon dark:text-primaryAccent block leading-tight">MessWise • MNNIT Allahabad</span>
            <span className="text-[10px] text-mutedStone tracking-tight block">The Kamar-Taj Refectory</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 ml-6 text-xs">
            <button onClick={() => setCurrentNav('student')} className={`px-2.5 py-1 rounded-md font-medium ${currentNav === 'student' ? 'bg-deepMaroon text-white' : 'text-mutedStone'}`}>Student Dining</button>
            <button onClick={() => setCurrentNav('scanner')} className={`px-2.5 py-1 rounded-md font-medium ${currentNav === 'scanner' ? 'bg-deepMaroon text-white' : 'text-mutedStone'}`}>Gate Scanner</button>
            <button onClick={() => setCurrentNav('hostels')} className={`px-2.5 py-1 rounded-md font-medium ${currentNav === 'hostels' ? 'bg-deepMaroon text-white' : 'text-mutedStone'}`}>Hostel Registry</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-warmIvory border border-softBorder">
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-1.5 text-xs rounded-lg bg-warmIvory border border-softBorder">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="text-xs font-semibold ml-2 text-leafGreen font-mono">{currentPersona.name.split(' ')[0]}</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentNav === 'student' && <StudentView />}
        {currentNav === 'scanner' && <StaffScannerView />}
        {currentNav === 'hostels' && <AdminHostelsView />}
      </main>

      <RasoiSahayakWidget />
      <JudgeDemoConsole />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <MessProvider>
    <App />
  </MessProvider>
);