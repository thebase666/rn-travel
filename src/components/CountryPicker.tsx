import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Country } from "country-state-city";

interface CountryData {
  code: string;
  name: string;
  flag: string;
}

interface CountryPickerProps {
  selectedCountry: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
}

const flagEmojis: { [key: string]: string } = {
  AF: "🇦🇫",
  AL: "🇦🇱",
  DZ: "🇩🇿",
  AS: "🇦🇸",
  AD: "🇦🇩",
  AO: "🇦🇴",
  AI: "🇦🇮",
  AQ: "🇦🇶",
  AG: "🇦🇬",
  AR: "🇦🇷",
  AM: "🇦🇲",
  AW: "🇦🇼",
  AU: "🇦🇺",
  AT: "🇦🇹",
  AZ: "🇦🇿",
  BS: "🇧🇸",
  BH: "🇧🇭",
  BD: "🇧🇩",
  BB: "🇧🇧",
  BY: "🇧🇾",
  BE: "🇧🇪",
  BZ: "🇧🇿",
  BJ: "🇧🇯",
  BM: "🇧🇲",
  BT: "🇧🇹",
  BO: "🇧🇴",
  BA: "🇧🇦",
  BW: "🇧🇼",
  BV: "🇧🇻",
  BR: "🇧🇷",
  IO: "🇮🇴",
  BN: "🇧🇳",
  BG: "🇧🇬",
  BF: "🇧🇫",
  BI: "🇧🇮",
  KH: "🇰🇭",
  CM: "🇨🇲",
  CA: "🇨🇦",
  CV: "🇨🇻",
  KY: "🇰🇾",
  CF: "🇨🇫",
  TD: "🇹🇩",
  CL: "🇨🇱",
  CN: "🇨🇳",
  CX: "🇨🇽",
  CC: "🇨🇨",
  CO: "🇨🇴",
  KM: "🇰🇲",
  CG: "🇨🇬",
  CD: "🇨🇩",
  CK: "🇨🇰",
  CR: "🇨🇷",
  CI: "🇨🇮",
  HR: "🇭🇷",
  CU: "🇨🇺",
  CY: "🇨🇾",
  CZ: "🇨🇿",
  DK: "🇩🇰",
  DJ: "🇩🇯",
  DM: "🇩🇲",
  DO: "🇩🇴",
  EC: "🇪🇨",
  EG: "🇪🇬",
  SV: "🇸🇻",
  GQ: "🇬🇶",
  ER: "🇪🇷",
  EE: "🇪🇪",
  ET: "🇪🇹",
  FK: "🇫🇰",
  FO: "🇫🇴",
  FJ: "🇫🇯",
  FI: "🇫🇮",
  FR: "🇫🇷",
  GF: "🇬🇫",
  PF: "🇵🇫",
  TF: "🇹🇫",
  GA: "🇬🇦",
  GM: "🇬🇲",
  GE: "🇬🇪",
  DE: "🇩🇪",
  GH: "🇬🇭",
  GI: "🇬🇮",
  GR: "🇬🇷",
  GL: "🇬🇱",
  GD: "🇬🇩",
  GP: "🇬🇵",
  GU: "🇬🇺",
  GT: "🇬🇹",
  GN: "🇬🇳",
  GW: "🇬🇼",
  GY: "🇬🇾",
  HT: "🇭🇹",
  HM: "🇭🇲",
  VA: "🇻🇦",
  HN: "🇭🇳",
  HK: "🇭🇰",
  HU: "🇭🇺",
  IS: "🇮🇸",
  IN: "🇮🇳",
  ID: "🇮🇩",
  IR: "🇮🇷",
  IQ: "🇮🇶",
  IE: "🇮🇪",
  IL: "🇮🇱",
  IT: "🇮🇹",
  JM: "🇯🇲",
  JP: "🇯🇵",
  JO: "🇯🇴",
  KZ: "🇰🇿",
  KE: "🇰🇪",
  KI: "🇰🇮",
  KP: "🇰🇵",
  KR: "🇰🇷",
  KW: "🇰🇼",
  KG: "🇰🇬",
  LA: "🇱🇦",
  LV: "🇱🇻",
  LB: "🇱🇧",
  LS: "🇱🇸",
  LR: "🇱🇷",
  LY: "🇱🇾",
  LI: "🇱🇮",
  LT: "🇱🇹",
  LU: "🇱🇺",
  MO: "🇲🇴",
  MK: "🇲🇰",
  MG: "🇲🇬",
  MW: "🇲🇼",
  MY: "🇲🇾",
  MV: "🇲🇻",
  ML: "🇲🇱",
  MT: "🇲🇹",
  MH: "🇲🇭",
  MQ: "🇲🇶",
  MR: "🇲🇷",
  MU: "🇲🇺",
  YT: "🇾🇹",
  MX: "🇲🇽",
  FM: "🇫🇲",
  MD: "🇲🇩",
  MC: "🇲🇨",
  MN: "🇲🇳",
  MS: "🇲🇸",
  MA: "🇲🇦",
  MZ: "🇲🇿",
  MM: "🇲🇲",
  NA: "🇳🇦",
  NR: "🇳🇷",
  NP: "🇳🇵",
  NL: "🇳🇱",
  NC: "🇳🇨",
  NZ: "🇳🇿",
  NI: "🇳🇮",
  NE: "🇳🇪",
  NG: "🇳🇬",
  NU: "🇳🇺",
  NF: "🇳🇫",
  MP: "🇲🇵",
  NO: "🇳🇴",
  OM: "🇴🇲",
  PK: "🇵🇰",
  PW: "🇵🇼",
  PS: "🇵🇸",
  PA: "🇵🇦",
  PG: "🇵🇬",
  PY: "🇵🇾",
  PE: "🇵🇪",
  PH: "🇵🇭",
  PN: "🇵🇳",
  PL: "🇵🇱",
  PT: "🇵🇹",
  PR: "🇵🇷",
  QA: "🇶🇦",
  RE: "🇷🇪",
  RO: "🇷🇴",
  RU: "🇷🇺",
  RW: "🇷🇼",
  SH: "🇸🇭",
  KN: "🇰🇳",
  LC: "🇱🇨",
  PM: "🇵🇲",
  VC: "🇻🇨",
  WS: "🇼🇸",
  SM: "🇸🇲",
  ST: "🇸🇹",
  SA: "🇸🇦",
  SN: "🇸🇳",
  SC: "🇸🇨",
  SL: "🇸🇱",
  SG: "🇸🇬",
  SK: "🇸🇰",
  SI: "🇸🇮",
  SB: "🇸🇧",
  SO: "🇸🇴",
  ZA: "🇿🇦",
  GS: "🇬🇸",
  ES: "🇪🇸",
  LK: "🇱🇰",
  SD: "🇸🇩",
  SR: "🇸🇷",
  SJ: "🇸🇯",
  SZ: "🇸🇿",
  SE: "🇸🇪",
  CH: "🇨🇭",
  SY: "🇸🇾",
  TW: "🇹🇼",
  TJ: "🇹🇯",
  TZ: "🇹🇿",
  TH: "🇹🇭",
  TL: "🇹🇱",
  TG: "🇹🇬",
  TK: "🇹🇰",
  TO: "🇹🇴",
  TT: "🇹🇹",
  TN: "🇹🇳",
  TR: "🇹🇷",
  TM: "🇹🇲",
  TC: "🇹🇨",
  TV: "🇹🇻",
  UG: "🇺🇬",
  UA: "🇺🇦",
  AE: "🇦🇪",
  GB: "🇬🇧",
  US: "🇺🇸",
  UM: "🇺🇲",
  UY: "🇺🇾",
  UZ: "🇺🇿",
  VU: "🇻🇺",
  VE: "🇻🇪",
  VN: "🇻🇳",
  VG: "🇻🇬",
  VI: "🇻🇮",
  WF: "🇼🇫",
  EH: "🇪🇭",
  YE: "🇾🇪",
  ZM: "🇿🇲",
  ZW: "🇿🇼",
  AX: "🇦🇽",
  BQ: "🇧🇶",
  CW: "🇨🇼",
  GG: "🇬🇬",
  IM: "🇮🇲",
  JE: "🇯🇪",
  ME: "🇲🇪",
  BL: "🇧🇱",
  MF: "🇲🇫",
  RS: "🇷🇸",
  SX: "🇸🇽",
  SS: "🇸🇸",
  XK: "🇽🇰",
};

