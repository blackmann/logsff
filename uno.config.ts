import { presetForms } from "@julr/unocss-preset-forms";
import {
	defineConfig,
	presetIcons,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	content: {
		filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
	},
	presets: [presetWind3({ dark: "media" }), presetIcons(), presetForms()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
