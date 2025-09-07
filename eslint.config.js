import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import { ESLint } from "eslint";

export default [
  {
    files: ["**/*.{js,jsx}"], // Áp dụng cho các file JavaScript và JSX
    languageOptions: {
      ecmaVersion: "latest", // Hỗ trợ cú pháp ECMAScript mới nhất
      sourceType: "module", // Sử dụng module (import/export)
      parser: "@babel/eslint-parser", // Sử dụng Babel parser để hỗ trợ JSX
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Kích hoạt hỗ trợ JSX
        },
        requireConfigFile: false, // Không yêu cầu file cấu hình Babel riêng
      },
    },
    plugins: {
      react: require("eslint-plugin-react"), // Plugin React
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Tắt cảnh báo React trong scope (React 17+)
      "react/prop-types": "off", // Tắt kiểm tra prop-types (nếu không cần)
    },
    settings: {
      react: {
        version: "detect", // Tự động phát hiện phiên bản React
      },
    },
  },
];
