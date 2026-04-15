const { list, put } = require('@vercel/blob');

const DEFAULT_CONTENT = {
  shows: [
    { id: 'show-1', date: '2026-04-12', title: 'Yerevan Rock Night', venue: 'Calumet', city: 'Yerevan', country: 'Armenia', tag: 'Hometown', ticketUrl: '' },
    { id: 'show-2', date: '2026-05-03', title: 'Tbilisi Underground Fest', venue: 'Bassiani', city: 'Tbilisi', country: 'Georgia', tag: 'Festival', ticketUrl: '' },
    { id: 'show-3', date: '2026-05-22', title: 'Rock the Ararat', venue: 'Republic Square', city: 'Yerevan', country: 'Armenia', tag: 'Open Air', ticketUrl: '' }
  ],
  tracks: [
    { id: 'track-1', year: '2024', releaseType: 'Single', title: 'Descent', description: 'A slow-burning heavy rock track that introduced South of the Sun to the underground scene.', coverUrl: 'IMG_7255.JPG', audioUrl: '', spotifyUrl: '', youtubeUrl: '' },
    { id: 'track-2', year: '2025', releaseType: 'EP', title: 'Sunblind', description: 'Four tracks of raw energy and melodic weight, captured with the feel of a live room.', coverUrl: 'IMG_7365.JPG', audioUrl: '', spotifyUrl: '', youtubeUrl: '' }
  ]
};

async function readContent() {
  const blobs = await list({ prefix: 'content/site-content.json', limit: 1 });
  const blob = blobs.blobs?.find((item) => item.pathname === 'content/site-content.json') || blobs.blobs?.[0];

  if (!blob?.url) {
    return DEFAULT_CONTENT;
  }

  const response = await fetch(blob.url, { cache: 'no-store' });
  if (!response.ok) {
    return DEFAULT_CONTENT;
  }

  const data = await response.json();
  return {
    shows: Array.isArray(data.shows) ? data.shows : DEFAULT_CONTENT.shows,
    tracks: Array.isArray(data.tracks) ? data.tracks : DEFAULT_CONTENT.tracks
  };
}

module.exports = async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      const content = await readContent();
      response.status(200).json(content);
      return;
    }

    if (request.method === 'POST') {
      const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      const content = {
        shows: Array.isArray(body?.shows) ? body.shows : DEFAULT_CONTENT.shows,
        tracks: Array.isArray(body?.tracks) ? body.tracks : DEFAULT_CONTENT.tracks
      };

      await put('content/site-content.json', JSON.stringify(content, null, 2), {
        access: 'public',
        allowOverwrite: true,
        contentType: 'application/json'
      });

      response.status(200).json(content);
      return;
    }

    response.setHeader('Allow', 'GET, POST');
    response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    response.status(500).json({
      error: 'Content storage failed.',
      details: error instanceof Error ? error.message : 'Unknown error.'
    });
  }
}
