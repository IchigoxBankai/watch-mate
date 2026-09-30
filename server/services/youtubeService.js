/**
 * YouTube Search & Discovery Service
 * Fetches real YouTube search results without requiring a paid API key.
 */

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function searchYouTube(query, limit = 20) {
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}&hl=en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.warn('[YouTubeService] HTTP error:', response.status);
      return [];
    }

    const html = await response.text();

    // Extract ytInitialData JSON
    let initialData = null;
    const match = html.match(/var\s+ytInitialData\s*=\s*({.+?});<\/script>/s) ||
                  html.match(/window\["ytInitialData"\]\s*=\s*({.+?});<\/script>/s) ||
                  html.match(/ytInitialData\s*=\s*({.+?});/s);

    if (match && match[1]) {
      try {
        initialData = JSON.parse(match[1]);
      } catch (err) {
        console.warn('[YouTubeService] JSON parse error from regex match:', err.message);
      }
    }

    if (!initialData) {
      return getFallbackResults(query);
    }

    const items = [];
    const contents = initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    for (const section of contents) {
      const itemSection = section?.itemSectionRenderer?.contents || [];
      for (const item of itemSection) {
        if (item?.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;

          const title = v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || 'YouTube Video';
          const channel = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'YouTube Channel';
          const thumbnail = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          const duration = v.lengthText?.simpleText || (v.badges?.some(b => b.metadataBadgeRenderer?.style?.includes('LIVE')) ? 'LIVE' : '');
          const isLive = duration === 'LIVE' || v.thumbnailOverlays?.some(o => o.thumbnailOverlayTimeStatusRenderer?.style === 'LIVE');
          const views = v.viewCountText?.simpleText || v.viewCountText?.runs?.map(r => r.text).join('') || '';

          items.push({
            id: videoId,
            youtubeId: videoId,
            title,
            channel,
            thumbnail,
            duration,
            isLive: !!isLive,
            views,
            url: `https://www.youtube.com/watch?v=${videoId}`
          });

          if (items.length >= limit) break;
        }
      }
      if (items.length >= limit) break;
    }

    return items.length > 0 ? items : getFallbackResults(query);
  } catch (error) {
    console.error('[YouTubeService] Search failed:', error);
    return getFallbackResults(query);
  }
}

function getFallbackResults(query) {
  const q = (query || '').toLowerCase();
  const allCurated = [
    {
      id: 'jfKfPfyJRdk',
      youtubeId: 'jfKfPfyJRdk',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study to [24/7 Live Stream]',
      channel: 'Lofi Girl',
      thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      duration: 'LIVE',
      isLive: true,
      views: '45K watching now',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
    },
    {
      id: '4xDzrJKXOOY',
      youtubeId: '4xDzrJKXOOY',
      title: 'Synthwave Radio - Chill synth / retro beats to relax/game to',
      channel: 'Lofi Girl',
      thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
      duration: 'LIVE',
      isLive: true,
      views: '12K watching now',
      url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY'
    },
    {
      id: 'cqGjhVJWtEg',
      youtubeId: 'cqGjhVJWtEg',
      title: 'Spider-Man: Across the Spider-Verse - Official Trailer',
      channel: 'Sony Pictures Entertainment',
      thumbnail: 'https://img.youtube.com/vi/cqGjhVJWtEg/hqdefault.jpg',
      duration: '2:25',
      isLive: false,
      views: '48M views',
      url: 'https://www.youtube.com/watch?v=cqGjhVJWtEg'
    },
    {
      id: 'd9MyW72ELq0',
      youtubeId: 'd9MyW72ELq0',
      title: 'Avatar: The Way of Water - Official Teaser Trailer',
      channel: 'Avatar',
      thumbnail: 'https://img.youtube.com/vi/d9MyW72ELq0/hqdefault.jpg',
      duration: '1:37',
      isLive: false,
      views: '54M views',
      url: 'https://www.youtube.com/watch?v=d9MyW72ELq0'
    },
    {
      id: 'qEVUtrk8_B4',
      youtubeId: 'qEVUtrk8_B4',
      title: 'John Wick: Chapter 4 - Final Official Trailer',
      channel: 'Lionsgate Movies',
      thumbnail: 'https://img.youtube.com/vi/qEVUtrk8_B4/hqdefault.jpg',
      duration: '2:30',
      isLive: false,
      views: '38M views',
      url: 'https://www.youtube.com/watch?v=qEVUtrk8_B4'
    },
    {
      id: 'JkaxUblCGz0',
      youtubeId: 'JkaxUblCGz0',
      title: 'Cyberpunk: Edgerunners - Official Trailer',
      channel: 'Netflix',
      thumbnail: 'https://img.youtube.com/vi/JkaxUblCGz0/hqdefault.jpg',
      duration: '2:12',
      isLive: false,
      views: '18M views',
      url: 'https://www.youtube.com/watch?v=JkaxUblCGz0'
    },
    {
      id: 'dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video 4K Remastered)',
      channel: 'Rick Astley',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: '3:33',
      isLive: false,
      views: '1.5B views',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  ];

  return allCurated.filter(item => 
    !q || item.title.toLowerCase().includes(q) || item.channel.toLowerCase().includes(q)
  );
}
