// Minecraft block definitions and textures
export const BLOCK_TYPES = {
  'minecraft:air': {
    name: 'Air (Erase)',
    color: 0x222222,
    transparent: true
  },
  'minecraft:stone': {
    name: 'Stone',
    color: 0x7F7F7F
  },
  'minecraft:grass_block': {
    name: 'Grass Block',
    color: 0x7CBD6B
  },
  'minecraft:dirt': {
    name: 'Dirt',
    color: 0x8B5A3C
  },
  'minecraft:cobblestone': {
    name: 'Cobblestone',
    color: 0x808080
  },
  'minecraft:oak_planks': {
    name: 'Oak Planks',
    color: 0xB5905C
  },
  'minecraft:oak_log': {
    name: 'Oak Log',
    color: 0x6F4E37
  },
  'minecraft:oak_leaves': {
    name: 'Oak Leaves',
    color: 0x48B518,
    transparent: true
  },
  'minecraft:sand': {
    name: 'Sand',
    color: 0xFBF6D1
  },
  'minecraft:gravel': {
    name: 'Gravel',
    color: 0x7E7E7E
  },
  'minecraft:gold_ore': {
    name: 'Gold Ore',
    color: 0xFCEE4B
  },
  'minecraft:iron_ore': {
    name: 'Iron Ore',
    color: 0xD8AF93
  },
  'minecraft:coal_ore': {
    name: 'Coal Ore',
    color: 0x373737
  },
  'minecraft:water': {
    name: 'Water',
    color: 0x5DADE2,
    transparent: true
  },
  'minecraft:lava': {
    name: 'Lava',
    color: 0xFF6B35
  },
  'minecraft:bedrock': {
    name: 'Bedrock',
    color: 0x565656
  },
  'minecraft:glass': {
    name: 'Glass',
    color: 0xFFFFFF,
    transparent: true
  },
  'minecraft:obsidian': {
    name: 'Obsidian',
    color: 0x1A0A2E
  },
  'minecraft:diamond_ore': {
    name: 'Diamond Ore',
    color: 0x5DADE2
  },
  'minecraft:emerald_ore': {
    name: 'Emerald Ore',
    color: 0x50C878
  },
  'minecraft:redstone_ore': {
    name: 'Redstone Ore',
    color: 0xFF0000
  },
  'minecraft:netherrack': {
    name: 'Netherrack',
    color: 0x8B0000
  },
  'minecraft:end_stone': {
    name: 'End Stone',
    color: 0xFFFACD
  }
}

// Common block categories for the palette
export const BLOCK_CATEGORIES = {
  'Building': [
    'minecraft:stone',
    'minecraft:cobblestone',
    'minecraft:oak_planks',
    'minecraft:oak_log',
    'minecraft:glass',
    'minecraft:obsidian'
  ],
  'Natural': [
    'minecraft:air',
    'minecraft:grass_block',
    'minecraft:dirt',
    'minecraft:sand',
    'minecraft:gravel',
    'minecraft:oak_leaves',
    'minecraft:water'
  ],
  'Ores': [
    'minecraft:coal_ore',
    'minecraft:iron_ore',
    'minecraft:gold_ore',
    'minecraft:diamond_ore',
    'minecraft:emerald_ore',
    'minecraft:redstone_ore'
  ],
  'Special': [
    'minecraft:bedrock',
    'minecraft:netherrack',
    'minecraft:end_stone',
    'minecraft:lava'
  ]
}

export function getBlockInfo(blockType) {
  return BLOCK_TYPES[blockType] || BLOCK_TYPES['minecraft:stone']
}

export function getBlockColor(blockType) {
  const blockInfo = getBlockInfo(blockType)
  return blockInfo.color
}

export function isTransparent(blockType) {
  const blockInfo = getBlockInfo(blockType)
  return blockInfo.transparent || false
}

export function getBlockName(blockType) {
  const blockInfo = getBlockInfo(blockType)
  return blockInfo.name || blockType
}
