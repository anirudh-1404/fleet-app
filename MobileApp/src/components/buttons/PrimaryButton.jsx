import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from "react-native";

const PrimaryButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    style = "",
    textStyle = "",
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled || loading}
            onPress={onPress}
            className={`
        h-14
        rounded-2xl
        bg-black
        items-center
        justify-center
        ${disabled ? "opacity-50" : ""}
        ${style}
      `}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text
                    className={`text-white text-base font-semibold ${textStyle}`}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default PrimaryButton;