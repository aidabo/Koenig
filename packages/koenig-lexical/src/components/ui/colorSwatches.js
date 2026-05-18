export const COMMON_COLOR_SWATCHES = [
    {title: 'White', hex: '#ffffff'},
    {title: 'Black', hex: '#000000'},
    {title: 'Grey', hex: '#F0F0F0'},
    {title: 'Red', hex: '#EF4444'},
    {title: 'Orange', hex: '#F97316'},
    {title: 'Yellow', hex: '#FACC15'},
    {title: 'Green', hex: '#22C55E'},
    {title: 'Blue', hex: '#3B82F6'},
    {title: 'Cyan', hex: '#06B6D4'},
    {title: 'Teal', hex: '#14B8A6'},
    {title: 'Purple', hex: '#8B5CF6'},
    {title: 'Pink', hex: '#EC4899'}
];

export function getColorPickerSwatches({includeAccent = true, includeTransparent = true, includeCommon = true} = {}) {
    const swatches = [];

    if (includeCommon) {
        swatches.push(...COMMON_COLOR_SWATCHES);
    }

    if (includeAccent) {
        swatches.push({title: 'Brand color', accent: true});
    }

    if (includeTransparent) {
        swatches.push({title: 'Transparent', transparent: true});
    }

    return swatches;
}
