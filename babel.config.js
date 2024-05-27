module.exports = (api) => {
  const env = api.env();
  api.cache.using(() => env === "development");

  return {
    presets: [
      "@babel/preset-env",
      [
        "@babel/preset-typescript",
        {
          onlyRemoveTypeImports: true,
        },
      ],
      ["@babel/preset-react"],
    ],
    plugins: [
      "@babel/plugin-transform-runtime",
      "@babel/plugin-proposal-class-properties",
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "automatic",
        },
      ],
    ],
    env: {
      esm: {
        presets: [
          [
            "@babel/preset-env",
            {
              modules: false,
            },
          ],
        ],
        plugins: [
          [
            "@babel/plugin-transform-runtime",
            {
              useESModules: true,
            },
          ],
        ],
      },
      umd: {
        presets: [
          "@babel/preset-react",
          [
            "@babel/preset-env",
            {
              targets: {
                android: "4.4",
                ios: "9",
              },
              useBuiltIns: "usage",
              corejs: 3,
            },
          ],
        ],
        plugins: [["@babel/plugin-transform-runtime", { corejs: 3 }]],
      },
      cjs: {
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "current",
              },
              modules: "commonjs",
              useBuiltIns: "usage",
              corejs: 3,
            },
          ],
          "@babel/preset-react",
        ],
        plugins: [["@babel/plugin-transform-runtime", { corejs: 3 }]],
      },
    },
    ignore: ["**/*.test.ts", "**/*.test.tsx"],
  };
};
