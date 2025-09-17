import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Markdown, { MarkdownIt } from "react-native-markdown-display";

const AiAgentPage = () => {
  const params = useLocalSearchParams();
  const city = String(params.city || "");
  const budget = params.budget ? Number(params.budget) : null;
  const people = params.people ? Number(params.people) : null;
  const startDateIso = String(params.startDate || "");
  const endDateIso = String(params.endDate || "");

  const startDate = useMemo(
    () => (startDateIso ? new Date(startDateIso) : null),
    [startDateIso]
  );
  const endDate = useMemo(
    () => (endDateIso ? new Date(endDateIso) : null),
    [endDateIso]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, budget, people, startDate, endDate }),
        });
        const text = await res.text();
        if (!res.ok) {
          throw new Error(
            `AI API error ${res.status} ${res.statusText} - ${text}`
          );
        }
        const json = text ? JSON.parse(text) : {};
        if (!mounted) return;
        setContent(String(json.message || ""));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to get AI plan");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchPlan();
    return () => {
      mounted = false;
    };
  }, [city, budget, people, startDateIso, endDateIso]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading AI plan...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ color: "#DC2626", textAlign: "center" }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
          AI Travel Plan
        </Text>
        <Markdown
          markdownit={MarkdownIt({ typographer: true }).disable([
            "link",
            "image",
          ])}
        >
          {content || "No content."}
        </Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AiAgentPage;
