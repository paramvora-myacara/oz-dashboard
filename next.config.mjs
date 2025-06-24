/** @type {import('next').NextConfig} */
export default {
    webpack(config) {
      // ensure leaflet assets
      config.module.rules.push({
        test: /\.(png|jpg|gif|svg)$/,
        type: "asset/resource"
      });
      return config;
    }
  };
  