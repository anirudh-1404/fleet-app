import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import { useAuth } from "../../../context/AuthContext";
import socketService from "../../../services/socketService";

export default function JobMessagesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, jobNumber } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await workshopEmployeeService.getJobMessages(id);
      setMessages(res || []);
    } catch (err) {
      console.error("Error fetching job messages:", err);
      Alert.alert("Error", "Failed to load team messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup real-time socket listener
    const channelName = `workorder_message:${id}`;
    const handleNewMessage = (newMsg) => {
      setMessages((prev) => {
        // avoid duplicate if already received
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    };

    socketService.connect();
    socketService.on(channelName, handleNewMessage);

    return () => {
      socketService.off(channelName, handleNewMessage);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messagePayload = {
      text: inputText.trim(),
    };

    setSending(true);
    setInputText("");

    try {
      const createdMsg = await workshopEmployeeService.sendJobMessage(id, messagePayload);
      setMessages((prev) => {
        if (prev.some((m) => m._id === createdMsg._id)) return prev;
        return [...prev, createdMsg];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.sender?._id === user?._id || item.sender === user?._id;
    const isManager = item.senderRole === "workshop_manager" || item.sender?.role === "workshop_manager";

    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          maxWidth: "80%",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
            alignSelf: isMe ? "flex-end" : "flex-start",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginRight: 6 }}>
            {isMe ? "You" : item.senderName || item.sender?.name || "Team Member"}
          </Text>
          <View
            style={{
              backgroundColor: isManager ? "#FEF3C7" : "#EFF6FF",
              paddingHorizontal: 6,
              paddingVertical: 1,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: isManager ? "#B45309" : "#2563EB",
              }}
            >
              {isManager ? "Manager" : "Mechanic"}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: isMe ? "#2563EB" : "#FFFFFF",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            borderBottomRightRadius: isMe ? 2 : 14,
            borderBottomLeftRadius: isMe ? 14 : 2,
            borderWidth: isMe ? 0 : 1,
            borderColor: "#E2E8F0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: isMe ? "#FFFFFF" : "#1E293B",
              lineHeight: 20,
            }}
          >
            {item.text}
          </Text>

          <Text
            style={{
              fontSize: 10,
              color: isMe ? "rgba(255,255,255,0.7)" : "#94A3B8",
              alignSelf: "flex-end",
              marginTop: 4,
            }}
          >
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#F1F5F9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
            {jobNumber ? `Job ${jobNumber}` : "Team Messages"}
          </Text>
          <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600" }}>
            ● Workshop Live Channel
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item._id || String(index)}
            renderItem={renderMessageItem}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
                <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#64748B" }}>
                  No messages yet
                </Text>
                <Text style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 4 }}>
                  Start a conversation with the workshop manager or mechanic about this job, parts, or findings.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#F1F5F9",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 14,
              color: "#0F172A",
              maxHeight: 100,
            }}
            placeholder="Type a message or update..."
            placeholderTextColor="#94A3B8"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            disabled={sending || !inputText.trim()}
            onPress={handleSendMessage}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? "#2563EB" : "#CBD5E1",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 8,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
