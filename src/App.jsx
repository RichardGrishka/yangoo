import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'yangoo-accounts-v1';
const ACTIVE_KEY = 'yangoo-active-account-v1';
const SECRET_CODE = 'помощник123';

const starterCharacters = [
  {
    id: 'yang',
    name: 'Yang',
    title: 'Language guide',
    role: 'main',
    description: 'Calm, clever and endlessly curious. Yang leads every journey through sounds, words and culture.',
    color: '#7dd3fc',
  },
  {
    id: 'laira',
    name: 'Laira',
    title: 'Speaking coach',
    role: 'speaking',
    description: 'Helps you hear, repeat and talk naturally without pressure.',
    color: '#c4b5fd',
  },
  {
    id: 'ren',
    name: 'Ren',
    title: 'Grammar guide',
    role: 'grammar',
    description: 'Breaks rules down into simple patterns and clear logic.',
    color: '#93c5fd',
  },
  {
    id: 'miro',
    name: 'Miro',
    title: 'Writing mentor',
    role: 'writing',
    description: 'Turns your sentences into stories, messages and real-world writing.',
    color: '#86efac',
  },
  {
    id: 'sora',
    name: 'Sora',
    title: 'Culture guide',
    role: 'culture',
    description: 'Shows the heart of the language through real conversations and culture.',
    color: '#f9a8d4',
  },
];

const defaultLanguages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Arabic',
  'Italian',
  'Portuguese',
  'Chinese',
];

const initialLessons = [
  { id: 1, title: 'Daily greeting', level: 'Beginner', type: 'Speaking', xp: 30 },
  { id: 2, title: 'Travel phrases', level: 'Beginner', type: 'Listening', xp: 45 },
  { id: 3, title: 'Grammar flow', level: 'Intermediate', type: 'Grammar', xp: 60 },
  { id: 4, title: 'Write your story', level: 'Intermediate', type: 'Writing', xp: 80 },
  { id: 5, title: 'Live conversation', level: 'Advanced', type: 'Dialogue', xp: 95 },
];

const starterFriends = [
  { id: 'leo', name: 'Leo', language: 'English', streak: 8 },
  { id: 'nina', name: 'Nina', language: 'Spanish', streak: 12 },
  { id: 'haru', name: 'Haru', language: 'Japanese', streak: 15 },
  { id: 'mai', name: 'Mai', language: 'French', streak: 6 },
];

const defaultQuestions = [
  'What is the difference between “too” and “also”?',
  'How do I sound more natural when speaking in a meeting?',
  'Can you correct this sentence: “I am go to the market yesterday”?',
];

const emptyProfile = {
  id: '',
  nickname: '',
  email: '',
  password: '',
  language: 'English',
  level: 'Beginner',
  style: 'Sky',
  bio: 'Learning every day, one sentence at a time.',
  role: 'student',
  createdAt: Date.now(),
  xp: 120,
  streak: 4,
  friends: starterFriends,
  helperQuestions: defaultQuestions,
};

function readAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readActiveAccountId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null;
  } catch {
    return null;
  }
}

