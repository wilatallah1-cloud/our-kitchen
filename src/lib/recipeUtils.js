// Parse ingredient quantity for scaling
export function parseIngredient(ingredient) {
  const match = ingredient.match(/^([\d./\s]+)?\s*(.*)$/)
  if (!match) return { quantity: null, rest: ingredient }

  const rawQty = match[1]?.trim()
  const rest = match[2]?.trim() || ''

  if (!rawQty) return { quantity: null, rest: ingredient }

  // Handle fractions like "1/2" or "1 1/2"
  const parts = rawQty.split(/\s+/)
  let quantity = 0
  for (const part of parts) {
    if (part.includes('/')) {
      const [num, den] = part.split('/')
      quantity += Number(num) / Number(den)
    } else {
      quantity += Number(part)
    }
  }

  return { quantity: isNaN(quantity) ? null : quantity, rest }
}

export function scaleIngredient(ingredient, originalServings, newServings) {
  const { quantity, rest } = parseIngredient(ingredient)
  if (quantity === null) return ingredient
  const scaled = (quantity * newServings) / originalServings
  const formatted = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${formatted} ${rest}`
}

// Format minutes to readable time
export function formatTime(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Get total time
export function totalTime(prep, cook) {
  return (prep || 0) + (cook || 0)
}

// Difficulty color classes
export function difficultyColor(difficulty) {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-700'
    case 'Medium': return 'bg-amber-100 text-amber-700'
    case 'Hard': return 'bg-red-100 text-red-700'
    default: return 'bg-stone-100 text-stone-600'
  }
}

// Cookbook theme config
export const cookbookThemes = {
  moms: {
    name: "Mom's Kitchen",
    icon: '🍲',
    tagline: 'Recipes passed down with love',
    collection: 'recipes_moms',
    storageFolder: 'moms',
    bg: 'bg-gradient-to-br from-moms-50 to-orange-50',
    cardBg: 'bg-white border-moms-200',
    accent: 'text-moms-600',
    accentBg: 'bg-moms-600',
    accentHover: 'hover:bg-moms-700',
    accentLight: 'bg-moms-100 text-moms-700',
    buttonBg: 'bg-moms-600 hover:bg-moms-700',
    ring: 'ring-moms-500',
    heroGradient: 'from-moms-700 via-moms-600 to-amber-600',
  },
  bakery: {
    name: "Girlfriend's Bakery",
    icon: '🧁',
    tagline: 'Baked with patience and sugar',
    collection: 'recipes_bakery',
    storageFolder: 'bakery',
    bg: 'bg-gradient-to-br from-bakery-50 to-pink-50',
    cardBg: 'bg-white border-bakery-200',
    accent: 'text-bakery-600',
    accentBg: 'bg-bakery-600',
    accentHover: 'hover:bg-bakery-700',
    accentLight: 'bg-bakery-100 text-bakery-700',
    buttonBg: 'bg-bakery-600 hover:bg-bakery-700',
    ring: 'ring-bakery-500',
    heroGradient: 'from-bakery-700 via-purple-600 to-pink-500',
  },
}

// Unit conversions for baking
export const unitConversions = {
  flour: { cups: 1, grams: 120, oz: 4.25 },
  sugar: { cups: 1, grams: 200, oz: 7.05 },
  butter: { cups: 1, grams: 227, oz: 8 },
  milk: { cups: 1, grams: 244, oz: 8.6 },
  'baking powder': { tsp: 1, grams: 4.6 },
  'baking soda': { tsp: 1, grams: 4.6 },
  salt: { tsp: 1, grams: 6 },
  'vanilla extract': { tsp: 1, grams: 4.2 },
  cocoa: { cups: 1, grams: 86, oz: 3.03 },
  'heavy cream': { cups: 1, grams: 238, oz: 8.4 },
}

// Generate a slug from title
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
