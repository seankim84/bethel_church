import { supabaseAdmin } from "@/lib/supabase";

export async function getSettingsMap(): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("key, value");

  return (data || []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function getYoutubeConfig() {
  const map = await getSettingsMap();
  return {
    channelId: map.youtube_channel_id || "",
    apiKey: map.youtube_api_key || ""
  };
}
