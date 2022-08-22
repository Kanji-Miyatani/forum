const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // 'development'に設定すると、バンドルファイルに「元のコード」と「変換後のコード」との
    // 対応関係が記述されたコメントが記述されます
    // 'production'に設定すると、コメントは記述されず、最適化されたコードで変換されます
    mode: 'development',
  
    // 最初に実行する変換前のjavascriptファイル
  // 今回はsrcフォルダのindex.tsを指定
    entry: './src/',
    output: {
        path: path.join(__dirname, '/dist/static'), 
        filename: 'main.js' //出力ファイル名
    },
     //デバッグのためのSourceMap（ビルド前後の対応関係を記述したファイル）の出力設定
     devtool: 'inline-source-map',
    module: {
      rules: [
        {
          // 「.ts 」ファイルを変換するよ～
          test: /\.(ts|tsx)$/,
          // ts-loaderを使って変換するよ～
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    //importの際に省略する拡張子をextension:配列で指定
      resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json'] 
      },
      //webpack-dev-serverの設定
      devServer: {
        static: path.join(__dirname, '/dist'), //表示する静的ファイル（HTML）の場所を指定
        open: true, //ブラウザを自動的に起動
        port: 3000 //ポート番号を指定（デフォルトのポート：8080）
    },
  
};