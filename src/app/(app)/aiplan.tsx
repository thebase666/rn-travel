import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";

const AiPlanPage = () => {
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

  const router = useRouter();

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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="airplane" size={32} color="white" />
          </View>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 text-lg mt-4">
            Creating your AI travel plan...
          </Text>
          <Text className="text-gray-500 text-sm mt-2">
            This may take a few seconds
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
          </View>
          <Text className="text-red-600 text-lg text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-800">
                AI Travel Plan
              </Text>
              <Text className="text-gray-600">
                {city} • {people} people • ${budget}
              </Text>
            </View>
          </View>
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
            <Ionicons name="sparkles" size={20} color="#3B82F6" />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="map" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Your Travel Itinerary
              </Text>
            </View>

            <Markdown
              markdownit={MarkdownIt({
                typographer: true,
                breaks: true,
                linkify: true,
              }).disable(["link", "image"])}
              style={{
                body: {
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#374151",
                },
                heading1: {
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginTop: 24,
                  marginBottom: 16,
                },
                heading2: {
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginTop: 20,
                  marginBottom: 12,
                },
                heading3: {
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginTop: 16,
                  marginBottom: 8,
                },
                paragraph: {
                  marginBottom: 12,
                  color: "#374151",
                },
                list_item: {
                  marginBottom: 8,
                  color: "#374151",
                },
                strong: {
                  fontWeight: "bold",
                  color: "#1F2937",
                },
                em: {
                  fontStyle: "italic",
                  color: "#6B7280",
                },
                code_inline: {
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontSize: 14,
                  color: "#1F2937",
                },
                blockquote: {
                  backgroundColor: "#F9FAFB",
                  borderLeftWidth: 4,
                  borderLeftColor: "#3B82F6",
                  paddingLeft: 16,
                  paddingVertical: 12,
                  marginVertical: 12,
                  borderRadius: 8,
                },
                hr: {
                  backgroundColor: "#E5E7EB",
                  height: 1,
                  marginVertical: 16,
                },
              }}
            >
              {content || "No content available."}
            </Markdown>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AiPlanPage;
