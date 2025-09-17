import React, { useMemo } from "react";
import { SafeAreaView, View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";

const DetailPage = () => {
  const params = useLocalSearchParams();
  const title = String(params.title || "Detail");
  const text = String(params.text || "");
  const lat = params.lat ? Number(params.lat) : null;
  const lng = params.lng ? Number(params.lng) : null;

  const region = useMemo(() => {
    if (
      lat != null &&
      lng != null &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // 默认全球视角
    return {
      latitude: 20,
      longitude: 0,
      latitudeDelta: 60,
      longitudeDelta: 60,
    };
  }, [lat, lng]);

  const hasCoord =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          {title}
        </Text>
        <Text style={{ color: "#374151", marginBottom: 12 }}>{text}</Text>

        <View style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
          <MapView style={{ flex: 1 }} initialRegion={region}>
            {hasCoord && (
              <Marker
                coordinate={{
                  latitude: region.latitude,
                  longitude: region.longitude,
                }}
                title={title}
              />
            )}
          </MapView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailPage;
