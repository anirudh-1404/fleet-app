import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ROUTES from "../../../constants/routes";
import { workshopNoteService } from "../../../services/workshopNoteService";
import WorkshopStateView from "../../../components/workshop/WorkshopStateView";

export default function NoteDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);

  const fetchNote = async () => {
    try {
      setError(null);
      const res = await workshopNoteService.getNoteById(id);
      setNote(res);
    } catch (err) {
      console.error("Error loading note:", err);
      setError(err.response?.data?.message || "Failed to load note");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNote();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNote();
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await workshopNoteService.deleteNote(id);
            Alert.alert("Deleted", "Note deleted successfully");
            navigation.goBack();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Could not delete note");
          }
        },
      },
    ]);
  };

  const vehicle = note?.vehicle;
  const customer = note?.customer;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0 }} edges={["top"]}>
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
            Note Details
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={{ padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <WorkshopStateView loading={true} />
      ) : error && !note ? (
        <WorkshopStateView error={error} onRetry={fetchNote} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <Text style={{ fontSize: 16, color: "#0F172A", lineHeight: 24, marginBottom: 16 }}>
              {note?.noteText}
            </Text>

            <View style={{ borderTopWidth: 1, borderColor: "#F1F5F9", paddingTop: 14, gap: 6 }}>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                Created: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{new Date(note?.date || note?.createdAt).toLocaleDateString()}</Text>
              </Text>
              {vehicle?.registration ? (
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  Vehicle: <Text style={{ fontWeight: "600", color: "#2563EB" }}>{vehicle.make} {vehicle.model} ({vehicle.registration})</Text>
                </Text>
              ) : null}
              {customer?.fullName ? (
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  Customer: <Text style={{ fontWeight: "600", color: "#0F172A" }}>{customer.fullName}</Text>
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
