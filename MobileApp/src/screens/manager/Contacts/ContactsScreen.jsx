import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "@constants/routes";
import SearchBar from "@components/fleet/SearchBar";
import EmptyState from "@components/fleet/EmptyState";
import { useFleetData } from "../../../context/FleetDataContext";

export default function ContactsScreen() {
  const navigation = useNavigation();
  const { contacts } = useFleetData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.includes(q))
    );
  }, [contacts, searchQuery]);

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

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
            <Text className="text-2xl font-bold text-[#111827]">Contacts</Text>
            <Text className="text-sm text-[#6B7280] mt-0.5">Fleet and driver contact directory</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.ADD_CONTACT)}
          className="h-10 px-4 bg-[#059669] rounded-full items-center justify-center flex-row"
          style={{
            shadowColor: "#059669",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white text-xs font-semibold ml-1">Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-5">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, role, company, or email..."
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "ios" ? 40 : 24,
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CONTACT_DETAILS, { contactId: item.id })}
            className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-4 flex-row items-center justify-between"
            style={{
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 10,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center flex-1 mr-4">
              <View className="w-11 h-11 rounded-full bg-[#EEF4FF] border border-[#E8EDF3] items-center justify-center mr-3">
                <Ionicons name="person-outline" size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#111827]">{item.name}</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">{item.role || item.company}</Text>
                <Text className="text-xs text-[#6B7280] mt-0.5">{item.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCall(item.phone)}
              className="w-9 h-9 rounded-full bg-[#EEF4FF] items-center justify-center"
            >
              <Ionicons name="call-outline" size={16} color="#059669" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Contacts Found"
            subtitle="There are no contacts matching your search query."
            icon="people-outline"
            actionText="Add New Contact"
            onActionPress={() => navigation.navigate(ROUTES.ADD_CONTACT)}
          />
        }
      />
    </SafeAreaView>
  );
}
