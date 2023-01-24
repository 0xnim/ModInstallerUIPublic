module.exports = function override(config, env) {
    console.log("React app rewired works!")
    config.resolve.fallback = {
      fs: require.resolve("browserify-fs"),
      crypto: require.resolve("crypto-browserify"),
      //path: require.resolve("path-browserify")
      levelup: require.resolve("level-js"),
      stream: require.resolve("stream-browserify"),
      _stream_readable: require.resolve("stream-browserify"),
      
    };


    return config;
};