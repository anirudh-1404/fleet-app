import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopContactService } from "../../../services/workshopContactService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function ContactDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);

  const fetchContact = async () => {
    try {
      setError(null);
      const res = await workshopContactService.getContactById(id);
      setContact(res);
    } catch (err) {
      console.error("Error loading contact details:", err);
      setError(err.response?.data?.message || "Failed to load contact details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContact();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContact();
  };

  const handleDelete = () => {
    Alert.alert("Delete Contact", "Are you sure you want to delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopContactService.deleteContact(id);
            Alert.alert("Deleted", "Contact removed successfully");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete contact");
          }
        },
      },
    ]);
  };

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
            Contact Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !contact ? (
        <WorkshopStateView error={error} onRetry={fetchContact} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A" }}>
                  {contact?.name}
                </Text>
                {contact?.company ? (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#2563EB", marginTop: 2 }}>
                    {contact.company}
                  </Text>
                ) : null}
              </View>

              <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#1D4ED8" }}>
                  {contact?.type}
                </Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 14, gap: 10 }}>
              {contact?.phone ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call-outline" size={16} color="#64748B" />
                  <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10, fontWeight: "500" }}>
                    {contact.phone}
                  </Text>
                </View>
              ) : null}

              {contact?.email ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="mail-outline" size={16} color="#64748B" />
                  <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10 }}>
                    {contact.email}
                  </Text>
                </View>
              ) : null}

              {contact?.address ? (
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Ionicons name="location-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 14, color: "#334155", marginLeft: 10, flex: 1 }}>
                    {contact.address}
                  </Text>
                </View>
              ) : null}
            </View>

            {contact?.notes ? (
              <View style={{ backgroundColor: "#F8FAFC", borderRadius: 8, padding: 12, marginTop: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>NOTES</Text>
                <Text style={{ fontSize: 13, color: "#334155" }}>{contact.notes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
