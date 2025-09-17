import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    pressure_msl: number;
    cloud_cover: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    sunrise: string[];
    sunset: string[];
    weather_code: number[];
  };
}

interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
  weatherData: WeatherData | null;
  cityName: string;
  countryName: string;
}

const { width } = Dimensions.get("window");

// 天气代码到图标的映射
const getWeatherIcon = (code: number, isDay: number = 1) => {
  if (isDay === 0) return "🌙"; // 夜晚

  if (code === 0) return "☀️"; // 晴天
  if (code >= 1 && code <= 3) return "🌤️"; // 多云
  if (code >= 45 && code <= 48) return "🌫️"; // 雾
  if (code >= 51 && code <= 55) return "🌧️"; // 小雨
  if (code >= 56 && code <= 57) return "🌨️"; // 雨夹雪
  if (code >= 61 && code <= 65) return "🌧️"; // 雨
  if (code >= 66 && code <= 67) return "🌨️"; // 雨夹雪
  if (code >= 71 && code <= 75) return "❄️"; // 雪
  if (code >= 77 && code <= 77) return "❄️"; // 雪粒
  if (code >= 80 && code <= 82) return "🌧️"; // 阵雨
  if (code >= 85 && code <= 86) return "🌨️"; // 阵雪
  if (code >= 95 && code <= 95) return "⛈️"; // 雷暴
  if (code >= 96 && code <= 99) return "⛈️"; // 雷暴冰雹

  return "🌤️"; // 默认
};

export default function WeatherModal({
  visible,
  onClose,
  weatherData,
  cityName,
  countryName,
}: WeatherModalProps) {
  if (!weatherData) return null;

  const current = weatherData.current;
  const daily = weatherData.daily;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
        />

        <View className="bg-white rounded-t-3xl min-h-[50%]">
          {/* 拖拽指示器 */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="px-6 pb-6">
            {/* 测试内容 */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {cityName}
              </Text>
              <Text className="text-gray-600 text-base">{countryName}</Text>
            </View>

            {/* 简化的天气显示 */}
            <View className="bg-blue-500 rounded-3xl p-6 mb-6">
              <Text className="text-white text-4xl font-bold text-center">
                {Math.round(current.temperature_2m)}°
              </Text>
              <Text className="text-white text-center mt-2">
                {getWeatherIcon(current.weather_code, current.is_day)}
              </Text>
            </View>

            {/* 关闭按钮 */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-200 rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
