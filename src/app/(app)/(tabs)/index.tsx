import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import React, { useMemo, useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const IndexPage = () => {
  // 设置默认值
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 8);

  const [city, setCity] = useState("Tokyo");
  const [startDate, setStartDate] = useState<Date | null>(tomorrow);
  const [endDate, setEndDate] = useState<Date | null>(nextWeek);
  const [error, setError] = useState<string | null>(null);
  const [peopleInput, setPeopleInput] = useState("2");
  const [budgetInput, setBudgetInput] = useState("1000");

  const router = useRouter();

  const people = useMemo(() => {
    const n = parseInt(peopleInput || "", 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [peopleInput]);

  const budget = useMemo(() => {
    const v = parseInt(budgetInput || "", 10);
    return Number.isFinite(v) && v > 0 ? v : null;
  }, [budgetInput]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return null;
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return null;
    const d = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
    return d;
  }, [startDate, endDate]);

  const isReady = useMemo(() => {
    return (
      city.trim().length > 0 && !!startDate && !!endDate && !!people && !!budget
    );
  }, [city, startDate, endDate, people, budget]);

  const onReset = () => {
    setCity("");
    setStartDate(new Date());
    setEndDate(new Date());
    setError(null);
    setPeopleInput("");
    setBudgetInput("");
  };

  const onChangeStart = (_: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
    }
  };

  const onChangeEnd = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setEndDate(date);
  };

  const handlePeopleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setPeopleInput(digits);
  };

  const handleBudgetChange = (text: string) => {
    // 只允许输入数字，移除所有非数字字符
    let cleaned = text.replace(/[^0-9]/g, "");
    // 移除前导零，但保留单个0
    cleaned = cleaned.replace(/^0+(\d)/, "$1");
    // 如果输入为空，保持为空字符串
    if (cleaned === "") {
      setBudgetInput("");
    } else {
      setBudgetInput(cleaned);
    }
  };

  const getAiAgent = () => {
    setError(null);
    if (!city.trim()) {
      setError("Please enter a destination city.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before end date.");
      return;
    }
    if (!people) {
      setError("Please enter a valid number of people (>= 1).");
      return;
    }
    if (!budget) {
      setError("Please enter a valid budget (USD > 0).");
      return;
    }

    router.push({
      pathname: "/aiagent",
      params: {
        city: city.trim(),
        budget: String(budget),
        people: String(people),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="airplane" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            AI Trip Planner
          </Text>
          <Text className="text-gray-600 text-center text-base">
            Plan your perfect trip with AI assistance
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-6 mb-6">
          {/* Destination */}
          <View className="mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="location-outline" size={16} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 flex-1">
                Destination
              </Text>
              <TextInput
                placeholder="Enter destination city"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400"
              />
            </View>
          </View>

          {/* Number of People */}
          <View className="mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="people-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 flex-1">
                People
              </Text>
              <TextInput
                placeholder="Number of people"
                value={peopleInput}
                onChangeText={handlePeopleChange}
                keyboardType="number-pad"
                inputMode="numeric"
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400"
              />
            </View>
          </View>

          {/* Budget */}
          <View className="mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={16} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 flex-1">
                Budget(USD)
              </Text>
              <TextInput
                placeholder="Budget (USD)"
                value={budgetInput}
                onChangeText={handleBudgetChange}
                keyboardType="number-pad"
                inputMode="numeric"
                className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400"
              />
            </View>
          </View>

          {/* Travel Dates */}
          <View className="">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={16} color="#F97316" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Dates</Text>
            </View>
            <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-2">Start Date</Text>
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeStart}
                    style={{ alignSelf: "flex-start" }}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-2">End Date</Text>
                  <DateTimePicker
                    value={endDate || startDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={startDate || undefined}
                    onChange={onChangeEnd}
                    style={{ alignSelf: "flex-start" }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {!!error && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text className="text-red-600 text-sm ml-2">{error}</Text>
            </View>
          </View>
        )}

        {/* Ready Status */}
        {isReady && (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <View className="ml-2">
                <Text className="text-base font-semibold text-green-800">
                  Ready to Plan!
                </Text>
                <Text className="text-green-700 text-sm">
                  {city} • {people} people • ${budget} • {days} days
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={getAiAgent}
            disabled={!isReady}
            className={`flex-1 py-4 rounded-2xl items-center shadow-lg ${
              isReady
                ? "bg-blue-500 shadow-blue-200"
                : "bg-gray-400 shadow-gray-200"
            }`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Get AI Travel Plan
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onReset}
            className="px-6 py-4 bg-gray-100 rounded-2xl items-center border border-gray-300"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-semibold text-base ml-2">
                Reset
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IndexPage;
