import { User, LeaderboardEntry } from '../types';

const STORAGE_KEY = 'katar_user_session';
const LEADERBOARD_KEY = 'katar_leaderboard_mock';

// ⚠️ PENTING: GANTI URL INI DENGAN URL WEB APP ANDA SENDIRI DARI GOOGLE APPS SCRIPT
// Pastikan Deploy sebagai "Web App", Execute as "Me", Who has access "Anyone"
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKT9VZeS0rGJXBbxGAgX1_WTxwo8LnprCLRVhJnEK3a3rjpcri4sZsuxCrwG1mJFJU/exec'; 

export const getUserSession = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const loginUser = async (username: string, phone: string): Promise<User> => {
  const id = `${username.replace(/\s+/g, '').toLowerCase()}_${phone}`;
  
  try {
    console.log("Attempting to connect to Sheet...");
    
    // TRICK ANTI-CORS:
    // Gunakan 'Content-Type': 'text/plain'.
    // Ini mencegah browser mengirim 'OPTIONS' preflight request yang biasanya gagal di Apps Script.
    // Script GAS tetap bisa membaca body request.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow', // Penting untuk Apps Script redirects
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ 
        action: 'login', 
        username: username, 
        phone: phone 
      })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Sheet Response:", data);

    if (data.error) throw new Error(data.error);

    const user: User = {
      id: data.id,
      username: data.username,
      phone: phone,
      scores: {
        warTakjil: data.scores.warTakjil || 0,
        slideJannah: data.scores.slideJannah || 0,
        dilema: data.scores.dilema || 0
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;

  } catch (error) {
    console.error("Online login failed:", error);
    alert("Gagal koneksi ke Database. Masuk mode Offline. Cek Console untuk detail error.");
    
    // OFFLINE FALLBACK (Tetap login tapi lokal)
    let user: User = getUserSession() || {
      id,
      username,
      phone,
      scores: { warTakjil: 0, slideJannah: 0, dilema: 0 }
    };

    // Update session jika user baru di offline
    if (user.id !== id) {
       user = { id, username, phone, scores: { warTakjil: 0, slideJannah: 0, dilema: 0 } };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
};

export const submitScore = async (game: 'warTakjil' | 'slideJannah' | 'dilema', score: number): Promise<User> => {
  const user = getUserSession();
  if (!user) throw new Error("No user logged in");

  // Optimistic Local Update
  if (score > user.scores[game]) {
    user.scores[game] = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  try {
    // Send to Sheet using text/plain to bypass CORS checks
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: 'update_score',
        userId: user.id,
        game: game,
        score: score
      })
    });
  } catch (e) {
    console.error("Failed to sync score to cloud", e);
  }

  return user;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL); 
    const data = await response.json();
    
    if (Array.isArray(data)) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
      return data;
    } else {
      return [];
    }
  } catch (e) {
    console.error("Failed to fetch leaderboard", e);
    const mockData = localStorage.getItem(LEADERBOARD_KEY);
    return mockData ? JSON.parse(mockData) : [];
  }
};
