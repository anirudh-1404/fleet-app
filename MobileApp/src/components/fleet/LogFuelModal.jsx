import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fuelService } from "../../services/fuelService";
import { vehicleService } from "../../services/vehicleService";

export default function LogFuelModal({ visible, onClose, onSuccess }) {
  const [cost, setCost] = useState("");
  const [litres, setLitres] = useState("");
  const [odometer, setOdometer] = useState("");
  const [vendor, setVendor] = useState("Shell Fleet");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setDate(now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      fetchAssignedVehicle();
    }
  }, [visible]);

  const fetchAssignedVehicle = async () => {
    setIsLoading(true);
    try {
      const vehicle = await vehicleService.getMyVehicle();
      setAssignedVehicle(vehicle);
    } catch (e) {
      console.warn("Could not fetch assigned vehicle for fuel log:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cost || Number(cost) <= 0) {
      Alert.alert("Missing Information", "Please enter valid fuel cost ($).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vehicleId: assignedVehicle ? assignedVehicle._id || assignedVehicle.id : null,
        cost: Number(cost),
        litres: Number(litres) || 0,
        odometer: Number(odometer) || 0,
        vendor,
        date,
        time,
      };

      await fuelService.submitFuelLog(payload);
      Alert.alert("Fuel Log Saved", "Your fuel entry has been recorded successfully.");
      setCost("");
      setLitres("");
      setOdometer("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const msg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to save fuel log. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleName = assignedVehicle
    ? `${assignedVehicle.make || ""} ${assignedVehicle.model || assignedVehicle.vehicleType}`.trim()
    : "Your Vehicle";
  const registration = assignedVehicle ? assignedVehicle.registration : "Auto-detected";

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(17, 24, 39, 0.4)", justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-[28px] p-6 max-h-[85%]">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center pb-4 border-b border-[#E8EDF3] mb-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-[#EEF4FF] items-center justify-center mr-3">
                    <Ionicons name="water-outline" size={20} color="#059669" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-[#111827]">Log Fuel Entry</Text>
                    <Text className="text-xs text-[#6B7280]">Record fuel refill details</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              {isLoading ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              ) : (
                <View className="flex-col gap-4">
                  {/* Assigned Vehicle Auto Display */}
                  <View className="bg-[#F8FAFC] border border-[#E8EDF3] rounded-2xl p-3 flex-row justify-between items-center">
                    <View>
                      <Text className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Assigned Vehicle</Text>
                      <Text className="text-sm font-bold text-[#111827] mt-0.5">{vehicleName}</Text>
                    </View>
                    <View className="bg-[#EEF4FF] px-3 py-1 rounded-full">
                      <Text className="text-xs font-bold text-[#059669]">{registration}</Text>
                    </View>
                  </View>

                  {/* Fuel Cost ($) */}
                  <View>
                    <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      Total Cost ($) *
                    </Text>
                    <View className="flex-row items-center border border-[#E8EDF3] rounded-2xl px-4 h-14 bg-white">
                      <Text className="text-base font-bold text-[#16A34A] mr-2">$</Text>
                      <TextInput
                        value={cost}
                        onChangeText={setCost}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 125.50"
                        placeholderTextColor="#94A3B8"
                        style={{
                          fontSize: 16,
                          height: 56,
                          paddingTop: 0,
                          paddingBottom: 0,
                          marginVertical: 0,
                          textAlignVertical: "center",
                        }}
                        className="flex-1 font-bold text-[#111827]"
                      />
                    </View>
                  </View>

                  {/* Liters & Odometer Row */}
                  <View className="flex-row justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                        Liters Refilled
                      </Text>
                      <View className="flex-row items-center border border-[#E8EDF3] rounded-2xl px-3 h-12 bg-white">
                        <TextInput
                          value={litres}
                          onChangeText={setLitres}
                          keyboardType="numeric"
                          placeholder="e.g. 45"
                          placeholderTextColor="#94A3B8"
                          style={{
                            fontSize: 14,
                            height: 48,
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginVertical: 0,
                            textAlignVertical: "center",
                          }}
                          className="flex-1 font-semibold text-[#111827]"
                        />
                        <Text className="text-xs font-bold text-[#6B7280]">L</Text>
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                        Odometer (KM)
                      </Text>
                      <View className="flex-row items-center border border-[#E8EDF3] rounded-2xl px-3 h-12 bg-white">
                        <TextInput
                          value={odometer}
                          onChangeText={setOdometer}
                          keyboardType="numeric"
                          placeholder="e.g. 245860"
                          placeholderTextColor="#94A3B8"
                          style={{
                            fontSize: 14,
                            height: 48,
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginVertical: 0,
                            textAlignVertical: "center",
                          }}
                          className="flex-1 font-semibold text-[#111827]"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Date & Time Row */}
                  <View className="flex-row justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Date</Text>
                      <View className="border border-[#E8EDF3] rounded-2xl px-3 h-12 bg-[#F8FAFC] justify-center">
                        <Text className="text-xs font-semibold text-[#111827]">{date}</Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Time</Text>
                      <View className="border border-[#E8EDF3] rounded-2xl px-3 h-12 bg-[#F8FAFC] justify-center">
                        <Text className="text-xs font-semibold text-[#111827]">{time}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 pt-2 mt-2">
                    <TouchableOpacity
                      onPress={onClose}
                      className="flex-1 h-12 rounded-full border border-[#E8EDF3] items-center justify-center bg-white"
                    >
                      <Text className="text-sm font-semibold text-[#64748B]">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 h-12 rounded-full items-center justify-center bg-[#059669]"
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-sm font-semibold text-white">Save Fuel Log</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <SafeAreaView edges={["bottom"]} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
