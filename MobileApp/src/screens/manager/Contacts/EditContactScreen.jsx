import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomInput from "@components/inputs/CustomInput";
import FormSection from "@components/common/FormSection";
import { useFleetData } from "../../../context/FleetDataContext";

export default function EditContactScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { contacts, updateContact } = useFleetData();
  const { contactId } = route.params || {};

  const contact = contacts.find((c) => c.id === contactId) || contacts[0];

  const [name, setName] = useState(contact.name || "");
  const [company, setCompany] = useState(contact.company || "");
  const [role, setRole] = useState(contact.role || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [email, setEmail] = useState(contact.email || "");
  const [address, setAddress] = useState(contact.address || "");
  const [notes, setNotes] = useState(contact.notes || "");

  const handleUpdate = () => {
    updateContact(contact.id, {
      name,
      company,
      role,
      phone,
      email,
      address,
      notes,
    });

    Alert.alert("Contact Updated", "Contact details updated successfully.", [
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
            <Text className="text-2xl font-bold text-[#111827]">Edit Contact</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">{contact.name}</Text>
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
        <FormSection title="Personal & Company Details">
          <CustomInput
            label="Full Name"
            placeholder="e.g. Robert Vance"
            value={name}
            onChangeText={setName}
          />
          <CustomInput
            label="Company Name"
            placeholder="e.g. Vance Logistics"
            value={company}
            onChangeText={setCompany}
          />
          <CustomInput
            label="Role / Title"
            placeholder="e.g. Maintenance Manager"
            value={role}
            onChangeText={setRole}
          />
        </FormSection>

        <FormSection title="Contact Info">
          <CustomInput
            label="Phone Number"
            placeholder="e.g. +61 412 888 777"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <CustomInput
            label="Email Address"
            placeholder="e.g. robert@vance.com.au"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <CustomInput
            label="Address"
            placeholder="e.g. 45 Logistics Blvd, Sydney NSW"
            value={address}
            onChangeText={setAddress}
          />
        </FormSection>

        <FormSection title="Notes">
          <CustomInput
            label="Additional Notes"
            placeholder="Key notes or reference details..."
            value={notes}
            onChangeText={setNotes}
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
          <Text className="text-white text-sm font-semibold">Update Contact</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
