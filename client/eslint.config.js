// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  { languageOptions: { 
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    } 
  },
  pluginJs.configs.recommended,
  { ...pluginReactConfig, settings: { react: { version: "detect" } } },
  { files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mtsx}"], // Ensure this pattern covers your files
    plugins: {
        'react-hooks': pluginReactHooks,
        'react-refresh': pluginReactRefresh,
        'react': pluginReactConfig.plugins.react, // Make sure react plugin is explicitly available
    },
    rules: {
        ...pluginReactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'warn', 
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_|^audioSystemReady' }], // Ignore _ or audioSystemReady
    }
  }
];