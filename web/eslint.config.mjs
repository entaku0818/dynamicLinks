import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.ts",
    ],
  },
  ...nextCoreWebVitals,
];

export default config;
