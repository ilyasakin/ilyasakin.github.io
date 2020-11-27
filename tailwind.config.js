module.exports = {
	purge: [],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			fontFamily: {
				'encode-sans': ['Encode Sans Condensed', 'sans-serif'],
			},
		},
	},
	variants: {
		scrollSnapType: ['responsive'],
		extend: {},
	},
	plugins: [require('tailwindcss-scroll-snap')],
};
