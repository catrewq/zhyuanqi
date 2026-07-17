const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#03b882',
              '@text-color': '#111a34',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
