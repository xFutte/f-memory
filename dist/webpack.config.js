var path = require('path');
module.exports = {
	mode: 'production',
	entry: './src/memory.ts',
	optimization: {
		minimize: true,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'memory.js',
		path: path.resolve(__dirname, 'dist'),
	},
};
//# sourceMappingURL=webpack.config.js.map