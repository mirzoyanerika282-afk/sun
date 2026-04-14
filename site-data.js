(function () {
  const STORAGE_KEYS = {
    shows: 'sots_shows',
    tracks: 'sots_tracks',
    passcode: 'sots_admin_passcode'
  };

  const DEFAULT_SHOWS = [
    { id: 'show-1', date: '2026-04-12', title: 'Yerevan Rock Night', venue: 'Calumet', city: 'Yerevan', country: 'Armenia', tag: 'Hometown', ticketUrl: '' },
    { id: 'show-2', date: '2026-05-03', title: 'Tbilisi Underground Fest', venue: 'Bassiani', city: 'Tbilisi', country: 'Georgia', tag: 'Festival', ticketUrl: '' },
    { id: 'show-3', date: '2026-05-22', title: 'Rock the Ararat', venue: 'Republic Square', city: 'Yerevan', country: 'Armenia', tag: 'Open Air', ticketUrl: '' }
  ];

  const DEFAULT_TRACKS = [
    { id: 'track-1', year: '2024', releaseType: 'Single', title: 'Descent', description: 'A slow-burning heavy rock track that introduced South of the Sun to the underground scene.', coverUrl: 'IMG_7255.JPG', audioUrl: '', spotifyUrl: '', youtubeUrl: '' },
    { id: 'track-2', year: '2025', releaseType: 'EP', title: 'Sunblind', description: 'Four tracks of raw energy and melodic weight, captured with the feel of a live room.', coverUrl: 'IMG_7365.JPG', audioUrl: '', spotifyUrl: '', youtubeUrl: '' }
  ];

  const DEFAULT_PASSCODE = 'southsun-admin';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.shows)) {
      write(STORAGE_KEYS.shows, DEFAULT_SHOWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.tracks)) {
      write(STORAGE_KEYS.tracks, DEFAULT_TRACKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.passcode)) {
      localStorage.setItem(STORAGE_KEYS.passcode, DEFAULT_PASSCODE);
    }
  }

  function getShows() {
    return read(STORAGE_KEYS.shows, DEFAULT_SHOWS)
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function saveShows(shows) {
    write(STORAGE_KEYS.shows, shows);
  }

  function getTracks() {
    return read(STORAGE_KEYS.tracks, DEFAULT_TRACKS);
  }

  function saveTracks(tracks) {
    write(STORAGE_KEYS.tracks, tracks);
  }

  function getPasscode() {
    return localStorage.getItem(STORAGE_KEYS.passcode) || DEFAULT_PASSCODE;
  }

  function savePasscode(passcode) {
    localStorage.setItem(STORAGE_KEYS.passcode, passcode);
  }

  function formatShowDate(value) {
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) {
      return { monthDay: 'TBA', year: '' };
    }

    const parts = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value?.toUpperCase() || '';
    const day = parts.find((part) => part.type === 'day')?.value || '';
    const year = parts.find((part) => part.type === 'year')?.value || '';

    return { monthDay: (month + ' ' + day).trim(), year };
  }

  function uid(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  ensureDefaults();

  window.SOTS_STORAGE = {
    getShows,
    saveShows,
    getTracks,
    saveTracks,
    getPasscode,
    savePasscode,
    formatShowDate,
    uid
  };
})();
