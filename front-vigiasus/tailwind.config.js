/** @type {import('tailwindcss').Config} */
export const content = [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
];
export const theme = {
    extend: {},

      theme: {
    extend: {
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
      },
      backgroundSize: {
        'dots-size': '1rem 1rem',
      },
    },
  },
}
export const plugins = [];
