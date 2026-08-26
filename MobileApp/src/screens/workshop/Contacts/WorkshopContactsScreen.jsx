import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopContactService } from "../../../services/workshopContactService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

const CONTACT_TYPES = ["ALL", "Mechanic", "Vendor", "Supplier", "Other"];

export default function WorkshopContactsScreen() {
  const navigation = useNavigation();

  const [selectedType, setSelectedType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      setError(null);
      const filters = {};
      if (selectedType !== "ALL") filters.type = selectedType;
      if (search) filters.search = search;

      const data = await workshopContactService.getContacts(filters);
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [selectedType, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContacts();
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(ROUTES.WORKSHOP_CONTACT_DETAILS, { id: item._id })}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
            {item.name}
          </Text>
          {item.company ? (
            <Text style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
              {item.company}
            </Text>
          ) : null}
        </View>

        <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
            {item.type}
          </Text>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 10, marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Text style={{ fontSize: 13, color: "#475569", marginLeft: 6 }}>
            {item.phone || "No phone"}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: "#94A3B8" }}>
          {item.email || ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
            Workshop Contacts
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.ADD_WORKSHOP_CONTACT)}
          style={{
            backgroundColor: "#2563EB",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <View style={{ paddingVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CONTACT_TYPES.map((t) => {
            const isSelected = selectedType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setSelectedType(t)}
                style={{
                  backgroundColor: isSelected ? "#2563EB" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: isSelected ? "#2563EB" : "#E2E8F0",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: isSelected ? "#FFFFFF" : "#475569" }}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#CBD5E1",
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search mechanics, vendors, suppliers..."
            placeholderTextColor="#94A3B8"
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: "#0F172A",
            }}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && contacts.length === 0 ? (
        <WorkshopStateView error={error} onRetry={fetchContacts} />
      ) : contacts.length === 0 ? (
        <WorkshopStateView
          empty={true}
          icon="call-outline"
          emptyTitle="No Contacts Found"
          emptySubtitle="Add mechanics, suppliers, or parts vendors."
          emptyActionLabel="Add Contact"
          onEmptyAction={() => navigation.navigate(ROUTES.ADD_WORKSHOP_CONTACT)}
        />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={renderContactItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
