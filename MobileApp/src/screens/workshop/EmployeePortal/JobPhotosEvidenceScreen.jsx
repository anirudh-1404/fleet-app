import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { workshopEmployeeService } from "../../../services/workshopEmployeeService";
import { uploadService, normalizeImageUrl } from "../../../services/uploadService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function JobPhotosEvidenceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [activeTab, setActiveTab] = useState("before"); // 'before' | 'during' | 'after'
  const [photos, setPhotos] = useState({ before: [], during: [], after: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const fetchJobPhotos = async () => {
    try {
      setLoading(true);
      const res = await workshopEmployeeService.getJobDetails(id);
      if (res && res.workOrder && res.workOrder.photos) {
        setPhotos({
          before: res.workOrder.photos.before || [],
          during: res.workOrder.photos.during || [],
          after: res.workOrder.photos.after || [],
        });
      }
    } catch (err) {
      console.error("Error fetching job photos:", err);
      Alert.alert("Error", "Failed to load photos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPhotos();
  }, [id]);

  const handlePickAndUpload = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Camera permission is required to capture evidence.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Gallery permission is required to select photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setUploading(true);

        try {
          // 1. Upload to cloud/local server
          const uploadRes = await uploadService.uploadImage(localUri);
          const uploadedUrl = uploadRes && uploadRes.url ? uploadRes.url : localUri;

          // 2. Link to work order
          await workshopEmployeeService.uploadJobPhotoEvidence(id, {
            type: activeTab,
            url: uploadedUrl,
            caption: caption.trim() || undefined,
          });

          setCaption("");
          await fetchJobPhotos();
          Alert.alert("Uploaded", `Evidence photo added to ${activeTab.toUpperCase()} repair.`);
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          Alert.alert("Error", uploadErr.response?.data?.message || "Failed to upload photo evidence.");
        } finally {
          setUploading(false);
        }
      }
    } catch (err) {
      console.error("Image pick error:", err);
      setUploading(false);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const showSourceDialog = () => {
    Alert.alert(
      "Add Photo Evidence",
      `Select source to attach to ${activeTab.toUpperCase()} repair`,
      [
        { text: "Take Photo (Camera)", onPress: () => handlePickAndUpload(true) },
        { text: "Choose from Gallery", onPress: () => handlePickAndUpload(false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const currentList = photos[activeTab] || [];

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
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
            Photos & Evidence
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500" }}>
            Before, During & After Repairs
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* 3 Repair Stage Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        {[
          { key: "before", label: "Before Repair", count: (photos.before || []).length },
          { key: "during", label: "During Repair", count: (photos.during || []).length },
          { key: "after", label: "After Repair", count: (photos.after || []).length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: isActive ? "#ECFDF5" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#059669" : "#64748B",
                }}
              >
                {tab.label}
              </Text>
              <View
                style={{
                  marginTop: 3,
                  backgroundColor: isActive ? "#059669" : "#E2E8F0",
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    color: isActive ? "#FFFFFF" : "#64748B",
                  }}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {/* Caption & Upload Box */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A", marginBottom: 6 }}>
            Attach {activeTab.toUpperCase()} Evidence:
          </Text>

          <TextInput
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 13,
              color: "#0F172A",
              marginBottom: 10,
            }}
            placeholder="Photo caption (e.g. Cracked brake rotor, fresh oil filter)"
            placeholderTextColor="#94A3B8"
            value={caption}
            onChangeText={setCaption}
          />

          <TouchableOpacity
            disabled={uploading}
            onPress={showSourceDialog}
            style={{
              backgroundColor: "#059669",
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                  Uploading Image...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>
                  Capture / Upload Photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Photos Grid */}
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 10 }}>
          {activeTab === "before"
            ? "Pre-Repair Condition"
            : activeTab === "during"
            ? "Work In Progress Evidence"
            : "Post-Repair Finished Condition"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
        ) : currentList.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <Ionicons name="images-outline" size={42} color="#CBD5E1" style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#64748B" }}>
              No {activeTab} photos yet
            </Text>
            <Text style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4 }}>
              Take or select photos to attach visual proof to this work order.
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {currentList.map((photoItem, index) => {
              const imgUri = normalizeImageUrl(photoItem.url);
              const cardWidth = (SCREEN_WIDTH - 32 - 10) / 2;

              return (
                <TouchableOpacity
                  key={photoItem._id || index}
                  activeOpacity={0.9}
                  onPress={() => setPreviewImage(imgUri)}
                  style={{
                    width: cardWidth,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    marginBottom: 4,
                  }}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={{ width: "100%", height: cardWidth, backgroundColor: "#E2E8F0" }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 8 }}>
                    {photoItem.caption ? (
                      <Text
                        style={{ fontSize: 12, fontWeight: "700", color: "#1E293B", marginBottom: 2 }}
                        numberOfLines={2}
                      >
                        {photoItem.caption}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                        No caption
                      </Text>
                    )}
                    {photoItem.uploadedAt && (
                      <Text style={{ fontSize: 10, color: "#64748B" }}>
                        {new Date(photoItem.uploadedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={{ width: SCREEN_WIDTH - 20, height: SCREEN_WIDTH - 20, borderRadius: 12 }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
