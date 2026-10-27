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
import { useNavigation } from "@react-navigation/native";
import CustomInput from "@components/inputs/CustomInput";
import CustomDropdown from "@components/inputs/CustomDropdown";
import FormSection from "@components/common/FormSection";
import { useFleetData } from "../../../context/FleetDataContext";

const TYPE_OPTIONS = ["Registration", "Service", "Inspection", "Insurance", "Permit"];
const REPEAT_OPTIONS = ["Never", "Daily", "Weekly", "Monthly", "Yearly"];
const STATUS_OPTIONS = ["Normal", "Urgent", "Overdue"];
const VEHICLE_OPTIONS = [
  "Volvo FH16 (ABC-123)",
  "Scania R500 (XYZ-789)",
  "Toyota Hiace (VAN-456)",
  "Ford Ranger (UTE-101)",
  "Mercedes Actros (MQA-707)"
];

export default function AddReminderScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addReminder } = useFleetData();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("Oct 15, 2026");
  const [repeat, setRepeat] = useState("Yearly");
  const [linkedVehicle, setLinkedVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [type, setType] = useState(TYPE_OPTIONS[0]);
  const [status, setStatus] = useState("Normal");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title || !date) {
      Alert.alert("Missing Fields", "Please provide a reminder title and due date.");
      return;
    }

    addReminder({
      title,
      date,
      repeat,
      linkedVehicle,
      type,
      status,
      description,
    });

    Alert.alert("Reminder Created", "Reminder added successfully.", [
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
            <Text className="text-2xl font-bold text-[#111827]">Add Reminder</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Create vehicle or compliance alert</Text>
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
        <FormSection title="Reminder Info">
          <CustomInput
            label="Reminder Title"
            placeholder="e.g. Rego Renewal Alert"
            value={title}
            onChangeText={setTitle}
          />
          <CustomDropdown
            label="Reminder Type"
            options={TYPE_OPTIONS}
            selectedValue={type}
            onSelect={setType}
          />
          <CustomDropdown
            label="Linked Vehicle"
            options={VEHICLE_OPTIONS}
            selectedValue={linkedVehicle}
            onSelect={setLinkedVehicle}
          />
        </FormSection>

        <FormSection title="Timing & Recurrence">
          <CustomInput
            label="Due Date"
            placeholder="e.g. Oct 15, 2026"
            value={date}
            onChangeText={setDate}
          />
          <CustomDropdown
            label="Repeat Schedule"
            options={REPEAT_OPTIONS}
            selectedValue={repeat}
            onSelect={setRepeat}
          />
          <CustomDropdown
            label="Priority Status"
            options={STATUS_OPTIONS}
            selectedValue={status}
            onSelect={setStatus}
          />
        </FormSection>

        <FormSection title="Description">
          <CustomInput
            label="Details & Instructions"
            placeholder="Additional details..."
            value={description}
            onChangeText={setDescription}
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
          onPress={handleSave}
          className="h-12 bg-[#059669] rounded-[24px] items-center justify-center"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-white text-sm font-semibold">Save Reminder</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
