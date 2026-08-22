import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import InfoCard from "@components/common/InfoCard";
import DetailRow from "@components/common/DetailRow";
import { useFleetData } from "../../../context/FleetDataContext";

export default function ContactDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { contacts, deleteContact } = useFleetData();
  const { contactId } = route.params || {};

  const contact = contacts.find((c) => c.id === contactId) || contacts[0];

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Contact", "Are you sure you want to remove this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteContact(contact.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!contact) {
    return (
      <SafeAreaView className="flex-1 bg-[#F5F7FA] justify-center items-center">
        <Text className="text-base text-[#6B7280]">Contact not found.</Text>
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
            <Text className="text-xl font-bold text-[#111827]">{contact.name}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{contact.role || contact.company || "Fleet Contact"}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.EDIT_CONTACT, { contactId: contact.id })}
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
        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-5">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCall}
            className="flex-1 bg-[#2563EB] h-12 rounded-[24px] flex-row items-center justify-center"
          >
            <Ionicons name="call-outline" size={18} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Call Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEmail}
            className="flex-1 bg-white border border-[#E8EDF3] h-12 rounded-[24px] flex-row items-center justify-center"
          >
            <Ionicons name="mail-outline" size={18} color="#2563EB" />
            <Text className="text-[#2563EB] text-sm font-semibold ml-2">Send Email</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info Card */}
        <InfoCard title="Contact Profile" icon="person-outline">
          <DetailRow label="Full Name" value={contact.name} />
          <DetailRow label="Company / Org" value={contact.company || "TransLogistics Corp"} />
          <DetailRow label="Role / Relationship" value={contact.role || "Vendor"} />
          <DetailRow label="Phone Number" value={contact.phone} valueColor="text-[#2563EB]" />
          <DetailRow label="Email Address" value={contact.email} valueColor="text-[#2563EB]" />
          <DetailRow label="Physical Address" value={contact.address || "100 Transport Way, Sydney NSW 2000"} />
        </InfoCard>

        {/* Notes */}
        <InfoCard title="Notes & Comments" icon="document-text-outline">
          <Text className="text-xs text-[#4B5563] leading-5">{contact.notes || "No contact notes recorded."}</Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}
