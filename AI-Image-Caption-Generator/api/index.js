module.exports = async function (context, req) {
  try {
    const endpoint = process.env.VISION_ENDPOINT;
    const key = process.env.VISION_KEY;
    const apiVersion = '2023-02-01-preview';

    if (!endpoint || !key) {
      context.log.warn('VISION_ENDPOINT or VISION_KEY not set.');
      context.res = { status: 500, body: { error: 'Server misconfigured.' } };
      return;
    }

    // URL path: accept either { url } or { image (base64) }
    if (req.body && req.body.url) {
      const imageUrl = String(req.body.url).trim();
      if (!/^https?:\/\//i.test(imageUrl)) {
        context.res = { status: 400, body: { error: 'Invalid URL.' } };
        return;
      }
      const caption = await captionFromUrl(endpoint, key, apiVersion, imageUrl);
      context.res = { body: { caption, confidence: extractConfidence(caption) } };
      return;
    }

    if (req.body && req.body.image) {
      const b64 = String(req.body.image);
      // Basic size check (base64 length approx 4/3 of bytes)
      const bytes = Math.ceil(b64.length * 3 / 4);
      if (bytes > 5 * 1024 * 1024) {
        context.res = { status: 413, body: { error: 'Image too large (max 5MB).' } };
        return;
      }

      // Optional: virus/malware scan placeholder
      // If you want to scan the image, call a scanning service here (e.g., an internal scanner or a third-party API).
      // Example: send `imgBuffer` to a scanning endpoint and reject if malicious.
      // For cost and complexity reasons, this template does NOT include a scanner.
      const imgBuffer = Buffer.from(b64, 'base64');

      const caption = await captionFromBinary(endpoint, key, apiVersion, imgBuffer);
      context.res = { body: { caption, confidence: extractConfidence(caption) } };
      return;
    }

    context.res = { status: 400, body: { error: 'Missing image or url in request.' } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 502, body: { error: err.message || 'Failed to generate caption.' } };
  }
};

async function captionFromBinary(endpoint, key, apiVersion, buffer) {
  const url = `${endpoint.replace(/\/$/, '')}/computervision/imageanalysis:analyze?api-version=${apiVersion}&features=caption`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/octet-stream'
    },
    body: buffer
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(()=>'');
    throw new Error('Azure Vision error: ' + resp.status + ' ' + txt);
  }
  const data = await resp.json().catch(()=> ({}));
  return data;
}

async function captionFromUrl(endpoint, key, apiVersion, imageUrl) {
  const url = `${endpoint.replace(/\/$/, '')}/computervision/imageanalysis:analyze?api-version=${apiVersion}&features=caption`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: imageUrl })
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(()=>'');
    throw new Error('Azure Vision error: ' + resp.status + ' ' + txt);
  }
  const data = await resp.json().catch(()=> ({}));
  return data;
}

function extractConfidence(data) {
  // Newer responses may include captionResult.confidence or description.captions[0].confidence
  if (!data) return null;
  if (data?.captionResult?.confidence) return data.captionResult.confidence;
  if (data?.description?.captions && data.description.captions.length && data.description.captions[0].confidence) return data.description.captions[0].confidence;
  return null;
}