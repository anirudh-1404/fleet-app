import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomInput from "@components/inputs/CustomInput";
import CustomDropdown from "@components/inputs/CustomDropdown";
import PrimaryButton from "@components/buttons/PrimaryButton";
import VehiclePhotoCard from "./VehiclePhotoCard";

import { driverService } from "../../services/driverService";

const VEHICLE_TYPES = [
  { label: "Truck", value: "Truck" },
  { label: "Car", value: "Car" },
  { label: "Van", value: "Van" },
  { label: "Ute", value: "Ute" }
];

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "In Service", value: "In Service" },
  { label: "Inactive", value: "Inactive" }
];

import * as ImagePicker from "expo-image-picker";
import { uploadService } from "../../services/uploadService";

export default function VehicleForm({
  initialValues = {},
  onSubmit,
  submitButtonText = "Save Vehicle",
  showCancelButton = false,
  onCancel,
  isEdit = false,
  isSubmitting = false
}) {
  const insets = useSafeAreaInsets();

  const [vehicleType, setVehicleType] = useState(initialValues.vehicleType || "Truck");
  const [rego, setRego] = useState(initialValues.registration || initialValues.rego || "");
  const [fleetNumber, setFleetNumber] = useState(initialValues.fleetNumber || "");
  const [make, setMake] = useState(initialValues.make || "");
  const [model, setModel] = useState(initialValues.model || "");
  const [year, setYear] = useState(initialValues.year ? String(initialValues.year) : "");
  const [vin, setVin] = useState(initialValues.vin || "");
  const [status, setStatus] = useState(initialValues.status || "Active");
  const [assignedDriver, setAssignedDriver] = useState(
    initialValues.assignedDriver
      ? typeof initialValues.assignedDriver === "object"
        ? initialValues.assignedDriver._id
        : initialValues.assignedDriver
      : ""
  );
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl || initialValues.photo || "");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      if (initialValues.vehicleType) setVehicleType(initialValues.vehicleType);
      if (initialValues.registration || initialValues.rego) setRego(initialValues.registration || initialValues.rego);
      if (initialValues.fleetNumber) setFleetNumber(initialValues.fleetNumber);
      if (initialValues.make) setMake(initialValues.make);
      if (initialValues.model) setModel(initialValues.model);
      if (initialValues.year) setYear(String(initialValues.year));
      if (initialValues.vin) setVin(initialValues.vin);
      if (initialValues.status) setStatus(initialValues.status);
      if (initialValues.assignedDriver) {
        setAssignedDriver(
          typeof initialValues.assignedDriver === "object"
            ? initialValues.assignedDriver._id
            : initialValues.assignedDriver
        );
      }
      if (initialValues.imageUrl || initialValues.photo) {
        setImageUrl(initialValues.imageUrl || initialValues.photo);
      }
    }
  }, [initialValues?._id, initialValues?.registration, initialValues?.rego]);

  const handleSubmit = () => {
    if (!rego.trim()) {
      Alert.alert("Validation Error", "Registration number is required.");
      return;
    }
    if (!fleetNumber.trim()) {
      Alert.alert("Validation Error", "Fleet number is required.");
      return;
    }

    onSubmit({
      vehicleType,
      rego,
      registration: rego,
      fleetNumber,
      make,
      model,
      year: year ? parseInt(year, 10) : undefined,
      vin,
      status,
      assignedDriver,
      imageUrl,
      photo: imageUrl
    });
  };

  const pickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera/Gallery access is required to attach vehicle photos.");
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            mediaTypes: ["images"]
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            mediaTypes: ["images"]
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setIsUploading(true);
        try {
          const uploadRes = await uploadService.uploadImage(uri);
          if (uploadRes && uploadRes.url) {
            setImageUrl(uploadRes.url);
          } else {
            setImageUrl(uri);
          }
        } catch (e) {
          console.warn("Server upload failed, using local URI fallback:", e.message);
          setImageUrl(uri);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const handlePhotoPress = () => {
    Alert.alert(
      "Vehicle Photo",
      "Choose an option to upload vehicle photo",
      [
        { text: "Take Photo", onPress: () => pickImage(true) },
        { text: "Choose from Gallery", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const [driverList, setDriverList] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await driverService.getDrivers();
        const list = Array.isArray(data) ? data : data?.drivers || data?.data || [];
        setDriverList(list);
      } catch (err) {
        console.warn("Failed to fetch drivers for VehicleForm:", err);
      }
    };
    fetchDrivers();
  }, []);

  const driverOptions = [
    { label: "None / Unassigned", value: "" },
    ...driverList.map((driver) => ({
      label: `${driver.name || driver.fullName || "Driver"}${driver.licenseNumber ? ` (${driver.licenseNumber})` : ""}`,
      value: driver._id || driver.id || driver.name
    }))
  ];

  const handleSave = () => {
    handleSubmit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 32
        }}
      >
        {/* ========================= */}
        {/* 1. Vehicle Classification Section */}
        {/* ========================= */}
        <View
          className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5 mt-2"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">
            Classification & Identifiers
          </Text>

          <CustomDropdown
            label="Vehicle Type"
            selectedValue={vehicleType}
            onValueChange={(val) => {
              setVehicleType(val);
              setErrors((prev) => ({ ...prev, vehicleType: false }));
            }}
            options={VEHICLE_TYPES}
            placeholder="Select vehicle type"
            error={errors.vehicleType}
            leftIcon="car-sport-outline"
          />

          <View className="mb-4">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Registration Number (Rego)
            </Text>
            <CustomInput
              value={rego}
              onChangeText={(text) => {
                setRego(text);
                setErrors((prev) => ({ ...prev, rego: false }));
              }}
              placeholder="ABC-123"
              autoCapitalize="characters"
              leftIcon="card-outline"
              error={errors.rego}
            />
            {errors.rego && (
              <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
                This field is required
              </Text>
            )}
          </View>

          <View className="mb-1">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Fleet Number
            </Text>
            <CustomInput
              value={fleetNumber}
              onChangeText={(text) => {
                setFleetNumber(text);
                setErrors((prev) => ({ ...prev, fleetNumber: false }));
              }}
              placeholder="FLT-021"
              autoCapitalize="characters"
              leftIcon="barcode-outline"
              error={errors.fleetNumber}
            />
            {errors.fleetNumber && (
              <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
                This field is required
              </Text>
            )}
          </View>
        </View>

        {/* ========================= */}
        {/* 2. Specifications Section */}
        {/* ========================= */}
        <View
          className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">
            Vehicle Specifications
          </Text>

          <View className="mb-4">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Make
            </Text>
            <CustomInput
              value={make}
              onChangeText={(text) => {
                setMake(text);
                setErrors((prev) => ({ ...prev, make: false }));
              }}
              placeholder="Volvo"
              autoCapitalize="words"
              leftIcon="construct-outline"
              error={errors.make}
            />
            {errors.make && (
              <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
                This field is required
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Model
            </Text>
            <CustomInput
              value={model}
              onChangeText={(text) => {
                setModel(text);
                setErrors((prev) => ({ ...prev, model: false }));
              }}
              placeholder="FH16"
              autoCapitalize="words"
              leftIcon="options-outline"
              error={errors.model}
            />
            {errors.model && (
              <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
                This field is required
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              Year
            </Text>
            <CustomInput
              value={year.toString()}
              onChangeText={(text) => {
                setYear(text);
                setErrors((prev) => ({ ...prev, year: false }));
              }}
              placeholder="2024"
              keyboardType="numeric"
              leftIcon="calendar-outline"
              error={errors.year}
            />
            {errors.year && (
              <Text className="text-xs text-[#EF4444] font-medium mt-1.5 ml-1">
                This field is required
              </Text>
            )}
          </View>

          <View className="mb-1">
            <Text className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
              VIN (Optional)
            </Text>
            <CustomInput
              value={vin}
              onChangeText={setVin}
              placeholder="Vehicle Identification Number"
              autoCapitalize="characters"
              leftIcon="finger-print-outline"
            />
          </View>
        </View>

        {/* ========================= */}
        {/* 3. Status & Assignment Section */}
        {/* ========================= */}
        <View
          className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mb-5"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Text className="text-sm font-bold text-[#111827] mb-4">
            Status & Assignment
          </Text>

          <CustomDropdown
            label="Status"
            selectedValue={status}
            onValueChange={(val) => {
              setStatus(val);
              setErrors((prev) => ({ ...prev, status: false }));
            }}
            options={STATUS_OPTIONS}
            placeholder="Select status"
            error={errors.status}
            leftIcon="toggle-outline"
          />

          <CustomDropdown
            label="Assigned Driver"
            selectedValue={assignedDriver}
            onValueChange={(val) => {
              setAssignedDriver(val);
              setErrors((prev) => ({ ...prev, assignedDriver: false }));
            }}
            options={driverOptions}
            placeholder="Select driver"
            error={errors.assignedDriver}
            leftIcon="person-outline"
          />
        </View>

        {/* ========================= */}
        {/* 4. Photo Section */}
        {/* ========================= */}
        <VehiclePhotoCard
          imageUrl={imageUrl}
          onPress={handlePhotoPress}
          isEdit={!!initialValues.rego}
        />
      </ScrollView>

      {/* ========================= */}
      {/* 5. Sticky Bottom Actions */}
      {/* ========================= */}
      <View
        className="bg-white border-t border-[#E8EDF3] px-6 pt-4 flex-col gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <PrimaryButton title={submitButtonText} onPress={handleSave} />
        {showCancelButton && (
          <TouchableOpacity
            activeOpacity={0.75}
            className="h-14 border border-[#111827] rounded-2xl bg-white items-center justify-center"
            onPress={onCancel}
          >
            <Text className="text-[#111827] text-base font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
