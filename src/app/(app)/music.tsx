import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";

const MusicPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const soundRef = useRef<Audio.Sound | null>(null);

  const clientId = "83f8937c15f44f47a6b51e80e3eebaf5";
  const clientSecret = "f222a87b248a40a9a051111fc107d146";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!id) throw new Error("缺少歌曲 id");
        setIsLoading(true);
        setError(null);

        // 获取 token
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: `grant_type=client_credentials&client_id=${encodeURIComponent(
            clientId
          )}&client_secret=${encodeURIComponent(clientSecret)}`,
        });
        const tokenText = await tokenRes.text();
        if (!tokenRes.ok) {
          throw new Error(
            `token 失败 ${tokenRes.status} ${tokenRes.statusText} - ${tokenText}`
          );
        }
        const tokenJson = tokenText ? JSON.parse(tokenText) : {};
        const accessToken = tokenJson?.access_token;
        if (!accessToken) throw new Error("未获取到 access_token");

        // 拉取曲目详情
        const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        const text = await res.text();
        if (!res.ok) {
          throw new Error(
            `track 失败 ${res.status} ${res.statusText} - ${text}`
          );
        }
        const json = text ? JSON.parse(text) : null;
        if (!mounted) return;
        setTrack(json);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "未知错误");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      (async () => {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      })();
    };
  }, [id]);

  const play = async () => {
    try {
      if (!track?.preview_url) {
        setError("该曲目无可播放预览音频 preview_url");
        return;
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.preview_url },
        { shouldPlay: true, volume }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((s) => {
        if (!s.isLoaded) return;
        if (s.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e: any) {
      setError(e?.message || "播放失败");
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        }
      }
    } catch (e: any) {}
  };

  const resume = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (e: any) {}
  };

  const setVol = async (v: number) => {
    const next = Math.max(0, Math.min(1, v));
    setVolume(next);
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(next);
      }
    } catch (_) {}
  };

  const name = track?.name || "";
  const image = track?.album?.images?.[0]?.url || "";
  const artists = Array.isArray(track?.artists)
    ? track.artists.map((a: any) => a?.name).join(", ")
    : "";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ color: "#DC2626", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {!!image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 16,
            marginBottom: 16,
          }}
        />
      )}
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
        {name}
      </Text>
      <Text style={{ color: "#6B7280", marginBottom: 16 }}>{artists}</Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        {!isPlaying ? (
          <TouchableOpacity
            onPress={resume}
            style={{
              backgroundColor: "#10B981",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>播放</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={pause}
            style={{
              backgroundColor: "#EF4444",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>暂停</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={play}
          style={{
            backgroundColor: "#3B82F6",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>重新播放</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity
          onPress={() => setVol(volume - 0.1)}
          style={{
            backgroundColor: "#E5E7EB",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text>- 音量</Text>
        </TouchableOpacity>
        <Text style={{ minWidth: 60, textAlign: "center" }}>
          {Math.round(volume * 100)}%
        </Text>
        <TouchableOpacity
          onPress={() => setVol(volume + 0.1)}
          style={{
            backgroundColor: "#E5E7EB",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text>+ 音量</Text>
        </TouchableOpacity>
      </View>

      {!track?.preview_url && (
        <Text style={{ color: "#DC2626", marginTop: 12 }}>
          此曲目不提供 preview_url（无法直接播放）。
        </Text>
      )}
    </View>
  );
};

export default MusicPage;