function App() {
  const [accounts, setAccounts] = useState(() => readAccounts());
  const [activeAccountId, setActiveAccountId] = useState(() => readActiveAccountId());
  const [currentView, setCurrentView] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [friendName, setFriendName] = useState('');
  const [helperQuestion, setHelperQuestion] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem(ACTIVE_KEY, activeAccountId);
    }
  }, [activeAccountId]);

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId) || null,
    [accounts, activeAccountId]
  );

  const registerUser = (form) => {
    const trimmedNickname = form.nickname.trim();
    const trimmedEmail = form.email.trim();
    const normalizedCode = String(form.secretCode || '').trim().toLowerCase();

    const exists = accounts.some(
      (account) => account.nickname.toLowerCase() === trimmedNickname.toLowerCase()
    );

    if (!trimmedNickname || !trimmedEmail || !form.password) {
      setMessage('Please fill in nickname, email and password.');
      return;
    }

    if (exists) {
      setMessage('This nickname already exists. Choose another one.');
      return;
    }

    const newProfile = {
      ...emptyProfile,
      id: crypto.randomUUID(),
      nickname: trimmedNickname,
      email: trimmedEmail,
      password: form.password,
      language: form.language || 'English',
      style: form.style || 'Sky',
      role: normalizedCode === SECRET_CODE ? 'helper' : 'student',
      xp: normalizedCode === SECRET_CODE ? 260 : 120,
      streak: normalizedCode === SECRET_CODE ? 9 : 4,
      level: 'Beginner',
    };

    const updatedAccounts = [...accounts, newProfile];
    setAccounts(updatedAccounts);
    setActiveAccountId(newProfile.id);
    setCurrentView('dashboard');
    setMessage(
      normalizedCode === SECRET_CODE
        ? 'Welcome helper. You can now answer other users.'
        : 'Account created successfully.'
    );
  };

  const switchAccount = (accountId) => {
    setActiveAccountId(accountId);
    setCurrentView('dashboard');
    setMessage('Account switched.');
  };

  const addFriend = () => {
    if (!activeAccount || !friendName.trim()) return;
    const name = friendName.trim();

    const newFriend = {
      id: crypto.randomUUID(),
      name,
      language: activeAccount.language,
      streak: Math.max(2, 5 + Math.floor(Math.random() * 12)),
    };

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === activeAccount.id
          ? { ...account, friends: [newFriend, ...(account.friends || [])] }
          : account
      )
    );

    setFriendName('');
    setMessage(`${name} was added to your friends.`);
  };

  const submitHelperQuestion = () => {
    if (!activeAccount || !helperQuestion.trim()) return;

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === activeAccount.id
          ? {
              ...account,
              helperQuestions: [helperQuestion.trim(), ...(account.helperQuestions || [])],
            }
          : account
      )
    );

    setHelperQuestion('');
    setMessage('Your question is now in the helper desk.');
  };

  const updateProfile = (updates) => {
    if (!activeAccount) return;

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === activeAccount.id ? { ...account, ...updates } : account
      )
    );

    setMessage('Profile updated.');
  };

  if (!activeAccount && accounts.length > 0) {
    return (
      <div className="app-shell auth-shell">
        <div className="panel auth-panel">
          <div className="brand-block">
            <div className="brand-mark">𝓨</div>
            <div>
              <h1>Yangoo</h1>
              <p>Language learning world</p>
            </div>
          </div>
          <p className="mini-note">Choose an account to continue.</p>
          <div className="account-list">
            {accounts.map((account) => (
              <button key={account.id} className="account-card" onClick={() => switchAccount(account.id)}>
                <div>
                  <strong>{account.nickname}</strong>
                  <span>{account.language}</span>
                </div>
                <small>{account.role === 'helper' ? 'Helper' : 'Student'}</small>
              </button>
            ))}
          </div>
          <button className="secondary" onClick={() => setActiveAccountId(accounts[0].id)}>
            Continue with first account
          </button>
        </div>
      </div>
    );
  }

  if (!activeAccount && accounts.length === 0) {
    return (
      <RegistrationForm
        onSubmit={registerUser}
        message={message}
        setMessage={setMessage}
        languages={defaultLanguages}
      />
    );
  }

  const friendList = activeAccount.friends || starterFriends;
  const helperMode = activeAccount.role === 'helper';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">𝓨</div>
          <div>
            <h2>Yangoo</h2>
            <p>{activeAccount.nickname}</p>
          </div>
        </div>

        <nav className="nav-list">
          {['dashboard', 'lessons', 'friends', 'helper', 'profile'].map((tab) => (
            <button
              key={tab}
              className={currentView === tab ? 'nav-item active' : 'nav-item'}
              onClick={() => setCurrentView(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="avatar-card">
          <div className="avatar">Y</div>
          <div>
            <strong>{activeAccount.nickname}</strong>
            <span>{activeAccount.language}</span>
          </div>
        </div>

        <div className="mini-panel">
          <p>XP</p>
          <h3>{activeAccount.xp}</h3>
          <span>{activeAccount.streak} day streak</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Language journey</p>
            <h1>{activeAccount.language} quest</h1>
          </div>
          <div className="top-actions">
            <button className="secondary" onClick={() => setCurrentView('profile')}>
              Profile
            </button>
            <button className="primary" onClick={() => setAccounts([])}>
              New account
            </button>
          </div>
        </header>

        {message && <div className="flash-message">{message}</div>}

        {currentView === 'dashboard' && (
          <div className="screen-grid">
            <section className="card hero-card">
              <div>
                <p className="eyebrow">Main guide</p>
                <h2>Meet Yang</h2>
                <p>
                  Yang is your calm travel guide through words, sounds and culture. Every level is a new stop on the map.
                </p>
                <button className="primary">Continue journey</button>
              </div>
              <div className="hero-avatar">𝔂</div>
            </section>

            <section className="card mini-characters">
              <p className="eyebrow">Your squad</p>
              <div className="character-grid">
                {starterCharacters.map((character) => (
                  <div key={character.id} className="character-pill" style={{ background: character.color }}>
                    <strong>{character.name}</strong>
                    <small>{character.title}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="card wide-card">
              <p className="eyebrow">Today’s path</p>
              <div className="lesson-row">
                {initialLessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.id} className="lesson-box">
                    <span>{lesson.type}</span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.level}</small>
                    <em>+{lesson.xp} XP</em>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentView === 'lessons' && (
          <div className="screen-grid">
            {initialLessons.map((lesson) => (
              <div key={lesson.id} className="card lesson-card">
                <div className="lesson-topline">
                  <span>{lesson.type}</span>
                  <strong>+{lesson.xp}</strong>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.level} level challenge</p>
                <button className="primary">Start</button>
              </div>
            ))}
          </div>
        )}

        {currentView === 'friends' && (
          <div className="screen-grid">
            <section className="card wide-card">
              <p className="eyebrow">Add friends</p>
              <div className="friend-form">
                <input
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Friend nickname"
                />
                <button className="primary" onClick={addFriend}>Add friend</button>
              </div>
            </section>

            <section className="card wide-card">
              <p className="eyebrow">Your community</p>
              <div className="friend-list">
                {friendList.map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <div className="mini-avatar">{friend.name.slice(0, 1)}</div>
                    <div>
                      <strong>{friend.name}</strong>
                      <small>{friend.language}</small>
                    </div>
                    <span>{friend.streak} days</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentView === 'helper' && (
          <div className="screen-grid">
            <section className="card wide-card">
              <p className="eyebrow">Helper desk</p>
              {helperMode ? (
                <>
                  <textarea
                    value={helperQuestion}
                    onChange={(e) => setHelperQuestion(e.target.value)}
                    placeholder="Ask your question for other users..."
                  />
                  <button className="primary" onClick={submitHelperQuestion}>Send question</button>
                  <div className="helper-questions">
                    {(activeAccount.helperQuestions || defaultQuestions).map((question, index) => (
                      <div key={`${question}-${index}`} className="helper-item">
                        {question}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="helper-gate">
                  <p>To become a helper, enter the secret code:</p>
                  <strong>{SECRET_CODE}</strong>
                  <button
                    className="primary"
                    onClick={() => updateProfile({ role: 'helper', xp: 260, streak: 9 })}
                  >
                    Activate helper mode
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="screen-grid">
            <section className="card wide-card">
              <p className="eyebrow">Profile</p>
              <div className="profile-form">
                <input
                  value={activeAccount.nickname}
                  onChange={(e) => updateProfile({ nickname: e.target.value })}
                  placeholder="Nickname"
                />
                <input
                  value={activeAccount.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  placeholder="Email"
                />
                <select
                  value={activeAccount.language}
                  onChange={(e) => updateProfile({ language: e.target.value })}
                >
                  {defaultLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <select
                  value={activeAccount.style}
                  onChange={(e) => updateProfile({ style: e.target.value })}
                >
                  <option value="Sky">Sky</option>
                  <option value="Neon">Neon</option>
                  <option value="Forest">Forest</option>
                  <option value="Minimal">Minimal</option>
                </select>
                <textarea
                  value={activeAccount.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder="Bio"
                />
              </div>
            </section>

            <section className="card wide-card">
              <p className="eyebrow">Accounts</p>
              <div className="account-list compact">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    className={activeAccount.id === account.id ? 'account-card active' : 'account-card'}
                    onClick={() => switchAccount(account.id)}
                  >
                    <div>
                      <strong>{account.nickname}</strong>
                      <span>{account.language}</span>
                    </div>
                    <small>{account.role === 'helper' ? 'Helper' : 'Student'}</small>
                  </button>
                ))}
              </div>
              <div className="profile-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    const fresh = {
                      ...emptyProfile,
                      id: crypto.randomUUID(),
                      nickname: `Guest${accounts.length + 1}`,
                      email: `guest${accounts.length + 1}@yangoo.app`,
                      password: 'demo123',
                      language: 'English',
                      style: 'Sky',
                    };
                    const nextAccounts = [...accounts, fresh];
                    setAccounts(nextAccounts);
                    setActiveAccountId(fresh.id);
                    setCurrentView('dashboard');
                    setMessage('New profile created.');
                  }}
                >
                  Add new account
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function RegistrationForm({ onSubmit, message, setMessage, languages }) {
  const [form, setForm] = useState({
    nickname: '',
    email: '',
    password: '',
    language: 'English',
    style: 'Sky',
    secretCode: '',
  });

  return (
    <div className="app-shell auth-shell">
      <div className="panel auth-panel">
        <div className="brand-block">
          <div className="brand-mark">𝓨</div>
          <div>
            <h1>Yangoo</h1>
            <p>Learn any language, anywhere.</p>
          </div>
        </div>

        <p className="mini-note">This app was created by GitHub user RichardGrishka.</p>

        <div className="register-form">
          <input
            placeholder="Nickname"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <select
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
          >
            <option value="Sky">Sky</option>
            <option value="Neon">Neon</option>
            <option value="Forest">Forest</option>
            <option value="Minimal">Minimal</option>
          </select>
          <input
            placeholder="Secret code"
            value={form.secretCode}
            onChange={(e) => setForm({ ...form, secretCode: e.target.value })}
          />
          <button className="primary" onClick={() => onSubmit(form)}>
            Create account
          </button>
          {message && <div className="flash-message">{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
