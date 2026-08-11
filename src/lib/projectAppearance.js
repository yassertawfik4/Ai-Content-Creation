import { createElement } from 'react'
import {
  Building2,
  BriefcaseBusiness,
  Camera,
  Coffee,
  Dumbbell,
  Flame,
  Folder,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  Megaphone,
  Music2,
  PenLine,
  Plane,
  Rocket,
  Shirt,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Target,
  Utensils,
} from 'lucide-react'

// The backend project record only stores a name, so the icon and colour a user
// picks live in localStorage keyed by project id.
const STORAGE_KEY = 'aether:project-appearance'

export const PROJECT_ICONS = [
  { id: 'folder', label: 'Folder', Icon: Folder },
  { id: 'megaphone', label: 'Megaphone', Icon: Megaphone },
  { id: 'briefcase', label: 'Briefcase', Icon: BriefcaseBusiness },
  { id: 'rocket', label: 'Rocket', Icon: Rocket },
  { id: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'target', label: 'Target', Icon: Target },
  { id: 'lightbulb', label: 'Lightbulb', Icon: Lightbulb },
  { id: 'shopping-bag', label: 'Shopping bag', Icon: ShoppingBag },
  { id: 'shirt', label: 'Shirt', Icon: Shirt },
  { id: 'stethoscope', label: 'Stethoscope', Icon: Stethoscope },
  { id: 'building', label: 'Building', Icon: Building2 },
  { id: 'globe', label: 'Globe', Icon: Globe2 },
  { id: 'camera', label: 'Camera', Icon: Camera },
  { id: 'music', label: 'Music', Icon: Music2 },
  { id: 'pen', label: 'Pen', Icon: PenLine },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'flame', label: 'Flame', Icon: Flame },
  { id: 'leaf', label: 'Leaf', Icon: Leaf },
  { id: 'coffee', label: 'Coffee', Icon: Coffee },
  { id: 'utensils', label: 'Restaurant', Icon: Utensils },
  { id: 'plane', label: 'Travel', Icon: Plane },
  { id: 'dumbbell', label: 'Fitness', Icon: Dumbbell },
  { id: 'gamepad', label: 'Gaming', Icon: Gamepad2 },
  { id: 'graduation-cap', label: 'Education', Icon: GraduationCap },
]

export const PROJECT_COLORS = [
  '#4f378a',
  '#7c5cbf',
  '#3f6fd8',
  '#1e8fa8',
  '#2f9469',
  '#8a8f2e',
  '#c07c1f',
  '#c2543f',
  '#bd3f74',
  '#6b6577',
]

export const DEFAULT_PROJECT_ICON_ID = PROJECT_ICONS[0].id

export function getProjectIcon(iconId) {
  return (PROJECT_ICONS.find((icon) => icon.id === iconId) ?? PROJECT_ICONS[0]).Icon
}

// Resolving the icon inside a component keeps callers from binding a component
// to a render-scoped variable.
export function ProjectIcon({ iconId, ...props }) {
  return createElement(getProjectIcon(iconId), props)
}

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Storage can be unavailable (private mode, quota). Appearance is cosmetic,
    // so fall back to the deterministic defaults instead of failing the action.
  }
}

// Gives projects created before this feature — and any whose stored appearance
// was cleared — a stable colour instead of all sharing one.
function fallbackColor(projectId) {
  const seed = String(projectId ?? '')
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000
  }
  return PROJECT_COLORS[hash % PROJECT_COLORS.length]
}

export function getProjectAppearance(projectId) {
  const stored = readStore()[projectId]
  return {
    iconId: typeof stored?.iconId === 'string' ? stored.iconId : DEFAULT_PROJECT_ICON_ID,
    color: typeof stored?.color === 'string' ? stored.color : fallbackColor(projectId),
  }
}

export function saveProjectAppearance(projectId, { iconId, color }) {
  if (!projectId) return
  const store = readStore()
  store[projectId] = { iconId, color }
  writeStore(store)
}

export function forgetProjectAppearance(projectId) {
  if (!projectId) return
  const store = readStore()
  if (!(projectId in store)) return
  delete store[projectId]
  writeStore(store)
}
