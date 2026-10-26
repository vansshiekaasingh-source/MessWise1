const { useState, useEffect, createContext, useContext } = React;

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBWAxqvLod_tuGFJ-yZbTSkb7Hk4ECrFro",
  authDomain: "messwise-5fbd7.firebaseapp.com",
  projectId: "messwise-5fbd7",
  storageBucket: "messwise-5fbd7.firebasestorage.app",
  messagingSenderId: "1079327182916",
  appId: "1:1079327182916:web:ee7438aa2732bc0d18ac11",
  measurementId: "G-5VH47H4ZF2"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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

// --- MNNIT ROSTER DATA ---
const mnnitRoster = [
  { email: 'warden.svh@mnnit.ac.in', name: 'Dr. Manish Gupta', role: 'HOSTEL_WARDEN', hostel: 'Swami Vivekananda Hostel (SVH)' },
  { email: 'chief.warden@mnnit.ac.in', name: 'Prof. R.K. Srivastava', role: 'CHIEF_WARDEN', hostel: 'Council of Wardens' },
  { email: 'rameshwar.mess@mnnit.ac.in', name: 'Chef Rameshwar Dayal', role: 'MESS_STAFF', hostel: 'SVH Refectory' }
];

const mnnitHostels = [
  { id: 'h-svh', name: 'Swami Vivekananda Hostel', shortCode: 'SVH', type: 'boys', capacity: 850 },
  { id: 'h-patel', name: 'Sardar Vallabh Bhai Patel Hostel', shortCode: 'Patel', type: 'boys', capacity: 420 },
  { id: 'h-tandon', name: 'Purushottam Das Tandon Hostel', shortCode: 'PD Tandon', type: 'boys', capacity: 320 },
  { id: 'h-sngh', name: 'Sarojini Naidu Girls Hostel', shortCode: 'SNGH', type: 'girls', capacity: 360 }
];

// --- APP CONTEXT ---
const MessContext = createContext(null);

const MessProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');

  const [meals, setMeals] = useState([
    { id: 'm-lunch', type: 'Lunch', title: 'Sunday Feast Lunch', state: 'LOCKED', startTime: '12:30', endTime: '14:30', cutoff: '10:00', items: ['Dehradun Jeera Rice', 'Dal Makhani', 'Fresh Tawa Roti', 'Fruit Custard'], checkIns: 418, headcount: 810 },
    { id: 'm-dinner', type: 'Dinner', title: 'Deluxe Special Dinner', state: 'OPEN', startTime: '19:45', endTime: '21:45', cutoff: '18:00', items: ['Paneer Butter Masala', 'Arhar Dal Tadka', 'Ghee Phulka Roti', 'Warm Gulab Jamun'], checkIns: 0, headcount: 760 }
  ]);

  const [bookings, setBookings] = useState({
    'm-lunch': { status: 'CONSUMED', verifiedAtGate: true },
    'm-dinner': { status: 'CONFIRMED', verifiedAtGate: false }
  });

  const [addIns, setAddIns] = useState([
    { id: 'ad-1', mealSlot: 'Sunday Lunch', foodItemName: 'Cold Spiced Mattha', type: 'ADD_EXTRA', displayHandle: 'Resident (SVH)', votesCount: 84, status: 'APPROVED_FOR_TRIAL' }
  ]);

  const [feedbacks, setFeedbacks] = useState([]);
  const [rebateBalanceRs, setRebateBalanceRs] = useState(600);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (typeof firebase === 'undefined') {
      setLoadingAuth(false);
      return;
    }
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Match user email with MNNIT roster or assign default student profile
        const matched = mnnitRoster.find(r => r.email.toLowerCase() === user.email.toLowerCase());
        const profile = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL,
          role: matched ? matched.role : 'STUDENT',
          hostelName: matched ? matched.hostel : 'Swami Vivekananda Hostel (SVH)',
          room: 'B-314'
        };
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Real Firebase Google Sign-In Popup
  const signInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await firebase.auth().signInWithPopup(provider);
      sound.playSuccess();
      return { success: true, user: result.user };
    } catch (error) {
      sound.playError();
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMealBooking = (mealId) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || meal.state !== 'OPEN') {
      sound.playWarning();
      return;
    }
    const current = bookings[mealId];
    if (current?.status === 'CONFIRMED') {
      setBookings(prev => ({ ...prev, [mealId]: { status: 'CANCELLED', verifiedAtGate: false } }));
      setRebateBalanceRs(r => r + 75);
      sound.playSuccess();
    } else {
      setBookings(prev => ({ ...prev, [mealId]: { status: 'CONFIRMED', verifiedAtGate: false } }));
      setRebateBalanceRs(r => Math.max(0, r - 75));
      sound.playSuccess();
    }
  };

  return (
    <MessContext.Provider value={{
      currentUser,
      loadingAuth,
      signInWithGoogle,
      signOut,
      theme, setTheme,
      lang, setLang,
      meals, bookings, toggleMealBooking,
      addIns, feedbacks, rebateBalanceRs
    }}>
      {children}
    </MessContext.Provider>
  );
};

