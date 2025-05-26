// api/tiktok.js
export default async function handler(req, res) {
    const { username } = req.query;
    const token = 'apify_api_O6RNxNfIzWu2X13vDtnXYBXQBmR46k2u4WuC';

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const url = `https://api.apify.com/v2/acts/THsHv6oGvdabJWIjh/runs?token=${token}`;
    const payload = { tiktokUsernames: [username] };

    try {
        // Start the actor run
        const startResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const startData = await startResponse.json();
        const runId = startData.data.id;

        // Polling for result
        const getResultUrl = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`;
        let result = null;
        let retries = 0;
        while (!result && retries < 20) {
            await new Promise(r => setTimeout(r, 3000));
            const response = await fetch(getResultUrl);
            const data = await response.json();
            if (data.length > 0) {
                result = data[0];
                break;
            }
            retries++;
        }

        if (result) {
            return res.status(200).json({
                username: result.username || username,
                nickname: result.nickname || '',
                avatar: result.avatar || '',
                followers: result.followers || 0,
                following: result.following || 0,
                likes: result.likes || 0
            });
        } else {
            return res.status(500).json({ error: 'No result found, try again later' });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
}
