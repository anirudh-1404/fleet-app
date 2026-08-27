import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomInput from "@components/inputs/CustomInput";
import CustomDropdown from "@components/inputs/CustomDropdown";
import FormSection from "@components/common/FormSection";
import { useFleetData } from "../../../context/FleetDataContext";

const VEHICLE_OPTIONS = [
  "Volvo FH16 (ABC-123)",
  "Scania R500 (XYZ-789)",
  "Toyota Hiace (VAN-456)",
  "Ford Ranger (UTE-101)",
  "Mercedes Actros (MQA-707)",
  "General Fleet (Unlinked)"
];

export default function EditNoteScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { notes, updateNote } = useFleetData();
  const { noteId } = route.params || {};

  const note = notes.find((n) => n.id === noteId) || notes[0];

  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [linkedVehicle, setLinkedVehicle] = useState(note.linkedVehicle || VEHICLE_OPTIONS[0]);

  const handleUpdate = () => {
    updateNote(note.id, {
      title,
      content,
      linkedVehicle,
    });

    Alert.alert("Note Updated", "Operational note updated successfully.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]" edges={["top"]}>
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
            <Text className="text-2xl font-bold text-[#111827]">Edit Note</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">{note.title}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
        }}
      >
        <FormSection title="Header & Vehicle Linkage">
          <CustomInput
            label="Note Title"
            placeholder="e.g. Tyre Rotation Reminder"
            value={title}
            onChangeText={setTitle}
          />
          <CustomDropdown
            label="Linked Vehicle"
            options={VEHICLE_OPTIONS}
            selectedValue={linkedVehicle}
            onSelect={setLinkedVehicle}
          />
        </FormSection>

        <FormSection title="Note Body">
          <CustomInput
            label="Content / Details"
            placeholder="Write detailed operational notes..."
            value={content}
            onChangeText={setContent}
            multiline
          />
        </FormSection>
      </ScrollView>

      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleUpdate}
          className="h-12 bg-[#2563EB] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Update Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
