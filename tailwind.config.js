module.exports = {
	purge: [],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			fontFamily: {
				'encode-sans': ['Encode Sans Condensed', 'sans-serif'],
			},
			colors: {
				gray: {
					950: '#141414',
					1000: '#080808',
				},
			},
		},
	},
	variants: {
		scrollSnapType: ['responsive'],
		extend: {},
	},
	plugins: [require('tailwindcss-scroll-snap')],
};
