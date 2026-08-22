import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

export default function NotesScreen() {
  const navigation = useNavigation();
  const { notes } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.linkedVehicle && item.linkedVehicle.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mr-3"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#111827]">Notes</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Operational and maintenance notes</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.ADD_NOTE)}
          className="h-10 px-4 bg-[#2563EB] rounded-full items-center justify-center flex-row"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-5">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, content, or vehicle..."
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.NOTE_DETAILS, { noteId: item.id })}
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-base font-bold text-[#111827] flex-1 mr-2">{item.title}</Text>
              <Text className="text-[10px] font-semibold text-[#6B7280]">{item.date}</Text>
            </View>
            <Text className="text-xs text-[#6B7280] leading-5 mb-3" numberOfLines={3}>
              {item.content}
            </Text>
            <View className="border-t border-[#E8EDF3] pt-3 flex-row justify-between items-center">
              <Text className="text-[10px] text-[#6B7280] font-medium">Author: {item.author || "Michael Johnson"}</Text>
              <View className="bg-[#EFF6FF] rounded-full px-2.5 py-0.5">
                <Text className="text-[9px] font-bold text-[#2563EB]">
                  {item.linkedVehicle || "Volvo FH16"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Notes Found"
            subtitle="There are no operational notes matching your search query."
            icon="document-text-outline"
            actionText="Add New Note"
            onActionPress={() => navigation.navigate(ROUTES.ADD_NOTE)}
          />
        }
      />
    </SafeAreaView>
  );
}
