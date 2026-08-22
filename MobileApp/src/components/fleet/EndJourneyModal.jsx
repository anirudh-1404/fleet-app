import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EndJourneyModal({
  visible,
  onClose,
  onConfirm,
  startOdometer = 0,
}) {
  const [endOdometerInput, setEndOdometerInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startOdoNum = Number(startOdometer) || 0;

  useEffect(() => {
    if (visible) {
      setEndOdometerInput(startOdoNum > 0 ? String(startOdoNum + 25) : "");
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [visible, startOdoNum]);

  const endOdoNum = Number(endOdometerInput) || 0;
  const distanceTraveled = endOdoNum >= startOdoNum ? endOdoNum - startOdoNum : 0;

  const handleSubmit = async () => {
    if (!endOdometerInput.trim()) {
      setErrorMsg("Please enter the current end odometer reading.");
      return;
    }

    if (endOdoNum < startOdoNum) {
      setErrorMsg(`End odometer must be at least ${startOdoNum.toLocaleString()} KM.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(endOdoNum);
      onClose();
    } catch (e) {
      Alert.alert("Error Ending Journey", e.message || "Failed to end journey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/60 px-5"
      >
        <View className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl">
          {/* Header Section */}
          <View className="flex-row justify-between items-start mb-5">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center mr-3.5 shadow-sm">
                <Ionicons name="flag" size={24} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-slate-900 tracking-tight">
                  End Journey
                </Text>
                <Text className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete today's trip & log reading
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards Row (Start Odometer vs Trip Distance) */}
          <View className="flex-row gap-3 mb-5">
            {/* Start Odometer */}
            <View className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Start Odometer
              </Text>
              <Text className="text-sm font-extrabold text-slate-800 mt-1">
                {startOdoNum.toLocaleString()} KM
              </Text>
            </View>

            {/* Trip Distance */}
            <View className="flex-1 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5">
              <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Trip Distance
              </Text>
              <Text className="text-sm font-extrabold text-emerald-700 mt-1">
                +{distanceTraveled.toLocaleString()} KM
              </Text>
            </View>
          </View>

          {/* End Odometer Input Field */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              End Odometer Reading (KM)
            </Text>
            <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-14 bg-slate-50/80 focus:bg-white focus:border-rose-500">
              <Ionicons name="speedometer-outline" size={22} color="#E11D48" />
              <TextInput
                value={endOdometerInput}
                onChangeText={(val) => {
                  setEndOdometerInput(val.replace(/[^0-9]/g, ""));
                  setErrorMsg("");
                }}
                keyboardType="numeric"
                placeholder="Enter final reading"
                placeholderTextColor="#94A3B8"
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#0F172A",
                  flex: 1,
                  marginLeft: 10,
                  paddingVertical: 0,
                }}
              />
              <View className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                <Text className="text-xs font-bold text-slate-600">KM</Text>
              </View>
            </View>

            {errorMsg ? (
              <View className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={16} color="#E11D48" />
                <Text className="text-xs font-semibold text-[#E11D48] flex-1">{errorMsg}</Text>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
              className="flex-1 h-13 rounded-2xl bg-slate-100 items-center justify-center border border-slate-200/60"
            >
              <Text className="text-sm font-bold text-slate-600">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              className="flex-1 h-13 rounded-2xl bg-[#E11D48] items-center justify-center flex-row gap-1.5 shadow-md shadow-rose-500/25"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                  <Text className="text-sm font-bold text-white">Complete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