const getAllCountries = (): CountryData[] => {
  return Country.getAllCountries().map((country) => ({
    code: country.isoCode,
    name: country.name,
    flag: flagEmojis[country.isoCode] || "🏳️",
  }));
};

const countries: CountryData[] = getAllCountries();

// grouped and sorted by first letter
const getGroupedCountries = () => {
  const grouped: { [key: string]: CountryData[] } = {};
  // console.log(grouped, countries);
  countries.forEach((country) => {
    const firstLetter = country.name.charAt(0).toUpperCase();

    if (!grouped[firstLetter]) {
      // grouped[A],
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(country);
  });

  return Object.keys(grouped)
    .sort()
    .map((letter) => ({
      letter,
      countries: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
    }));
};

const groupedCountries = getGroupedCountries();
// console.log(groupedCountries, groupedCountries);

export default function CountryPicker({
  selectedCountry,
  onSelectCountry,
}: // placeholder = "Select Country",
CountryPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredCountries, setFilteredCountries] = useState("");

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countries;
    }
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, countries]);

  const handleSelectCountry = (country: CountryData) => {
    onSelectCountry(country);
    setModalVisible(false);
    setSearchQuery("");
  };

  const renderCountryItem = ({ item }: { item: CountryData }) => (
    <TouchableOpacity
      onPress={() => handleSelectCountry(item)}
      className="flex-row items-center py-4 px-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-gray-800 font-medium text-base">{item.name}</Text>
        <Text className="text-gray-500 text-sm">{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderGroupItem = ({
    item,
  }: {
    item: { letter: string; countries: CountryData[] };
  }) => (
    <View>
      <View className="bg-gray-100 px-4 py-2">
        <Text className="text-gray-700 font-bold text-lg">{item.letter}</Text>
      </View>
      {item.countries.map((country, index) => (
        <TouchableOpacity
          key={`${item.letter}-${index}`}
          onPress={() => handleSelectCountry(country)}
          className="flex-row items-center py-4 px-4 border-b border-gray-100"
          activeOpacity={0.7}
        >
          <Text className="text-2xl mr-3">{country.flag}</Text>
          <View className="flex-1">
            <Text className="text-gray-800 font-medium text-base">
              {country.name}
            </Text>
            <Text className="text-gray-500 text-sm">{country.code}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View>
      {/* Country Selector Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          {selectedCountry ? (
            <>
              <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
              <Text className="text-gray-800 font-medium">
                {selectedCountry.name}
              </Text>
            </>
          ) : (
            <Text className="text-gray-400">Select Country</Text>
          )}
        </View>
        <Text className="text-gray-400 text-lg">▼</Text>
      </TouchableOpacity>

      {/* Country Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        // The onRequestClose callback is called when the user taps the hardware back button on Android or the menu button on Apple TV
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              Select Country
            </Text>
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
              placeholder="Search countries by name or code..."
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              autoFocus={true}
            />

            <Text className="text-gray-500 text-xs mt-2 ml-1">
              Tip: Type the exact country name or code to auto-select
            </Text>
          </View>

          {/* Countries List */}
          <View className="flex-1 relative">
            {searchQuery.trim() ? (
              <FlatList
                data={filteredCountries}
                renderItem={renderCountryItem}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                className="flex-1"
              />
            ) : (
              <FlatList
                data={groupedCountries}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.letter}
                showsVerticalScrollIndicator={false}
                className="flex-1"
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
