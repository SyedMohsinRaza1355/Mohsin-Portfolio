const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
const USERNAME_PATTERN = /^[A-Za-z0-9_-]{1,50}$/;

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const username = String(req.query.username || '').trim();
    if (!USERNAME_PATTERN.test(username)) {
        return res.status(400).json({ error: 'A valid LeetCode username is required.' });
    }

    const query = `query userStats($username: String!) {
        matchedUser(username: $username) {
            username
            profile { ranking }
            submitStats { acSubmissionNum { difficulty count } }
        }
    }`;

    try {
        const upstream = await fetch(LEETCODE_GRAPHQL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': `https://leetcode.com/u/${encodeURIComponent(username)}/`
            },
            body: JSON.stringify({ query, variables: { username } }),
            signal: AbortSignal.timeout(8000)
        });

        if (!upstream.ok) throw new Error(`LeetCode returned ${upstream.status}`);
        const payload = await upstream.json();
        const user = payload?.data?.matchedUser;
        if (!user || payload.errors?.length) {
            return res.status(404).json({ error: 'LeetCode profile was not found.' });
        }

        const counts = user.submitStats?.acSubmissionNum || [];
        const countFor = difficulty => Number(counts.find(item => item.difficulty === difficulty)?.count || 0);
        const stats = {
            username: user.username,
            totalSolved: countFor('All'),
            easySolved: countFor('Easy'),
            mediumSolved: countFor('Medium'),
            hardSolved: countFor('Hard'),
            ranking: Number(user.profile?.ranking || 0)
        };
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).json(stats);
    } catch (error) {
        console.error('LeetCode profile lookup failed:', error.message);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(502).json({ error: 'LeetCode stats are temporarily unavailable.' });
    }
};
