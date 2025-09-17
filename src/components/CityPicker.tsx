import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { City, Country } from "country-state-city";

interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
  isCountry?: boolean; // 新增属性，用于区分城市和国家
  latitude?: number;
  longitude?: number;
}

interface CityPickerProps {
  selectedCity: CityData | null;
  onSelectCity: (city: CityData) => void;
  countryCode: string; // 国家代码，用于获取该国家的城市
  placeholder?: string;
  autoSelect?: boolean;
}

export default function CityPicker({
  selectedCity,
  onSelectCity,
  countryCode,
}: CityPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getAllCities = (): CityData[] => {
    if (!countryCode) return [];

    const cities =
      City.getCitiesOfCountry(countryCode)?.map((city) => ({
        name: city.name,
        stateCode: city.stateCode,
        countryCode: city.countryCode,
        isCountry: false,
        latitude: parseFloat(city.latitude),
        longitude: parseFloat(city.longitude),
      })) || [];

    if (cities.length === 0) {
      // small country , no city
      const city1 = Country.getCountryByCode(countryCode);
      console.log("city1", city1);

      return [
        {
          name: city1.name,
          stateCode: countryCode,
          countryCode: countryCode,
          isCountry: true,
          latitude: parseFloat(city1.latitude),
          longitude: parseFloat(city1.longitude),
        },
      ];
    }

    return cities;
  };

  const cities: CityData[] = getAllCities();

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }
    return cities.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, cities]);

  const handleSelectCity = (city: CityData) => {
    onSelectCity(city);
    setModalVisible(false);
    setSearchQuery("");
  };

  const renderCityItem = ({ item }: { item: CityData }) => (
    <TouchableOpacity
      onPress={() => handleSelectCity(item)}
      className="flex-row items-center py-4 px-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-blue-100">
        <Text className="font-bold text-sm text-green-600">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-gray-800 font-medium text-base">{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!countryCode) {
    return (
      <View>
        <TouchableOpacity
          disabled={true}
          className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between opacity-50"
        >
          <Text className="text-gray-400">Please select a country first</Text>
          <Text className="text-gray-400 text-lg">▼</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {/* City Selector Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          {selectedCity ? (
            <>
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-bold text-sm">
                  {selectedCity.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-gray-800 font-medium">
                {selectedCity.name}
              </Text>
            </>
          ) : (
            <Text className="text-gray-400">Select City</Text>
          )}
        </View>
        <Text className="text-gray-400 text-lg">▼</Text>
      </TouchableOpacity>

      {/* City Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Select City</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery("");
              }}
              className="p-2"
            >
              <Text className="text-blue-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="p-4 border-b border-gray-200">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search cities by name..."
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400"
              autoFocus={true}
            />
            <Text className="text-gray-500 text-xs mt-2 ml-1">
              Tip: Type city name to select
            </Text>
          </View>

          {/* Cities List */}
          <View className="flex-1">
            <FlatList
              data={filteredCities}
              renderItem={renderCityItem}
              keyExtractor={(item) => `${item.name}-${item.stateCode}`}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
