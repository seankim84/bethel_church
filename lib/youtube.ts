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

// UC... → UU... 변환으로 업로드 플레이리스트 ID 생성 (API 1유닛)
function uploadsPlaylistId(channelId: string) {
  return "UU" + channelId.slice(2);
}

// channels API로 채널 ID 해석 (1유닛, search 사용 안 함)
export async function resolveChannelId(apiKey: string, channelInput: string) {
  const normalized = normalizeChannelInput(channelInput);
  if (!normalized) return "";
  if (normalized.startsWith("UC")) return normalized;

  const handle = safeDecode(normalized.startsWith("@") ? normalized.slice(1) : normalized);

  // forHandle로 채널 조회 (1유닛)
  const byHandleParams = new URLSearchParams({
    key: apiKey,
    part: "id",
    forHandle: handle,
  });
  const byHandleRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${byHandleParams.toString()}`,
    { cache: "no-store" }
  );
  if (byHandleRes.ok) {
    const byHandleData = await byHandleRes.json();
    const channelId = byHandleData.items?.[0]?.id;
    if (channelId) return channelId as string;
  }

  // username으로 채널 조회 (1유닛) — search 대신 channels API 사용
  const byUsernameParams = new URLSearchParams({
    key: apiKey,
    part: "id",
    forUsername: handle,
  });
  const byUsernameRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${byUsernameParams.toString()}`,
    { cache: "no-store" }
  );
  if (byUsernameRes.ok) {
    const byUsernameData = await byUsernameRes.json();
    const channelId = byUsernameData.items?.[0]?.id;
    if (channelId) return channelId as string;
  }

  return "";
}

// playlistItems API 사용 — 1유닛/호출 (search는 100유닛/호출)
export async function fetchYoutubeVideos({
  apiKey,
  channelInput,
  maxResults,
  pageToken,
}: FetchYoutubeVideosParams) {
  if (!apiKey || !channelInput) return { items: [] as YoutubeVideo[], nextPageToken: "" };

  const channelId = await resolveChannelId(apiKey, channelInput);
  if (!channelId) return { items: [] as YoutubeVideo[], nextPageToken: "" };

  const playlistId = uploadsPlaylistId(channelId);

  const params = new URLSearchParams({
    key: apiKey,
    playlistId,
    part: "snippet",
    maxResults: String(maxResults),
  });
  if (pageToken) params.append("pageToken", pageToken);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) return { items: [] as YoutubeVideo[], nextPageToken: "" };

  const data = await res.json();
  const items: YoutubeVideo[] = (data.items || [])
    .filter((i: any) => i.snippet?.resourceId?.videoId) // 삭제된 영상 제외
    .map((i: any) => ({
      id: i.snippet.resourceId.videoId,
      title: i.snippet.title,
      thumbnail:
        i.snippet.thumbnails?.high?.url ||
        i.snippet.thumbnails?.medium?.url ||
        i.snippet.thumbnails?.default?.url,
      publishedAt: i.snippet.publishedAt,
    }));

  return {
    items,
    nextPageToken: (data.nextPageToken || "") as string,
  };
}
