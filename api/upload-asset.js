const { put } = require('@vercel/blob');

function requireToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is missing in server environment.');
  }
  return token;
}

function safeFileName(name) {
  // Keep it deterministic and avoid path traversal.
  return String(name || 'file')
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function dataUrlToBase64(dataUrl) {
  const str = String(dataUrl || '');
  const idx = str.indexOf('base64,');
  if (idx === -1) {
    // Some data URLs may omit "base64," but it's unlikely for binary uploads.
    throw new Error('Invalid data URL (expected base64).');
  }
  return str.slice(idx + 'base64,'.length);
}

module.exports = async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      response.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

    const dataUrl = body?.dataUrl;
    const fileName = body?.fileName;
    const contentType = body?.contentType;
    const folder = body?.folder || 'assets';
    const prefix = body?.prefix || 'uploaded';

    if (!dataUrl) {
      response.status(400).json({ error: 'Missing dataUrl.' });
      return;
    }

    const token = requireToken();
    const base64 = dataUrlToBase64(dataUrl);
    const buffer = Buffer.from(base64, 'base64');

    const finalName = safeFileName(fileName);
    const blobPath = `content/${folder}/${prefix}-${Date.now()}-${finalName}`;

    const url = await put(blobPath, buffer, {
      access: 'public',
      allowOverwrite: false,
      contentType: contentType || undefined,
      token
    });

    response.status(200).json({ url });
  } catch (error) {
    response.status(500).json({
      error: 'Asset upload failed.',
      details: error instanceof Error ? error.message : 'Unknown error.'
    });
  }
};

