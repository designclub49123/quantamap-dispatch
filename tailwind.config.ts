
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Quantum Fleet specific colors
				quantum: {
					50: 'hsl(250, 100%, 97%)',
					100: 'hsl(251, 91%, 95%)',
					200: 'hsl(251, 95%, 88%)',
					300: 'hsl(252, 95%, 78%)',
					400: 'hsl(258, 90%, 66%)',
					500: 'hsl(262, 83%, 58%)',
					600: 'hsl(263, 70%, 50%)',
					700: 'hsl(263, 69%, 42%)',
					800: 'hsl(263, 69%, 35%)',
					900: 'hsl(264, 67%, 30%)',
					950: 'hsl(265, 87%, 20%)'
				},
				fleet: {
					50: 'hsl(217, 100%, 97%)',
					100: 'hsl(215, 96%, 93%)',
					200: 'hsl(215, 94%, 86%)',
					300: 'hsl(215, 94%, 75%)',
					400: 'hsl(215, 91%, 60%)',
					500: 'hsl(217, 91%, 60%)',
					600: 'hsl(221, 83%, 53%)',
					700: 'hsl(224, 76%, 48%)',
					800: 'hsl(226, 71%, 40%)',
					900: 'hsl(224, 64%, 33%)',
					950: 'hsl(226, 55%, 21%)'
				},
				success: {
					50: 'hsl(138, 76%, 97%)',
					100: 'hsl(141, 84%, 93%)',
					200: 'hsl(141, 79%, 85%)',
					300: 'hsl(142, 77%, 73%)',
					400: 'hsl(142, 69%, 58%)',
					500: 'hsl(142, 71%, 45%)',
					600: 'hsl(142, 76%, 36%)',
					700: 'hsl(142, 72%, 29%)',
					800: 'hsl(142, 64%, 24%)',
					900: 'hsl(143, 61%, 20%)',
					950: 'hsl(144, 60%, 12%)'
				},
				warning: {
					50: 'hsl(48, 100%, 96%)',
					100: 'hsl(48, 96%, 89%)',
					200: 'hsl(48, 97%, 77%)',
					300: 'hsl(46, 97%, 65%)',
					400: 'hsl(43, 96%, 56%)',
					500: 'hsl(38, 92%, 50%)',
					600: 'hsl(32, 95%, 44%)',
					700: 'hsl(26, 90%, 37%)',
					800: 'hsl(23, 83%, 31%)',
					900: 'hsl(22, 78%, 26%)',
					950: 'hsl(21, 84%, 15%)'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'quantum-pulse': {
					'0%, 100%': { 
						opacity: '1',
						transform: 'scale(1)' 
					},
					'50%': { 
						opacity: '0.7',
						transform: 'scale(1.05)' 
					}
				},
				'route-draw': {
					'0%': { 
						strokeDasharray: '0 1000',
						opacity: '0.5'
					},
					'100%': { 
						strokeDasharray: '1000 0',
						opacity: '1'
					}
				},
				'marker-bounce': {
					'0%, 20%, 50%, 80%, 100%': {
						transform: 'translateY(0)'
					},
					'40%': {
						transform: 'translateY(-8px)'
					},
					'60%': {
						transform: 'translateY(-4px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'quantum-pulse': 'quantum-pulse 2s ease-in-out infinite',
				'route-draw': 'route-draw 1.5s ease-out forwards',
				'marker-bounce': 'marker-bounce 1s'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			backgroundImage: {
				'quantum-gradient': 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(217, 91%, 60%) 100%)',
				'fleet-gradient': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 71%, 45%) 100%)',
				'success-gradient': 'linear-gradient(135deg, hsl(142, 71%, 45%) 0%, hsl(142, 77%, 73%) 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
