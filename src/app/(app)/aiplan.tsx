import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";

const AiPlanPage = () => {
  const params = useLocalSearchParams();
  const city = String(params.city || "");
  const budget = params.budget ? Number(params.budget) : null;
  const people = params.people ? Number(params.people) : null;
  const startDate = params.startDate
    ? new Date(params.startDate as string)
    : null;
  const endDate = params.endDate ? new Date(params.endDate as string) : null;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (city && budget && people && startDate && endDate) {
      fetchPlan(city, budget, people, startDate, endDate).catch((error) => {
        console.error("Error parsing data:", error);
        router.back();
      });
    }
    // 👇 空依赖数组，只在初始挂载时运行一次
  }, []);

  const fetchPlan = async (
    city: string,
    budget: number,
    people: number,
    startDate: Date,
    endDate: Date
  ) => {
    if (!city || !budget || !people || !startDate || !endDate) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, budget, people, startDate, endDate }),
      });

      const text = await res.text(); // 先取 text，通用性更强
      if (!res.ok) {
        throw new Error(
          `AI API error ${res.status} ${res.statusText} - ${text}`
        );
      }

      // 尝试把返回的 text 解析成 JSON（有些接口返回 {"message": "md string"}）
      let md = text;
      try {
        const parsed = JSON.parse(text);
        // 如果解析出来是对象且有 message 字段，取 message
        if (parsed && typeof parsed === "object" && parsed.message) {
          md = parsed.message;
        } else if (typeof parsed === "string") {
          md = parsed;
        } else {
          // parsed 是对象但没有 message，则把整个对象转成字符串（可选）
          md = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        // parse 失败，说明返回就是纯文本 markdown，直接使用 text
        md = text;
      }

      // 如果服务器把换行做了双重转义（"\\n"），把它变成真实换行
      md = md.replace(/\\n/g, "\n");

      // 最终确保是字符串再 set
      setContent(String(md));
    } catch (e: any) {
      setError(e?.message || "Failed to get AI plan");
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchPlan = async (
  //   city: string,
  //   budget: number,
  //   people: number,
  //   startDate: Date,
  //   endDate: Date
  // ) => {
  //   if (!city || !budget || !people || !startDate || !endDate) {
  //     setIsLoading(false);
  //     return;
  //   }
  //   try {
  //     const res = await fetch("/api/ai", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ city, budget, people, startDate, endDate }),
  //     });
  //     const data = await res.json();
  //     console.log("data", data);

  //     if (res.ok) {
  //       setContent(data);
  //     } else {
  //       Alert.alert("Error", "Failed to fetch data");
  //     }
  //   } catch (e: any) {
  //     setError(e?.message || "Failed to get AI plan");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  console.log("content", content);
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
        <View className="p-4">
          <View className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-4">
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
                  lineHeight: 26,
                  color: "#374151",
                },
                heading1: {
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginVertical: 12,
                },
                heading2: {
                  fontSize: 22,
                  fontWeight: "600",
                  color: "#2563EB", // 蓝色区分二级标题
                  marginTop: 16,
                  marginBottom: 8,
                },
                heading3: {
                  fontSize: 18,
                  fontWeight: "500",
                  color: "#10B981", // 绿色用于小标题（比如 Day 1）
                  marginTop: 12,
                  marginBottom: 6,
                },
                list_item: {
                  marginBottom: 6,
                  fontSize: 15,
                  lineHeight: 22,
                  color: "#374151",
                },
                strong: {
                  fontWeight: "bold",
                  color: "#111827",
                },
                table: {
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  marginVertical: 12,
                },
                th: {
                  backgroundColor: "#F3F4F6",
                  fontWeight: "bold",
                  padding: 6,
                },
                td: {
                  padding: 6,
                },
              }}
            >
              {content}
            </Markdown>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AiPlanPage;
