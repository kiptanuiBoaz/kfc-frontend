// Minimal color variant generator used by the theme system.
// For the purpose of the conversion this returns a simple mapping using the
// provided base color so the theme builds correctly.
export function generateColorVariants(baseColor: string) {
    return {
        lighter: baseColor,
        light: baseColor,
        main: baseColor,
        dark: baseColor,
        darker: baseColor,
    }
}
