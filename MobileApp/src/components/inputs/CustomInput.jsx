import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const CustomInput = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    leftIcon,
    error = false,
}) => {
    const [hidePassword, setHidePassword] = useState(secureTextEntry);

    return (
        <View className={`h-14 border rounded-2xl flex-row items-center px-4 bg-white ${error ? "border-[#EF4444]" : "border-gray-200"}`}>
            {leftIcon && (
                <Ionicons
                    name={leftIcon}
                    size={20}
                    color="#64748B"
                    style={{ marginRight: 12 }}
                />
            )}

            <TextInput
                className="flex-1 text-gray-900"
                style={{
                    fontSize: 16.5,
                    height: 56,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingVertical: 0,
                    marginVertical: 0,
                    textAlignVertical: "center",
                    includeFontPadding: false,
                }}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={hidePassword}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />

            {secureTextEntry && (
                <TouchableOpacity
                    onPress={() => setHidePassword(!hidePassword)}
                    className="justify-center items-center h-full pl-2"
                >
                    <Ionicons
                        name={hidePassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#64748B"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default CustomInput;