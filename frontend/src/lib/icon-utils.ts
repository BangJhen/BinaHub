/**
 * Icon utility — fetch & cache SVG icons from Heroicons
 * Heroicons: https://heroicons.com/
 * CDN: https://cdn.jsdelivr.net/npm/heroicons@2.1.3/
 * 
 * Icon names: https://github.com/tailwindlabs/heroicons/tree/master/src/24/solid
 */

// Heroicons CDN - using jsdelivr
const HEROICONS_CDN = "https://cdn.jsdelivr.net/npm/heroicons@2.1.3";
const iconCache = new Map<string, string>();

export type IconSize = "16" | "20" | "24" | "32";
export type IconStyle = "solid" | "outline";

/**
 * Fetch SVG icon from Heroicons CDN
 * @param name - Icon name (e.g., "bookmark", "heart", "star")
 * @param size - Icon size: 16, 20, 24, 32 (default: 24)
 * @param style - Icon style: solid or outline (default: solid)
 */
export async function getIcon(
  name: string,
  size: IconSize = "24",
  style: IconStyle = "solid"
): Promise<string> {
  const cacheKey = `${name}-${size}-${style}`;

  // Return from cache if available
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  try {
    // Heroicons path: /{size}/{style}/{name}.svg
    const url = `${HEROICONS_CDN}/${size}/${style}/${name}.svg`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Icon not found: ${name} at ${url}`);
      return ""; // Return empty string if icon not found
    }

    const svg = await response.text();
    iconCache.set(cacheKey, svg);
    return svg;
  } catch (error) {
    console.error(`Failed to fetch icon ${name}:`, error);
    return "";
  }
}

/**
 * Get icon URL directly (for img src or background-image)
 */
export function getIconUrl(
  name: string,
  size: IconSize = "24",
  style: IconStyle = "solid"
): string {
  return `${HEROICONS_CDN}/${size}/${style}/${name}.svg`;
}

/**
 * Available Heroicons (common ones for job matching app)
 * Full list: https://heroicons.com/
 */
export const ICONS = {
  // Bookmarks & saves
  bookmark: "bookmark",
  
  // Actions
  heart: "heart",
  star: "star",
  check: "check",
  xMark: "x-mark",
  trash: "trash",
  
  // Navigation
  magnifyingGlass: "magnifying-glass",
  funnel: "funnel",
  bars3: "bars-3",
  
  // Info
  informationCircle: "information-circle",
  exclamationTriangle: "exclamation-triangle",
  xCircle: "x-circle",
  
  // Location & work
  mapPin: "map-pin",
  briefcase: "briefcase",
  buildingOffice: "building-office-2",
  
  // Money
  currencyDollar: "currency-dollar",
  
  // Time
  clock: "clock",
  calendar: "calendar-days",
  
  // Sparkle
  sparkles: "sparkles",
  target: "target",
} as const;

