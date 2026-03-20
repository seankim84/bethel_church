export type YoutubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

type FetchYoutubeVideosParams = {
  apiKey: string;
  channelInput: string;
  maxResults: number;
  query?: string;
  pageToken?: string;
};

function normalizeChannelInput(input: string) {
  const raw = input.trim();
  if (!raw) return "";
  if (raw.startsWith("UC")) return raw;

  if (raw.includes("youtube.com/channel/")) {
    const match = raw.match(/youtube\.com\/channel\/(UC[\w-]+)/);
    if (match?.[1]) return match[1];
  }

  if (raw.includes("youtube.com/@")) {
    const match = raw.match(/youtube\.com\/(@[^/?]+)/);
    if (match?.[1]) return match[1];
  }

  if (raw.startsWith("@")) return raw;
  return raw;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function resolveChannelId(apiKey: string, channelInput: string) {
  const normalized = normalizeChannelInput(channelInput);
  if (!normalized) return "";
  if (normalized.startsWith("UC")) return normalized;

  const handle = safeDecode(normalized.startsWith("@") ? normalized.slice(1) : normalized);

  const byHandleParams = new URLSearchParams({
    key: apiKey,
    part: "id",
    forHandle: handle
  });
  const byHandleRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?${byHandleParams.toString()}`, {
    cache: "no-store"
  });
  if (byHandleRes.ok) {
    const byHandleData = await byHandleRes.json();
    const channelId = byHandleData.items?.[0]?.id;
    if (channelId) return channelId as string;
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: handle,
    type: "channel",
    maxResults: "1"
  });
  const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`, {
    cache: "no-store"
  });
  if (!searchRes.ok) return "";
  const searchData = await searchRes.json();
  return (searchData.items?.[0]?.id?.channelId || "") as string;
}

export async function fetchYoutubeVideos({
  apiKey,
  channelInput,
  maxResults,
  query,
  pageToken
}: FetchYoutubeVideosParams) {
  if (!apiKey || !channelInput) return { items: [] as YoutubeVideo[], nextPageToken: "" };
  const channelId = await resolveChannelId(apiKey, channelInput);
  if (!channelId) return { items: [] as YoutubeVideo[], nextPageToken: "" };

  const params = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    order: "date",
    maxResults: String(maxResults),
    type: "video"
  });
  if (query) params.append("q", query);
  if (pageToken) params.append("pageToken", pageToken);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
    cache: "no-store"
  });
  if (!res.ok) return { items: [] as YoutubeVideo[], nextPageToken: "" };

  const data = await res.json();
  const items: YoutubeVideo[] = (data.items || []).map((i: any) => ({
    id: i.id.videoId,
    title: i.snippet.title,
    thumbnail: i.snippet.thumbnails?.high?.url || i.snippet.thumbnails?.default?.url,
    publishedAt: i.snippet.publishedAt
  }));
  return {
    items,
    nextPageToken: (data.nextPageToken || "") as string
  };
}
