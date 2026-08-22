import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import InfoCard from "@components/common/InfoCard";
import DetailRow from "@components/common/DetailRow";
import { useFleetData } from "../../../context/FleetDataContext";

export default function NoteDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { notes, deleteNote } = useFleetData();
  const { noteId } = route.params || {};

  const note = notes.find((n) => n.id === noteId) || notes[0];

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this operational note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote(note.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Note not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-2">
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
            <Text className="text-xl font-bold text-[#111827]">{note.title}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">Created on {note.date}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_NOTE, { noteId: note.id })}
          className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] items-center justify-center mr-2"
        >
          <Ionicons name="create-outline" size={18} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDelete}
          className="w-10 h-10 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        <InfoCard title="Note Overview" icon="document-text-outline">
          <DetailRow label="Note Title" value={note.title} />
          <DetailRow label="Author" value={note.author || "Michael Johnson"} />
          <DetailRow label="Date Logged" value={note.date} />
          <DetailRow label="Linked Vehicle" value={note.linkedVehicle || note.vehicleName || "Volvo FH16 (ABC-123)"} valueColor="text-[#2563EB]" />
        </InfoCard>

        <InfoCard title="Note Content" icon="chatbubble-ellipses-outline">
          <Text className="text-xs text-[#374151] leading-6">
            {note.content || "No details recorded."}
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
