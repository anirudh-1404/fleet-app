import React, { useState } from "react";
import GoogleIcon from "../../assets/icons/google.svg";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

import CustomInput from "../../components/inputs/CustomInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login(emailTrim, password);
      if (data.role === "manager") {
        navigation.reset({
          index: 0,
          routes: [{ name: "ManagerStack" }]
        });
      } else if (data.role === "driver") {
        navigation.reset({
          index: 0,
          routes: [{ name: "DriverStack" }]
        });
      }
    } catch (error) {
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-8 pb-6 justify-between">
            {/* Top Section */}
            <View className="items-center mt-4">
              <View className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center shadow-lg shadow-blue-500/30">
                <Ionicons name="bus-outline" size={32} color="#FFFFFF" />
              </View>

              <Text className="text-3xl font-bold text-gray-900 mt-4">
                Fleet Express
              </Text>

              <Text className="text-[15px] text-gray-500 text-center mt-2 leading-6 px-10">
                Sign in to manage your work effortlessly.
              </Text>
            </View>

            {/* Form Section */}
            <View className="mt-12">
              {/* Email */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <CustomInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  leftIcon="mail-outline"
                />
              </View>

              {/* Password */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <CustomInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  leftIcon="lock-closed-outline"
                />
              </View>

              <TouchableOpacity
                className="self-end mt-2"
                onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
              >
                <Text className="text-sm text-gray-700 font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <View className="mt-8">
                {isSubmitting ? (
                  <View className="h-14 bg-[#2563EB] rounded-2xl items-center justify-center">
                    <ActivityIndicator color="white" />
                  </View>
                ) : (
                  <PrimaryButton title="Sign In" onPress={handleLogin} />
                )}
              </View>

              {/* OR Divider */}
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-px bg-gray-100" />
                <Text className="mx-4 text-xs tracking-widest text-gray-400 font-medium">
                  OR
                </Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Google Sign In */}
              <TouchableOpacity
                activeOpacity={0.8}
                className="h-14 border border-gray-300 rounded-2xl flex-row items-center justify-center"
              >
                <GoogleIcon width={20} height={20} />
                <Text className="ml-3 text-base font-semibold text-gray-800">
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View className="items-center mt-16 mb-6">
              <Text className="text-xs text-gray-500">
                By continuing, you agree to our
              </Text>
              <View className="flex-row items-center mt-2">
                <TouchableOpacity>
                  <Text className="text-xs font-semibold text-gray-700">
                    Terms
                  </Text>
                </TouchableOpacity>
                <Text className="mx-2 text-xs text-gray-400">&</Text>
                <TouchableOpacity>
                  <Text className="text-xs font-semibold text-gray-700">
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}