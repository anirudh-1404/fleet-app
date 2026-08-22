module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./src"],
                    extensions: [
                        ".js",
                        ".jsx",
                        ".json",
                        ".ios.js",
                        ".ios.jsx",
                        ".android.js",
                        ".android.jsx",
                    ],
                    alias: {
                        "@assets": "./src/assets",
                        "@components": "./src/components",
                        "@constants": "./src/constants",
                        "@data": "./src/data",
                        "@hooks": "./src/hooks",
                        "@navigation": "./src/navigation",
                        "@screens": "./src/screens",
                        "@services": "./src/services",
                        "@store": "./src/store",
                        "@theme": "./src/theme",
                        "@utils": "./src/utils",
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
