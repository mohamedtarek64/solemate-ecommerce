/**
 * Color mapping utilities for converting between hex codes and color names
 * Used for better API integration and color filtering
 */

// Comprehensive color mapping from hex codes to color names
export const COLOR_MAP = {
  // Basic colors
  '#000000': 'black',
  '#FFFFFF': 'white',
  '#FF0000': 'red',
  '#00FF00': 'green',
  '#0000FF': 'blue',
  '#FFFF00': 'yellow',
  '#FF00FF': 'magenta',
  '#00FFFF': 'cyan',
  
  // Extended colors
  '#FFA500': 'orange',
  '#800080': 'purple',
  '#FFC0CB': 'pink',
  '#A52A2A': 'brown',
  '#808080': 'gray',
  '#C0C0C0': 'silver',
  '#FFD700': 'gold',
  '#008000': 'forest green',
  '#000080': 'navy',
  '#800000': 'maroon',
  '#808080': 'olive',
  '#008080': 'teal',
  
  // Additional common colors
  '#FF4500': 'orange red',
  '#32CD32': 'lime green',
  '#FF1493': 'deep pink',
  '#00CED1': 'dark turquoise',
  '#8B4513': 'saddle brown',
  '#2F4F4F': 'dark slate gray',
  '#DC143C': 'crimson',
  '#4169E1': 'royal blue',
  '#228B22': 'forest green',
  '#DAA520': 'goldenrod',
  '#CD853F': 'peru',
  '#B22222': 'fire brick',
  '#4682B4': 'steel blue',
  '#9370DB': 'medium purple',
  '#20B2AA': 'light sea green'
}

// Reverse mapping from color names to hex codes
export const COLOR_NAME_TO_HEX = Object.fromEntries(
  Object.entries(COLOR_MAP).map(([hex, name]) => [name, hex])
)

/**
 * Convert hex color code to color name
 * @param {string} hexColor - Hex color code (e.g., '#FF0000')
 * @returns {string} Color name (e.g., 'red')
 */
export function getColorNameFromHex(hexColor) {
  if (!hexColor) return ''
  
  const normalizedHex = hexColor.toUpperCase()
  return COLOR_MAP[normalizedHex] || hexColor
}

/**
 * Convert color name to hex color code
 * @param {string} colorName - Color name (e.g., 'red')
 * @returns {string} Hex color code (e.g., '#FF0000')
 */
export function getHexFromColorName(colorName) {
  if (!colorName) return ''
  
  const normalizedName = colorName.toLowerCase()
  return COLOR_NAME_TO_HEX[normalizedName] || colorName
}

/**
 * Get all available colors as an array of objects
 * @returns {Array} Array of color objects with hex, name, and display name
 */
export function getAllColors() {
  return Object.entries(COLOR_MAP).map(([hex, name]) => ({
    hex,
    name,
    displayName: name.charAt(0).toUpperCase() + name.slice(1)
  }))
}

/**
 * Check if a color is similar to another color
 * @param {string} color1 - First color (hex or name)
 * @param {string} color2 - Second color (hex or name)
 * @returns {boolean} True if colors are similar
 */
export function areColorsSimilar(color1, color2) {
  const name1 = color1.startsWith('#') ? getColorNameFromHex(color1) : color1.toLowerCase()
  const name2 = color2.startsWith('#') ? getColorNameFromHex(color2) : color2.toLowerCase()
  
  // Color similarity groups
  const colorGroups = {
    'black': ['black', 'dark', 'charcoal', 'navy', 'midnight'],
    'white': ['white', 'cream', 'ivory', 'pearl', 'snow'],
    'red': ['red', 'crimson', 'scarlet', 'burgundy', 'maroon', 'pink', 'rose'],
    'blue': ['blue', 'navy', 'royal', 'sky', 'azure', 'cyan', 'teal'],
    'green': ['green', 'emerald', 'forest', 'lime', 'mint', 'olive'],
    'yellow': ['yellow', 'gold', 'amber', 'mustard', 'lemon'],
    'purple': ['purple', 'violet', 'lavender', 'plum', 'magenta'],
    'orange': ['orange', 'peach', 'coral', 'apricot', 'tangerine'],
    'brown': ['brown', 'tan', 'beige', 'khaki', 'coffee', 'chocolate'],
    'gray': ['gray', 'grey', 'silver', 'charcoal', 'ash', 'slate'],
    'pink': ['pink', 'rose', 'salmon', 'coral', 'magenta'],
    'cyan': ['cyan', 'turquoise', 'aqua', 'teal', 'mint']
  }
  
  // Find which group each color belongs to
  let group1 = null
  let group2 = null
  
  for (const [groupName, colors] of Object.entries(colorGroups)) {
    if (colors.includes(name1)) group1 = groupName
    if (colors.includes(name2)) group2 = groupName
  }
  
  // Colors are similar if they're in the same group or are exact matches
  return group1 === group2 || name1 === name2
}

/**
 * Get similar colors for a given color
 * @param {string} color - Color (hex or name)
 * @returns {Array} Array of similar color names
 */
export function getSimilarColors(color) {
  const colorName = color.startsWith('#') ? getColorNameFromHex(color) : color.toLowerCase()
  
  const colorGroups = {
    'black': ['black', 'dark', 'charcoal', 'navy', 'midnight'],
    'white': ['white', 'cream', 'ivory', 'pearl', 'snow'],
    'red': ['red', 'crimson', 'scarlet', 'burgundy', 'maroon', 'pink', 'rose'],
    'blue': ['blue', 'navy', 'royal', 'sky', 'azure', 'cyan', 'teal'],
    'green': ['green', 'emerald', 'forest', 'lime', 'mint', 'olive'],
    'yellow': ['yellow', 'gold', 'amber', 'mustard', 'lemon'],
    'purple': ['purple', 'violet', 'lavender', 'plum', 'magenta'],
    'orange': ['orange', 'peach', 'coral', 'apricot', 'tangerine'],
    'brown': ['brown', 'tan', 'beige', 'khaki', 'coffee', 'chocolate'],
    'gray': ['gray', 'grey', 'silver', 'charcoal', 'ash', 'slate'],
    'pink': ['pink', 'rose', 'salmon', 'coral', 'magenta'],
    'cyan': ['cyan', 'turquoise', 'aqua', 'teal', 'mint']
  }
  
  for (const [groupName, colors] of Object.entries(colorGroups)) {
    if (colors.includes(colorName)) {
      return colors
    }
  }
  
  return [colorName]
}

export default {
  COLOR_MAP,
  COLOR_NAME_TO_HEX,
  getColorNameFromHex,
  getHexFromColorName,
  getAllColors,
  areColorsSimilar,
  getSimilarColors
}
