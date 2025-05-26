// api/index.js

export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const token = 'apify_api_O6RNxNfIzWu2X13vDtnXYBXQBmR46k2u4WuC'; // your Apify token
  const startUrl = `https://api.apify.com/v2/acts/THsHv6oGvdabJWIjh/runs?token=${token}`;
  const payload = {
    tiktokUsernames: [username]
  };

  try {
    // Start the actor run
    const startResponse = await fetch(startUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const startData = await startResponse.json();

    if (!startData.data || !startData.data.id) {
      return res.status(500).json({ error: "Failed to start TikTok fetch" });
    }

    const runId = startData.data.id;
    const getResultUrl = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`;

    // Poll for the result (max wait ~30 seconds)
    let result = null;
    const maxRetries = 10;
    let retries = 0;

    while (!result && retries < maxRetries) {
      await new Promise(r => setTimeout(r, 3000)); // wait 3 seconds
      const resultResponse = await fetch(getResultUrl);
      const data = await resultResponse.json();

      if (Array.isArray(data) && data.length > 0) {
        result = data[0];
      }
      retries++;
    }

    if (!result) {
      return res.status(504).json({ error: "Timeout waiting for TikTok data" });
    }

    // Return the JSON result directly
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message || "Unknown error" });
  }
}
