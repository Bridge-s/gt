const {
    override,
    fixBabelImports,
    // addLessLoader,
} = require("customize-cra");
const rewirePostcss = require('react-app-rewire-postcss');
const px2rem = require('postcss-px2rem')

module.exports = override(
    fixBabelImports("import", {
        libraryName: "antd", libraryDirectory: "es", style: 'css' // change importing css to less
    }),
    (config,env)=>{
        // 重写postcss
        rewirePostcss(config,{
            plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                    autoprefixer: {
                        flexbox: 'no-2009',
                    },
                    stage: 3,
                }),
               //关键:设置px2rem
                px2rem({
                    rootValue:58,
                })
            ],
        });
        return config
    }
);