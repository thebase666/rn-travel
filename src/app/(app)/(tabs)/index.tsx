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
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { useRouter } from "expo-router";

const IndexPage = () => {
  const [city, setCity] = useState("");
  const [submittedCity, setSubmittedCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peopleInput, setPeopleInput] = useState("");
  const [submittedPeople, setSubmittedPeople] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [submittedBudget, setSubmittedBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [aIGuidance, setAIGuidance] = useState("");

  const router = useRouter();

  const people = useMemo(() => {
    const n = parseInt(peopleInput || "", 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [peopleInput]);

  const budget = useMemo(() => {
    const v = parseFloat(budgetInput || "");
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

  const onSubmit = () => {
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
    setSubmittedCity(city.trim());
    setSubmittedPeople(people);
    setSubmittedBudget(Number(budget.toFixed(2)));
  };

  const onReset = () => {
    setCity("");
    setSubmittedCity("");
    setStartDate(null);
    setEndDate(null);
    setError(null);
    setPeopleInput("");
    setSubmittedPeople(null);
    setBudgetInput("");
    setSubmittedBudget(null);
  };

  const onChangeStart = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") setShowStart(false);
    if (date) {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
    }
  };

  const onChangeEnd = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") setShowEnd(false);
    if (date) setEndDate(date);
  };

  const handlePeopleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    setPeopleInput(digits);
  };

  const handleBudgetChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    if (firstDot !== -1) {
      const [intPart, decPart] = cleaned.split(".");
      cleaned =
        intPart.replace(/^0+(\d)/, "$1") + "." + (decPart ?? "").slice(0, 2);
    } else {
      cleaned = cleaned.replace(/^0+(\d)/, "$1");
    }
    setBudgetInput(cleaned);
  };

  const getAiAgent = () => {
    if (!isReady) return;
    router.push({
      pathname: "/aiagent",
      params: {
        city: city.trim(),
        budget: String(budget),
        people: String(people),
        startDate: startDate ? startDate.toISOString() : "",
        endDate: endDate ? endDate.toISOString() : "",
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
          Trip Planner
        </Text>

        <View style={{ marginBottom: 12 }}>
          <TextInput
            placeholder="Enter destination city, e.g., Beijing / Shanghai / Tokyo"
            value={city}
            onChangeText={setCity}
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

        <View style={{ marginBottom: 12 }}>
          <TextInput
            placeholder="Number of people"
            value={peopleInput}
            onChangeText={handlePeopleChange}
            keyboardType="number-pad"
            inputMode="numeric"
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

        <View style={{ marginBottom: 12 }}>
          <TextInput
            placeholder="Budget (USD)"
            value={budgetInput}
            onChangeText={handleBudgetChange}
            keyboardType="decimal-pad"
            inputMode="decimal"
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

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => setShowStart(true)}
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text>
              {startDate
                ? `Start: ${startDate.toDateString()}`
                : "Select start date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!startDate}
            onPress={() => startDate && setShowEnd(true)}
            style={{
              flex: 1,
              backgroundColor: startDate ? "#F3F4F6" : "#E5E7EB",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              opacity: startDate ? 1 : 0.6,
            }}
          >
            <Text>
              {endDate ? `End: ${endDate.toDateString()}` : "Select end date"}
            </Text>
          </TouchableOpacity>
        </View>

        {showStart && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeStart}
          />
        )}

        {showEnd && (
          <DateTimePicker
            value={endDate || startDate || new Date()}
            mode="date"
            display="default"
            minimumDate={startDate || undefined}
            onChange={onChangeEnd}
          />
        )}

        {!!error && (
          <Text style={{ color: "#DC2626", marginBottom: 8 }}>{error}</Text>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!isReady}
            style={{
              flex: 1,
              backgroundColor: isReady ? "#3B82F6" : "#93C5FD",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReset}
            style={{
              width: 100,
              backgroundColor: "#F3F4F6",
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={getAiAgent}
          style={{
            backgroundColor: "#10B981",
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            Get AI Agent
          </Text>
        </TouchableOpacity>

        {(submittedCity ||
          submittedPeople !== null ||
          submittedBudget !== null ||
          startDate ||
          endDate) && (
          <View style={{ marginTop: 12 }}>
            {submittedCity ? (
              <>
                <Text style={{ color: "#6B7280" }}>Your destination city:</Text>
                <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 4 }}>
                  {submittedCity}
                </Text>
              </>
            ) : null}

            {(startDate || endDate) && (
              <>
                <Text style={{ color: "#6B7280", marginTop: 8 }}>
                  Selected travel dates:
                </Text>
                <Text style={{ fontSize: 16, marginTop: 4 }}>
                  {startDate ? startDate.toDateString() : "—"} →{" "}
                  {endDate ? endDate.toDateString() : "—"}
                </Text>
                {days !== null && (
                  <Text style={{ marginTop: 4 }}>{days} day(s)</Text>
                )}
              </>
            )}

            {submittedPeople !== null && (
              <Text style={{ marginTop: 8 }}>People: {submittedPeople}</Text>
            )}

            {submittedBudget !== null && (
              <Text style={{ marginTop: 4 }}>
                Budget: ${submittedBudget.toFixed(2)} USD
              </Text>
            )}
          </View>
        )}

        {aIGuidance !== "" && (
          <Markdown
            markdownit={MarkdownIt({ typographer: true }).disable([
              "link",
              "image",
            ])}
          >
            {aIGuidance}
          </Markdown>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IndexPage;
