/*
 * @Author: Aaron
 * @Date: 2020-05-03 22:01:27
 * @LastEditors: Aaron
 * @LastEditTime: 2020-05-05 19:49:59
 * @Description: file content
 */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "./src/index.html", to: "index.html" },
            {
                from: __dirname + '/css',
                to: __dirname + '/dist/css',
            }
        ]),
    ],
    devServer: { contentBase: path.join(__dirname, "dist"), compress: true },
};