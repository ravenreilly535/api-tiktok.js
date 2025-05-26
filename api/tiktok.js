export default async function handler(req, res) {
    const { username } = req.query;
    const token = 'apify_api_O6RNxNfIzWu2X13vDtnXYBXQBmR46k2u4WuC';  // Yaha Apify ka token daalo

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Step 1: Run Actor (agar naye username ke liye chahiye)
    const startUrl = `https://api.apify.com/v2/acts/apify~tiktok-scraper/run-sync-get-dataset-items?token=${token}`;
    const payload = {
        userProfileUrls: [`https://www.tiktok.com/@${username}`],
        maxProfiles: 1
    };

    try {
        const startResponse = await fetch(startUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await startResponse.json();

        if (data.length === 0) {
            return res.status(404).json({ error: 'No data found for this username' });
        }

        const profile = data[0];
        return res.status(200).json({
            username: profile.uniqueId,
            nickname: profile.nickname,
            avatar: profile.avatarThumb,
            followers: profile.stats.followerCount,
            following: profile.stats.followingCount,
            likes: profile.stats.heartCount
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
}
