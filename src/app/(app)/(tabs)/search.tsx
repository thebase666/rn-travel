import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const clientId = "83f8937c15f44f47a6b51e80e3eebaf5";
  const clientSecret = "f222a87b248a40a9a051111fc107d146";

  useEffect(() => {
    let mounted = true;
    const getToken = async () => {
      try {
        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: `grant_type=client_credentials&client_id=${encodeURIComponent(
            clientId
          )}&client_secret=${encodeURIComponent(clientSecret)}`,
        });
        const text = await res.text();
        if (!res.ok) {
          throw new Error(
            `token 获取失败 ${res.status} ${res.statusText} - ${text}`
          );
        }
        const json = text ? JSON.parse(text) : {};
        if (mounted) setToken(json?.access_token || null);
      } catch (e: any) {
        if (mounted) setError(e?.message || "获取 token 失败");
      }
    };
    getToken();
    return () => {
      mounted = false;
    };
  }, []);

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmed) {
      setResults(null);
      setError(null);
      return;
    }
    if (!token) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          trimmed
        )}&type=track,artist,album&market=US&limit=12`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`搜索失败 ${res.status} ${res.statusText} - ${text}`);
        }
        const json = text ? JSON.parse(text) : null;
        setResults(json);
      } catch (e: any) {
        setError(e?.message || "搜索失败");
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmed, token]);

  const tracks = Array.isArray(results?.tracks?.items)
    ? results.tracks.items
    : [];
  const artists = Array.isArray(results?.artists?.items)
    ? results.artists.items
    : [];
  const albums = Array.isArray(results?.albums?.items)
    ? results.albums.items
    : [];

  return (
    <SafeAreaView>
      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="搜索 歌曲 / 歌手 / 专辑"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 42,
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>

      {!token && (
        <Text style={{ color: "#6B7280", marginBottom: 8 }}>
          正在获取授权 token...
        </Text>
      )}

      {isLoading && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <ActivityIndicator size="small" />
          <Text>搜索中...</Text>
        </View>
      )}

      {!!error && (
        <Text style={{ color: "#DC2626", marginBottom: 8 }}>{error}</Text>
      )}

      {tracks.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            歌曲
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {tracks.map((t: any) => {
              const img = t?.album?.images?.[0]?.url || "";
              return (
                <View
                  key={t?.id || t?.uri}
                  style={{ width: "48%", marginBottom: 12 }}
                >
                  {!!img && (
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: "100%",
                        aspectRatio: 1,
                        borderRadius: 10,
                      }}
                    />
                  )}
                  <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                    {t?.name || "—"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: "#6B7280", fontSize: 12 }}
                  >
                    {Array.isArray(t?.artists)
                      ? t.artists.map((a: any) => a?.name).join(", ")
                      : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {artists.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            歌手
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {artists.map((a: any) => {
              const img = a?.images?.[0]?.url || "";
              return (
                <View
                  key={a?.id || a?.uri}
                  style={{
                    width: "48%",
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  {!!img && (
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        marginBottom: 6,
                      }}
                    />
                  )}
                  <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                    {a?.name || "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {albums.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            专辑
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {albums.map((al: any) => {
              const img = al?.images?.[0]?.url || "";
              return (
                <View
                  key={al?.id || al?.uri}
                  style={{ width: "48%", marginBottom: 12 }}
                >
                  {!!img && (
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: "100%",
                        aspectRatio: 1,
                        borderRadius: 10,
                      }}
                    />
                  )}
                  <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                    {al?.name || "—"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: "#6B7280", fontSize: 12 }}
                  >
                    {Array.isArray(al?.artists)
                      ? al.artists.map((a: any) => a?.name).join(", ")
                      : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {!isLoading &&
        !error &&
        trimmed &&
        tracks.length === 0 &&
        artists.length === 0 &&
        albums.length === 0 && (
          <Text style={{ color: "#6B7280" }}>没有找到相关结果</Text>
        )}
    </SafeAreaView>
  );
};

export default SearchPage;