const useMess = () => useContext(MessContext);

// --- LOGIN COMPONENT (With Live Google Auth) ---
const LoginPage = () => {
  const { signInWithGoogle } = useMess();
  const [authError, setAuthError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      setAuthError(res.error);
    }
    setIsSigningIn(false);
  };

  return (
    <div className="min-h-screen bg-warmIvory dark:bg-appDark flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-deepMaroon flex items-center justify-center text-turmericGold font-serif font-black text-xl">M</div>
              <div>
                <h1 className="font-serif font-bold text-lg text-deepMaroon dark:text-primaryAccent">MessWise</h1>
                <p className="text-[10px] text-mutedStone uppercase tracking-wider">Firebase Authenticated Refectory</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-charcoal dark:text-textPrimary">Institutional Refectory Portal</h2>
            <p className="text-xs text-mutedStone mt-1">Sign in with your Google account to access live bookings and gate passes.</p>

            {authError && (
              <div className="mt-4 p-3 bg-red-100 border border-errorRed text-errorRed rounded-xl text-xs">
                ⚠️ {authError}
              </div>
            )}

            <div className="mt-8">
              <button
                disabled={isSigningIn}
                onClick={handleGoogleClick}
                className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-300 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google (Live Account)'}</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-softBorder text-[10px] text-mutedStone flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-leafGreen"></span>
            <span>Connected to Firebase: <strong>messwise-5fbd7</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#531b25] to-deepMaroon text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-turmericGold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full border border-turmericGold/30">
              MNNIT Allahabad Pilot
            </span>
            <h3 className="text-2xl font-serif font-black leading-tight">
              "Every Meal Accounted For. Every Resource Respected."
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Real-time Google OAuth authorization, rotating anti-double-dipping gate passes, explainable kitchen planning, and verified quality feedback.
            </p>
          </div>
          <div className="text-[11px] text-white/70">
            Powered by Firebase Cloud Identity & Next-gen Campus Telemetry
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD (When Logged In with Firebase) ---
const MainDashboard = () => {
  const { currentUser, signOut, meals, bookings, toggleMealBooking, rebateBalanceRs, theme, setTheme } = useMess();
  const [tokenSeconds, setTokenSeconds] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTokenSeconds(s => (s <= 1 ? 30 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-warmIvory dark:bg-appDark text-charcoal dark:text-textPrimary flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-riceWhite/95 dark:bg-surface/95 backdrop-blur border-b border-softBorder dark:border-borderDark px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-deepMaroon flex items-center justify-center text-turmericGold font-serif font-black text-lg">M</div>
          <div>
            <span className="font-serif font-bold text-base text-deepMaroon dark:text-primaryAccent block leading-tight">MessWise • Live Firebase</span>
            <span className="text-[10px] text-mutedStone tracking-tight block">MNNIT Allahabad</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-1.5 text-xs rounded-lg bg-warmIvory border border-softBorder">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* User Profile from Real Google Account */}
          <div className="flex items-center gap-2 pl-3 border-l border-softBorder">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-softBorder" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-deepMaroon text-white font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold block leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-mutedStone font-mono">{currentUser.email}</span>
            </div>
            <button
              onClick={signOut}
              className="px-2.5 py-1 text-xs text-errorRed hover:bg-red-50 border border-red-200 rounded font-semibold ml-2 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-deepMaroon to-[#531b25] text-riceWhite p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-turmericGold/20 text-turmericGold rounded-full border border-turmericGold/30">
              {currentUser.hostelName} • Role: {currentUser.role}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-serif mt-2">Welcome, {currentUser.name}!</h1>
            <p className="text-xs text-white/80 mt-1">Firebase Google UID: <span className="font-mono">{currentUser.uid.substring(0, 12)}...</span></p>
          </div>
          <div className="bg-black/25 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] uppercase text-white/70 block">MNNIT Rebate</span>
            <span className="text-xl font-bold font-mono text-leafGreen">₹{rebateBalanceRs}</span>
          </div>
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => {
            const booking = bookings[meal.id];
            const isLocked = meal.state !== 'OPEN';

            return (
              <div key={meal.id} className="bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-terracotta">{meal.type} • {meal.startTime} - {meal.endTime}</span>
                    <h3 className="font-bold text-base mt-0.5">{meal.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    booking?.status === 'CONSUMED' ? 'bg-blue-100 text-blue-800' :
                    booking?.status === 'CONFIRMED' ? 'bg-mutedSage text-leafGreen' : 'bg-red-100 text-errorRed'
                  }`}>
                    {booking?.status || 'NOT BOOKED'}
                  </span>
                </div>

                <div className="border-y border-softBorder/60 py-2.5 space-y-1 text-xs text-mutedStone">
                  {meal.items.map((it, idx) => (
                    <div key={idx}>• {it}</div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-mutedStone block">Cutoff:</span>
                    <span className="font-mono font-bold">{isLocked ? 'Locked' : `${meal.cutoff} IST`}</span>
                  </div>
                  {booking?.status === 'CONSUMED' ? (
                    <span className="text-leafGreen font-bold">✓ Redeemed at Gate</span>
                  ) : (
                    <button
                      disabled={isLocked}
                      onClick={() => toggleMealBooking(meal.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold ${
                        isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                        booking?.status === 'CONFIRMED' ? 'border border-errorRed text-errorRed hover:bg-errorRed hover:text-white' :
                        'bg-deepMaroon text-white'
                      }`}
                    >
                      {isLocked ? 'Cutoff Passed' : booking?.status === 'CONFIRMED' ? 'Cancel & Rebate ₹75' : 'Confirm Plate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Rotating Pass */}
        <div className="max-w-md mx-auto bg-riceWhite dark:bg-surface border border-softBorder dark:border-borderDark rounded-2xl p-6 shadow-xl text-center">
          <span className="text-[10px] font-bold text-turmericGold uppercase bg-turmericGold/10 px-3 py-1 rounded-full border border-turmericGold/30">
            Authenticated Gate Credential
          </span>
          <h2 className="text-base font-bold text-deepMaroon dark:text-primaryAccent mt-2">
            Sunday Lunch Token • {currentUser.name}
          </h2>

          <div className="my-4 p-4 bg-white rounded-xl shadow-inner inline-block border-2 border-dashed border-gray-300">
            <div className="w-48 h-48 mx-auto bg-white flex flex-col justify-between p-2 border-4 border-black">
              <div className="flex justify-between">
                <div className="w-8 h-8 bg-black p-1"><div className="w-full h-full bg-white p-0.5"><div className="w-full h-full bg-black"></div></div></div>
                <div className="w-8 h-8 bg-black p-1"><div className="w-full h-full bg-white p-0.5"><div className="w-full h-full bg-black"></div></div></div>
              </div>
              <div className="font-mono text-[8px] text-black font-bold break-all p-1">
                HMAC_MNNIT_{currentUser.uid.substring(0, 16)}
              </div>
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 bg-black p-1"><div className="w-full h-full bg-white p-0.5"><div className="w-full h-full bg-black"></div></div></div>
                <div className="font-mono text-[8px] font-bold text-black border p-0.5">MNNIT</div>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-deepMaroon dark:text-gold flex justify-center items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-turmericGold animate-ping"></span>
            Token rotates in: {tokenSeconds}s
          </div>
        </div>
      </main>
    </div>
  );
};

// --- ROOT COMPONENT ---
const App = () => {
  const { currentUser, loadingAuth } = useMess();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-warmIvory flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-deepMaroon border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-deepMaroon">Initializing Firebase Auth...</p>
        </div>
      </div>
    );
  }

  return currentUser ? <MainDashboard /> : <LoginPage />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <MessProvider>
    <App />
  </MessProvider>
);