// Minecraft block definitions and textures
export const BLOCK_TYPES = {
  'minecraft:air': {
    id: 0,
    name: 'Air (Erase)',
    color: 0x222222,
    transparent: true,
    category: 'utility'
  },
  'minecraft:stone': {
    id: 1,
    name: 'Stone',
    color: 0x7F7F7F,
    category: 'building'
  },
  'minecraft:granite': {
    id: 1,
    name: 'Granite',
    color: 0x9D5D52,
    category: 'building'
  },
  'minecraft:polished_granite': {
    id: 1,
    name: 'Polished Granite',
    color: 0xB1695A,
    category: 'building'
  },
  'minecraft:diorite': {
    id: 1,
    name: 'Diorite',
    color: 0xBFBFBF,
    category: 'building'
  },
  'minecraft:polished_diorite': {
    id: 1,
    name: 'Polished Diorite',
    color: 0xD0D0D0,
    category: 'building'
  },
  'minecraft:andesite': {
    id: 1,
    name: 'Andesite',
    color: 0x8D8B89,
    category: 'building'
  },
  'minecraft:polished_andesite': {
    id: 1,
    name: 'Polished Andesite',
    color: 0x999995,
    category: 'building'
  },
  'minecraft:grass_block': {
    id: 2,
    name: 'Grass Block',
    color: 0x7CBD6B,
    category: 'natural'
  },
  'minecraft:dirt': {
    id: 3,
    name: 'Dirt',
    color: 0x8B5A3C,
    category: 'natural'
  },
  'minecraft:coarse_dirt': {
    id: 3,
    name: 'Coarse Dirt',
    color: 0x6F4A2F,
    category: 'natural'
  },
  'minecraft:podzol': {
    id: 3,
    name: 'Podzol',
    color: 0x5A3C1C,
    category: 'natural'
  },
  'minecraft:cobblestone': {
    id: 4,
    name: 'Cobblestone',
    color: 0x808080,
    category: 'building'
  },
  'minecraft:oak_planks': {
    id: 5,
    name: 'Oak Planks',
    color: 0xB5905C,
    category: 'building'
  },
  'minecraft:spruce_planks': {
    id: 5,
    name: 'Spruce Planks',
    color: 0x8B5A2B,
    category: 'building'
  },
  'minecraft:birch_planks': {
    id: 5,
    name: 'Birch Planks',
    color: 0xD7C185,
    category: 'building'
  },
  'minecraft:jungle_planks': {
    id: 5,
    name: 'Jungle Planks',
    color: 0xB8860B,
    category: 'building'
  },
  'minecraft:acacia_planks': {
    id: 5,
    name: 'Acacia Planks',
    color: 0xCD853F,
    category: 'building'
  },
  'minecraft:dark_oak_planks': {
    id: 5,
    name: 'Dark Oak Planks',
    color: 0x654321,
    category: 'building'
  },
  'minecraft:bedrock': {
    id: 7,
    name: 'Bedrock',
    color: 0x565656,
    category: 'special'
  },
  'minecraft:water': {
    id: 9,
    name: 'Water',
    color: 0x5DADE2,
    transparent: true,
    category: 'natural'
  },
  'minecraft:lava': {
    id: 11,
    name: 'Lava',
    color: 0xFF6B35,
    category: 'natural'
  },
  'minecraft:sand': {
    id: 12,
    name: 'Sand',
    color: 0xFBF6D1,
    category: 'natural'
  },
  'minecraft:red_sand': {
    id: 12,
    name: 'Red Sand',
    color: 0xC45D33,
    category: 'natural'
  },
  'minecraft:gravel': {
    id: 13,
    name: 'Gravel',
    color: 0x7E7E7E,
    category: 'natural'
  },
  'minecraft:gold_ore': {
    id: 14,
    name: 'Gold Ore',
    color: 0xFCEE4B,
    category: 'ores'
  },
  'minecraft:iron_ore': {
    id: 15,
    name: 'Iron Ore',
    color: 0xD8AF93,
    category: 'ores'
  },
  'minecraft:coal_ore': {
    id: 16,
    name: 'Coal Ore',
    color: 0x373737,
    category: 'ores'
  },
  'minecraft:oak_log': {
    id: 17,
    name: 'Oak Log',
    color: 0x6F4E37,
    category: 'natural'
  },
  'minecraft:spruce_log': {
    id: 17,
    name: 'Spruce Log',
    color: 0x5D4037,
    category: 'natural'
  },
  'minecraft:birch_log': {
    id: 17,
    name: 'Birch Log',
    color: 0xF5F5DC,
    category: 'natural'
  },
  'minecraft:jungle_log': {
    id: 17,
    name: 'Jungle Log',
    color: 0x8B4513,
    category: 'natural'
  },
  'minecraft:oak_leaves': {
    id: 18,
    name: 'Oak Leaves',
    color: 0x48B518,
    transparent: true,
    category: 'natural'
  },
  'minecraft:spruce_leaves': {
    id: 18,
    name: 'Spruce Leaves',
    color: 0x2E7D32,
    transparent: true,
    category: 'natural'
  },
  'minecraft:birch_leaves': {
    id: 18,
    name: 'Birch Leaves',
    color: 0x7CB342,
    transparent: true,
    category: 'natural'
  },
  'minecraft:jungle_leaves': {
    id: 18,
    name: 'Jungle Leaves',
    color: 0x4CAF50,
    transparent: true,
    category: 'natural'
  },
  'minecraft:sponge': {
    id: 19,
    name: 'Sponge',
    color: 0xFFEB3B,
    category: 'utility'
  },
  'minecraft:wet_sponge': {
    id: 19,
    name: 'Wet Sponge',
    color: 0xFFC107,
    category: 'utility'
  },
  'minecraft:glass': {
    id: 20,
    name: 'Glass',
    color: 0xFFFFFF,
    transparent: true,
    category: 'building'
  },
  'minecraft:lapis_ore': {
    id: 21,
    name: 'Lapis Lazuli Ore',
    color: 0x2196F3,
    category: 'ores'
  },
  'minecraft:lapis_block': {
    id: 22,
    name: 'Lapis Lazuli Block',
    color: 0x1976D2,
    category: 'building'
  },
  'minecraft:sandstone': {
    id: 24,
    name: 'Sandstone',
    color: 0xF4E4BC,
    category: 'building'
  },
  'minecraft:chiseled_sandstone': {
    id: 24,
    name: 'Chiseled Sandstone',
    color: 0xE6D7B3,
    category: 'building'
  },
  'minecraft:smooth_sandstone': {
    id: 24,
    name: 'Smooth Sandstone',
    color: 0xF8F1C9,
    category: 'building'
  },
  'minecraft:white_wool': {
    id: 35,
    name: 'White Wool',
    color: 0xFFFFFF,
    category: 'wool'
  },
  'minecraft:orange_wool': {
    id: 35,
    name: 'Orange Wool',
    color: 0xFF5722,
    category: 'wool'
  },
  'minecraft:magenta_wool': {
    id: 35,
    name: 'Magenta Wool',
    color: 0xE91E63,
    category: 'wool'
  },
  'minecraft:light_blue_wool': {
    id: 35,
    name: 'Light Blue Wool',
    color: 0x03A9F4,
    category: 'wool'
  },
  'minecraft:yellow_wool': {
    id: 35,
    name: 'Yellow Wool',
    color: 0xFFEB3B,
    category: 'wool'
  },
  'minecraft:lime_wool': {
    id: 35,
    name: 'Lime Wool',
    color: 0x8BC34A,
    category: 'wool'
  },
  'minecraft:pink_wool': {
    id: 35,
    name: 'Pink Wool',
    color: 0xF48FB1,
    category: 'wool'
  },
  'minecraft:gray_wool': {
    id: 35,
    name: 'Gray Wool',
    color: 0x616161,
    category: 'wool'
  },
  'minecraft:light_gray_wool': {
    id: 35,
    name: 'Light Gray Wool',
    color: 0x9E9E9E,
    category: 'wool'
  },
  'minecraft:cyan_wool': {
    id: 35,
    name: 'Cyan Wool',
    color: 0x00BCD4,
    category: 'wool'
  },
  'minecraft:purple_wool': {
    id: 35,
    name: 'Purple Wool',
    color: 0x9C27B0,
    category: 'wool'
  },
  'minecraft:blue_wool': {
    id: 35,
    name: 'Blue Wool',
    color: 0x2196F3,
    category: 'wool'
  },
  'minecraft:brown_wool': {
    id: 35,
    name: 'Brown Wool',
    color: 0x795548,
    category: 'wool'
  },
  'minecraft:green_wool': {
    id: 35,
    name: 'Green Wool',
    color: 0x4CAF50,
    category: 'wool'
  },
  'minecraft:red_wool': {
    id: 35,
    name: 'Red Wool',
    color: 0xF44336,
    category: 'wool'
  },
  'minecraft:black_wool': {
    id: 35,
    name: 'Black Wool',
    color: 0x212121,
    category: 'wool'
  },
  'minecraft:gold_block': {
    id: 41,
    name: 'Gold Block',
    color: 0xFFD700,
    category: 'building'
  },
  'minecraft:iron_block': {
    id: 42,
    name: 'Iron Block',
    color: 0xC0C0C0,
    category: 'building'
  },
  'minecraft:bricks': {
    id: 45,
    name: 'Bricks',
    color: 0x8B4513,
    category: 'building'
  },
  'minecraft:tnt': {
    id: 46,
    name: 'TNT',
    color: 0xFF0000,
    category: 'special'
  },
  'minecraft:bookshelf': {
    id: 47,
    name: 'Bookshelf',
    color: 0x8B4513,
    category: 'building'
  },
  'minecraft:mossy_cobblestone': {
    id: 48,
    name: 'Moss Stone',
    color: 0x6B8E23,
    category: 'building'
  },
  'minecraft:obsidian': {
    id: 49,
    name: 'Obsidian',
    color: 0x1A0A2E,
    category: 'building'
  },
  'minecraft:diamond_ore': {
    id: 56,
    name: 'Diamond Ore',
    color: 0x5DADE2,
    category: 'ores'
  },
  'minecraft:diamond_block': {
    id: 57,
    name: 'Diamond Block',
    color: 0x5DADE2,
    category: 'building'
  },
  'minecraft:crafting_table': {
    id: 58,
    name: 'Crafting Table',
    color: 0x8B4513,
    category: 'utility'
  },
  'minecraft:redstone_ore': {
    id: 73,
    name: 'Redstone Ore',
    color: 0xFF0000,
    category: 'ores'
  },
  'minecraft:ice': {
    id: 79,
    name: 'Ice',
    color: 0xB0E0E6,
    transparent: true,
    category: 'natural'
  },
  'minecraft:snow_block': {
    id: 80,
    name: 'Snow Block',
    color: 0xFFFFFF,
    category: 'natural'
  },
  'minecraft:cactus': {
    id: 81,
    name: 'Cactus',
    color: 0x6B8E23,
    category: 'natural'
  },
  'minecraft:clay': {
    id: 82,
    name: 'Clay',
    color: 0x9FB6CD,
    category: 'natural'
  },
  'minecraft:netherrack': {
    id: 87,
    name: 'Netherrack',
    color: 0x8B0000,
    category: 'nether'
  },
  'minecraft:soul_sand': {
    id: 88,
    name: 'Soul Sand',
    color: 0x5D4037,
    category: 'nether'
  },
  'minecraft:glowstone': {
    id: 89,
    name: 'Glowstone',
    color: 0xFFEB3B,
    category: 'nether'
  },
  'minecraft:stone_bricks': {
    id: 98,
    name: 'Stone Bricks',
    color: 0x808080,
    category: 'building'
  },
  'minecraft:mossy_stone_bricks': {
    id: 98,
    name: 'Mossy Stone Bricks',
    color: 0x6B8E23,
    category: 'building'
  },
  'minecraft:cracked_stone_bricks': {
    id: 98,
    name: 'Cracked Stone Bricks',
    color: 0x696969,
    category: 'building'
  },
  'minecraft:chiseled_stone_bricks': {
    id: 98,
    name: 'Chiseled Stone Bricks',
    color: 0x778899,
    category: 'building'
  },
  'minecraft:nether_bricks': {
    id: 112,
    name: 'Nether Bricks',
    color: 0x8B0000,
    category: 'nether'
  },
  'minecraft:end_stone': {
    id: 121,
    name: 'End Stone',
    color: 0xFFFACD,
    category: 'end'
  },
  'minecraft:emerald_ore': {
    id: 129,
    name: 'Emerald Ore',
    color: 0x50C878,
    category: 'ores'
  },
  'minecraft:emerald_block': {
    id: 133,
    name: 'Emerald Block',
    color: 0x50C878,
    category: 'building'
  },
  'minecraft:quartz_block': {
    id: 155,
    name: 'Quartz Block',
    color: 0xF5F5DC,
    category: 'building'
  },
  'minecraft:white_terracotta': {
    id: 159,
    name: 'White Terracotta',
    color: 0xD2B48C,
    category: 'terracotta'
  },
  'minecraft:orange_terracotta': {
    id: 159,
    name: 'Orange Terracotta',
    color: 0xA0522D,
    category: 'terracotta'
  },
  'minecraft:magenta_terracotta': {
    id: 159,
    name: 'Magenta Terracotta',
    color: 0x95527A,
    category: 'terracotta'
  },
  'minecraft:light_blue_terracotta': {
    id: 159,
    name: 'Light Blue Terracotta',
    color: 0x706C8A,
    category: 'terracotta'
  },
  'minecraft:yellow_terracotta': {
    id: 159,
    name: 'Yellow Terracotta',
    color: 0xBA8524,
    category: 'terracotta'
  },
  'minecraft:lime_terracotta': {
    id: 159,
    name: 'Lime Terracotta',
    color: 0x677535,
    category: 'terracotta'
  },
  'minecraft:pink_terracotta': {
    id: 159,
    name: 'Pink Terracotta',
    color: 0xA04D4E,
    category: 'terracotta'
  },
  'minecraft:gray_terracotta': {
    id: 159,
    name: 'Gray Terracotta',
    color: 0x392923,
    category: 'terracotta'
  },
  'minecraft:light_gray_terracotta': {
    id: 159,
    name: 'Light Gray Terracotta',
    color: 0x876B62,
    category: 'terracotta'
  },
  'minecraft:cyan_terracotta': {
    id: 159,
    name: 'Cyan Terracotta',
    color: 0x575C5C,
    category: 'terracotta'
  },
  'minecraft:purple_terracotta': {
    id: 159,
    name: 'Purple Terracotta',
    color: 0x764656,
    category: 'terracotta'
  },
  'minecraft:blue_terracotta': {
    id: 159,
    name: 'Blue Terracotta',
    color: 0x4A3B60,
    category: 'terracotta'
  },
  'minecraft:brown_terracotta': {
    id: 159,
    name: 'Brown Terracotta',
    color: 0x4D3223,
    category: 'terracotta'
  },
  'minecraft:green_terracotta': {
    id: 159,
    name: 'Green Terracotta',
    color: 0x4C522A,
    category: 'terracotta'
  },
  'minecraft:red_terracotta': {
    id: 159,
    name: 'Red Terracotta',
    color: 0x8E3C2E,
    category: 'terracotta'
  },
  'minecraft:black_terracotta': {
    id: 159,
    name: 'Black Terracotta',
    color: 0x251610,
    category: 'terracotta'
  },
  'minecraft:acacia_leaves': {
    id: 161,
    name: 'Acacia Leaves',
    color: 0x4CAF50,
    transparent: true,
    category: 'natural'
  },
  'minecraft:dark_oak_leaves': {
    id: 161,
    name: 'Dark Oak Leaves',
    color: 0x2E7D32,
    transparent: true,
    category: 'natural'
  },
  'minecraft:acacia_log': {
    id: 162,
    name: 'Acacia Log',
    color: 0xCD853F,
    category: 'natural'
  },
  'minecraft:dark_oak_log': {
    id: 162,
    name: 'Dark Oak Log',
    color: 0x654321,
    category: 'natural'
  },
  'minecraft:slime_block': {
    id: 165,
    name: 'Slime Block',
    color: 0x8BC34A,
    transparent: true,
    category: 'utility'
  },
  'minecraft:prismarine': {
    id: 168,
    name: 'Prismarine',
    color: 0x5F9F9F,
    category: 'building'
  },
  'minecraft:prismarine_bricks': {
    id: 168,
    name: 'Prismarine Bricks',
    color: 0x4F8F8F,
    category: 'building'
  },
  'minecraft:dark_prismarine': {
    id: 168,
    name: 'Dark Prismarine',
    color: 0x2F4F4F,
    category: 'building'
  },
  'minecraft:sea_lantern': {
    id: 169,
    name: 'Sea Lantern',
    color: 0xB5E7A0,
    category: 'building'
  },
  'minecraft:hay_block': {
    id: 170,
    name: 'Hay Bale',
    color: 0xD4AF37,
    category: 'building'
  },
  'minecraft:terracotta': {
    id: 172,
    name: 'Terracotta',
    color: 0x9D5D52,
    category: 'building'
  },
  'minecraft:coal_block': {
    id: 173,
    name: 'Block of Coal',
    color: 0x2F2F2F,
    category: 'building'
  },
  'minecraft:packed_ice': {
    id: 174,
    name: 'Packed Ice',
    color: 0x9FB6FF,
    category: 'natural'
  },
  'minecraft:red_sandstone': {
    id: 179,
    name: 'Red Sandstone',
    color: 0xC45D33,
    category: 'building'
  },
  'minecraft:purpur_block': {
    id: 201,
    name: 'Purpur Block',
    color: 0xA569BD,
    category: 'end'
  },
  'minecraft:end_stone_bricks': {
    id: 206,
    name: 'End Stone Bricks',
    color: 0xDDD8A0,
    category: 'end'
  },
  'minecraft:magma_block': {
    id: 213,
    name: 'Magma Block',
    color: 0x8B0000,
    category: 'nether'
  },
  'minecraft:nether_wart_block': {
    id: 214,
    name: 'Nether Wart Block',
    color: 0x7A0E00,
    category: 'nether'
  },
  'minecraft:red_nether_bricks': {
    id: 215,
    name: 'Red Nether Bricks',
    color: 0x8B0000,
    category: 'nether'
  },
  'minecraft:bone_block': {
    id: 216,
    name: 'Bone Block',
    color: 0xE6E6E6,
    category: 'building'
  },
  // Shulker Boxes
  'minecraft:white_shulker_box': {
    id: 219,
    name: 'White Shulker Box',
    color: 0xF9F9F9,
    category: 'utility'
  },
  'minecraft:orange_shulker_box': {
    id: 220,
    name: 'Orange Shulker Box',
    color: 0xFF8C00,
    category: 'utility'
  },
  'minecraft:magenta_shulker_box': {
    id: 221,
    name: 'Magenta Shulker Box',
    color: 0xFF00FF,
    category: 'utility'
  },
  'minecraft:light_blue_shulker_box': {
    id: 222,
    name: 'Light Blue Shulker Box',
    color: 0xADD8E6,
    category: 'utility'
  },
  'minecraft:yellow_shulker_box': {
    id: 223,
    name: 'Yellow Shulker Box',
    color: 0xFFEB3B,
    category: 'utility'
  },
  'minecraft:lime_shulker_box': {
    id: 224,
    name: 'Lime Shulker Box',
    color: 0x8BC34A,
    category: 'utility'
  },
  'minecraft:pink_shulker_box': {
    id: 225,
    name: 'Pink Shulker Box',
    color: 0xF48FB1,
    category: 'utility'
  },
  'minecraft:gray_shulker_box': {
    id: 226,
    name: 'Gray Shulker Box',
    color: 0x616161,
    category: 'utility'
  },
  'minecraft:light_gray_shulker_box': {
    id: 227,
    name: 'Light Gray Shulker Box',
    color: 0x9E9E9E,
    category: 'utility'
  },
  'minecraft:cyan_shulker_box': {
    id: 228,
    name: 'Cyan Shulker Box',
    color: 0x00BCD4,
    category: 'utility'
  },
  'minecraft:purple_shulker_box': {
    id: 229,
    name: 'Purple Shulker Box',
    color: 0x9C27B0,
    category: 'utility'
  },
  'minecraft:blue_shulker_box': {
    id: 230,
    name: 'Blue Shulker Box',
    color: 0x2196F3,
    category: 'utility'
  },
  'minecraft:brown_shulker_box': {
    id: 231,
    name: 'Brown Shulker Box',
    color: 0x795548,
    category: 'utility'
  },
  'minecraft:green_shulker_box': {
    id: 232,
    name: 'Green Shulker Box',
    color: 0x4CAF50,
    category: 'utility'
  },
  'minecraft:red_shulker_box': {
    id: 233,
    name: 'Red Shulker Box',
    color: 0xF44336,
    category: 'utility'
  },
  'minecraft:black_shulker_box': {
    id: 234,
    name: 'Black Shulker Box',
    color: 0x212121,
    category: 'utility'
  },
  // Glazed Terracotta
  'minecraft:white_glazed_terracotta': {
    id: 235,
    name: 'White Glazed Terracotta',
    color: 0xF5F5F5,
    category: 'terracotta'
  },
  'minecraft:orange_glazed_terracotta': {
    id: 236,
    name: 'Orange Glazed Terracotta',
    color: 0xFF6F00,
    category: 'terracotta'
  },
  'minecraft:magenta_glazed_terracotta': {
    id: 237,
    name: 'Magenta Glazed Terracotta',
    color: 0xC2185B,
    category: 'terracotta'
  },
  'minecraft:light_blue_glazed_terracotta': {
    id: 238,
    name: 'Light Blue Glazed Terracotta',
    color: 0x0288D1,
    category: 'terracotta'
  },
  'minecraft:yellow_glazed_terracotta': {
    id: 239,
    name: 'Yellow Glazed Terracotta',
    color: 0xFBC02D,
    category: 'terracotta'
  },
  'minecraft:lime_glazed_terracotta': {
    id: 240,
    name: 'Lime Glazed Terracotta',
    color: 0x689F38,
    category: 'terracotta'
  },
  'minecraft:pink_glazed_terracotta': {
    id: 241,
    name: 'Pink Glazed Terracotta',
    color: 0xF06292,
    category: 'terracotta'
  },
  'minecraft:gray_glazed_terracotta': {
    id: 242,
    name: 'Gray Glazed Terracotta',
    color: 0x757575,
    category: 'terracotta'
  },
  'minecraft:light_gray_glazed_terracotta': {
    id: 243,
    name: 'Light Gray Glazed Terracotta',
    color: 0xBDBDBD,
    category: 'terracotta'
  },
  'minecraft:cyan_glazed_terracotta': {
    id: 244,
    name: 'Cyan Glazed Terracotta',
    color: 0x00ACC1,
    category: 'terracotta'
  },
  'minecraft:purple_glazed_terracotta': {
    id: 245,
    name: 'Purple Glazed Terracotta',
    color: 0x7B1FA2,
    category: 'terracotta'
  },
  'minecraft:blue_glazed_terracotta': {
    id: 246,
    name: 'Blue Glazed Terracotta',
    color: 0x1976D2,
    category: 'terracotta'
  },
  'minecraft:brown_glazed_terracotta': {
    id: 247,
    name: 'Brown Glazed Terracotta',
    color: 0x5D4037,
    category: 'terracotta'
  },
  'minecraft:green_glazed_terracotta': {
    id: 248,
    name: 'Green Glazed Terracotta',
    color: 0x388E3C,
    category: 'terracotta'
  },
  'minecraft:red_glazed_terracotta': {
    id: 249,
    name: 'Red Glazed Terracotta',
    color: 0xD32F2F,
    category: 'terracotta'
  },
  'minecraft:black_glazed_terracotta': {
    id: 250,
    name: 'Black Glazed Terracotta',
    color: 0x424242,
    category: 'terracotta'
  },
  // Concrete
  'minecraft:white_concrete': {
    id: 251,
    name: 'White Concrete',
    color: 0xE8E8E8,
    category: 'concrete'
  },
  'minecraft:orange_concrete': {
    id: 251,
    name: 'Orange Concrete',
    color: 0xE65100,
    category: 'concrete'
  },
  'minecraft:magenta_concrete': {
    id: 251,
    name: 'Magenta Concrete',
    color: 0xAD1457,
    category: 'concrete'
  },
  'minecraft:light_blue_concrete': {
    id: 251,
    name: 'Light Blue Concrete',
    color: 0x0277BD,
    category: 'concrete'
  },
  'minecraft:yellow_concrete': {
    id: 251,
    name: 'Yellow Concrete',
    color: 0xF57F17,
    category: 'concrete'
  },
  'minecraft:lime_concrete': {
    id: 251,
    name: 'Lime Concrete',
    color: 0x558B2F,
    category: 'concrete'
  },
  'minecraft:pink_concrete': {
    id: 251,
    name: 'Pink Concrete',
    color: 0xE91E63,
    category: 'concrete'
  },
  'minecraft:gray_concrete': {
    id: 251,
    name: 'Gray Concrete',
    color: 0x616161,
    category: 'concrete'
  },
  'minecraft:light_gray_concrete': {
    id: 251,
    name: 'Light Gray Concrete',
    color: 0x9E9E9E,
    category: 'concrete'
  },
  'minecraft:cyan_concrete': {
    id: 251,
    name: 'Cyan Concrete',
    color: 0x00838F,
    category: 'concrete'
  },
  'minecraft:purple_concrete': {
    id: 251,
    name: 'Purple Concrete',
    color: 0x6A1B9A,
    category: 'concrete'
  },
  'minecraft:blue_concrete': {
    id: 251,
    name: 'Blue Concrete',
    color: 0x1565C0,
    category: 'concrete'
  },
  'minecraft:brown_concrete': {
    id: 251,
    name: 'Brown Concrete',
    color: 0x4E342E,
    category: 'concrete'
  },
  'minecraft:green_concrete': {
    id: 251,
    name: 'Green Concrete',
    color: 0x2E7D32,
    category: 'concrete'
  },
  'minecraft:red_concrete': {
    id: 251,
    name: 'Red Concrete',
    color: 0xC62828,
    category: 'concrete'
  },
  'minecraft:black_concrete': {
    id: 251,
    name: 'Black Concrete',
    color: 0x37474F,
    category: 'concrete'
  },
  // Concrete Powder
  'minecraft:white_concrete_powder': {
    id: 252,
    name: 'White Concrete Powder',
    color: 0xE0E0E0,
    category: 'concrete'
  },
  'minecraft:orange_concrete_powder': {
    id: 252,
    name: 'Orange Concrete Powder',
    color: 0xDD6E42,
    category: 'concrete'
  },
  'minecraft:magenta_concrete_powder': {
    id: 252,
    name: 'Magenta Concrete Powder',
    color: 0xA5477A,
    category: 'concrete'
  },
  'minecraft:light_blue_concrete_powder': {
    id: 252,
    name: 'Light Blue Concrete Powder',
    color: 0x7FB3D3,
    category: 'concrete'
  },
  'minecraft:yellow_concrete_powder': {
    id: 252,
    name: 'Yellow Concrete Powder',
    color: 0xF0C040,
    category: 'concrete'
  },
  'minecraft:lime_concrete_powder': {
    id: 252,
    name: 'Lime Concrete Powder',
    color: 0x7CB518,
    category: 'concrete'
  },
  'minecraft:pink_concrete_powder': {
    id: 252,
    name: 'Pink Concrete Powder',
    color: 0xE57373,
    category: 'concrete'
  },
  'minecraft:gray_concrete_powder': {
    id: 252,
    name: 'Gray Concrete Powder',
    color: 0x8E8E93,
    category: 'concrete'
  },
  'minecraft:light_gray_concrete_powder': {
    id: 252,
    name: 'Light Gray Concrete Powder',
    color: 0xBDBDBD,
    category: 'concrete'
  },
  'minecraft:cyan_concrete_powder': {
    id: 252,
    name: 'Cyan Concrete Powder',
    color: 0x4FB3D9,
    category: 'concrete'
  },
  'minecraft:purple_concrete_powder': {
    id: 252,
    name: 'Purple Concrete Powder',
    color: 0x8E55A6,
    category: 'concrete'
  },
  'minecraft:blue_concrete_powder': {
    id: 252,
    name: 'Blue Concrete Powder',
    color: 0x5A8FBD,
    category: 'concrete'
  },
  'minecraft:brown_concrete_powder': {
    id: 252,
    name: 'Brown Concrete Powder',
    color: 0x8A7267,
    category: 'concrete'
  },
  'minecraft:green_concrete_powder': {
    id: 252,
    name: 'Green Concrete Powder',
    color: 0x758B2F,
    category: 'concrete'
  },
  'minecraft:red_concrete_powder': {
    id: 252,
    name: 'Red Concrete Powder',
    color: 0xD56353,
    category: 'concrete'
  },
  'minecraft:black_concrete_powder': {
    id: 252,
    name: 'Black Concrete Powder',
    color: 0x525252,
    category: 'concrete'
  },
  // Additional important blocks
  'minecraft:quartz_block': {
    id: 155,
    name: 'Quartz Block',
    color: 0xF5F5DC,
    category: 'building'
  },
  'minecraft:chiseled_quartz_block': {
    id: 155,
    name: 'Chiseled Quartz Block',
    color: 0xF0F0E6,
    category: 'building'
  },
  'minecraft:quartz_pillar': {
    id: 155,
    name: 'Quartz Pillar',
    color: 0xF8F8F0,
    category: 'building'
  },
  'minecraft:sandstone': {
    id: 24,
    name: 'Sandstone',
    color: 0xF2D2A9,
    category: 'building'
  },
  'minecraft:chiseled_sandstone': {
    id: 24,
    name: 'Chiseled Sandstone',
    color: 0xEDCDA3,
    category: 'building'
  },
  'minecraft:smooth_sandstone': {
    id: 24,
    name: 'Smooth Sandstone',
    color: 0xF5D5B0,
    category: 'building'
  },
  'minecraft:red_sandstone': {
    id: 179,
    name: 'Red Sandstone',
    color: 0xC45D33,
    category: 'building'
  },
  'minecraft:chiseled_red_sandstone': {
    id: 179,
    name: 'Chiseled Red Sandstone',
    color: 0xBF5830,
    category: 'building'
  },
  'minecraft:smooth_red_sandstone': {
    id: 179,
    name: 'Smooth Red Sandstone',
    color: 0xC96236,
    category: 'building'
  },
  'minecraft:sponge': {
    id: 19,
    name: 'Sponge',
    color: 0xFFD700,
    category: 'utility'
  },
  'minecraft:wet_sponge': {
    id: 19,
    name: 'Wet Sponge',
    color: 0xB8860B,
    category: 'utility'
  }
}

// Common block categories for the palette
export const BLOCK_CATEGORIES = {
  'Utility': [
    'minecraft:air'
  ],
  'Building': [
    'minecraft:stone',
    'minecraft:granite',
    'minecraft:polished_granite',
    'minecraft:diorite',
    'minecraft:polished_diorite',
    'minecraft:andesite',
    'minecraft:polished_andesite',
    'minecraft:cobblestone',
    'minecraft:oak_planks',
    'minecraft:spruce_planks',
    'minecraft:birch_planks',
    'minecraft:jungle_planks',
    'minecraft:acacia_planks',
    'minecraft:dark_oak_planks',
    'minecraft:glass',
    'minecraft:sandstone',
    'minecraft:chiseled_sandstone',
    'minecraft:smooth_sandstone',
    'minecraft:bricks',
    'minecraft:mossy_cobblestone',
    'minecraft:obsidian',
    'minecraft:stone_bricks',
    'minecraft:mossy_stone_bricks',
    'minecraft:cracked_stone_bricks',
    'minecraft:chiseled_stone_bricks',
    'minecraft:gold_block',
    'minecraft:iron_block',
    'minecraft:diamond_block',
    'minecraft:emerald_block',
    'minecraft:quartz_block',
    'minecraft:prismarine',
    'minecraft:prismarine_bricks',
    'minecraft:dark_prismarine',
    'minecraft:sea_lantern',
    'minecraft:hay_block',
    'minecraft:terracotta',
    'minecraft:coal_block',
    'minecraft:red_sandstone',
    'minecraft:bone_block'
  ],
  'Natural': [
    'minecraft:grass_block',
    'minecraft:dirt',
    'minecraft:coarse_dirt',
    'minecraft:podzol',
    'minecraft:sand',
    'minecraft:red_sand',
    'minecraft:gravel',
    'minecraft:oak_log',
    'minecraft:spruce_log',
    'minecraft:birch_log',
    'minecraft:jungle_log',
    'minecraft:acacia_log',
    'minecraft:dark_oak_log',
    'minecraft:oak_leaves',
    'minecraft:spruce_leaves',
    'minecraft:birch_leaves',
    'minecraft:jungle_leaves',
    'minecraft:acacia_leaves',
    'minecraft:dark_oak_leaves',
    'minecraft:water',
    'minecraft:lava',
    'minecraft:ice',
    'minecraft:snow_block',
    'minecraft:cactus',
    'minecraft:clay',
    'minecraft:packed_ice'
  ],
  'Ores': [
    'minecraft:coal_ore',
    'minecraft:iron_ore',
    'minecraft:gold_ore',
    'minecraft:diamond_ore',
    'minecraft:emerald_ore',
    'minecraft:redstone_ore',
    'minecraft:lapis_ore'
  ],
  'Wool': [
    'minecraft:white_wool',
    'minecraft:orange_wool',
    'minecraft:magenta_wool',
    'minecraft:light_blue_wool',
    'minecraft:yellow_wool',
    'minecraft:lime_wool',
    'minecraft:pink_wool',
    'minecraft:gray_wool',
    'minecraft:light_gray_wool',
    'minecraft:cyan_wool',
    'minecraft:purple_wool',
    'minecraft:blue_wool',
    'minecraft:brown_wool',
    'minecraft:green_wool',
    'minecraft:red_wool',
    'minecraft:black_wool'
  ],
  'Terracotta': [
    'minecraft:white_terracotta',
    'minecraft:orange_terracotta',
    'minecraft:magenta_terracotta',
    'minecraft:light_blue_terracotta',
    'minecraft:yellow_terracotta',
    'minecraft:lime_terracotta',
    'minecraft:pink_terracotta',
    'minecraft:gray_terracotta',
    'minecraft:light_gray_terracotta',
    'minecraft:cyan_terracotta',
    'minecraft:purple_terracotta',
    'minecraft:blue_terracotta',
    'minecraft:brown_terracotta',
    'minecraft:green_terracotta',
    'minecraft:red_terracotta',
    'minecraft:black_terracotta'
  ],
  'Nether': [
    'minecraft:netherrack',
    'minecraft:soul_sand',
    'minecraft:glowstone',
    'minecraft:nether_bricks',
    'minecraft:magma_block',
    'minecraft:nether_wart_block',
    'minecraft:red_nether_bricks'
  ],
  'End': [
    'minecraft:end_stone',
    'minecraft:purpur_block',
    'minecraft:end_stone_bricks'
  ],
  'Special': [
    'minecraft:bedrock',
    'minecraft:tnt',
    'minecraft:sponge',
    'minecraft:wet_sponge',
    'minecraft:lapis_block',
    'minecraft:bookshelf',
    'minecraft:crafting_table',
    'minecraft:slime_block'
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

// Enhanced Texture system with multi-face support
export const BLOCK_TEXTURE_MAPPINGS = {
  // Grass blocks - have top, side, and bottom faces
  'minecraft:grass_block': {
    top: 'grasstop',
    side: 'grassside', 
    bottom: 'dirt'
  },
  
  // Dirt variants
  'minecraft:dirt': 'dirt',
  'minecraft:coarse_dirt': 'coarse_dirt', 
  'minecraft:podzol': {
    top: 'podzol_top',
    side: 'podzol_side',
    bottom: 'dirt'
  },
  
  // Stone variants
  'minecraft:stone': 'stone',
  'minecraft:granite': 'granite',
  'minecraft:polished_granite': 'polished_granite',
  'minecraft:diorite': 'diorite', 
  'minecraft:polished_diorite': 'polished_diorite',
  'minecraft:andesite': 'andesite',
  'minecraft:polished_andesite': 'polished_andesite',
  'minecraft:cobblestone': 'cobblestone',
  
  // Deepslate variants
  'minecraft:deepslate': {
    top: 'deepslate_topbottom',
    side: 'deepslate',
    bottom: 'deepslate_topbottom'
  },
  'minecraft:cobbled_deepslate': 'cobbled_deepslate',
  'minecraft:polished_deepslate': 'polished_deepslate',
  'minecraft:deepslate_bricks': 'deepslate_bricks',
  'minecraft:deepslate_tiles': 'deepslate_tiles',
  
  // Wood planks
  'minecraft:oak_planks': 'oak_planks',
  'minecraft:spruce_planks': 'spruce_planks', 
  'minecraft:birch_planks': 'birch_planks',
  'minecraft:jungle_planks': 'jungle_planks',
  'minecraft:acacia_planks': 'acacia_planks',
  'minecraft:dark_oak_planks': 'dark_oak_planks',
  'minecraft:mangrove_planks': 'mangrove_planks',
  'minecraft:cherry_planks': 'cherry_planks',
  'minecraft:bamboo_planks': 'bamboo_planks',
  'minecraft:crimson_planks': 'crimson_planks',
  'minecraft:warped_planks': 'warped_planks',
  
  // Wood logs - have top and side faces
  'minecraft:oak_log': {
    top: 'oak_log_topbottom',
    side: 'oak_log',
    bottom: 'oak_log_topbottom'
  },
  'minecraft:spruce_log': {
    top: 'spruce_log_topbottom', 
    side: 'spruce_log',
    bottom: 'spruce_log_topbottom'
  },
  'minecraft:birch_log': {
    top: 'birch_log_topbottom',
    side: 'birch_log', 
    bottom: 'birch_log_topbottom'
  },
  'minecraft:jungle_log': {
    top: 'jungle_log_topbottom',
    side: 'jungle_log',
    bottom: 'jungle_log_topbottom'
  },
  'minecraft:acacia_log': {
    top: 'acacia_log_topbottom',
    side: 'acacia_log',
    bottom: 'acacia_log_topbottom'
  },
  'minecraft:dark_oak_log': {
    top: 'dark_oak_log_topbottom',
    side: 'dark_oak_log',
    bottom: 'dark_oak_log_topbottom'
  },
  'minecraft:mangrove_log': {
    top: 'mangrove_log_topbottom',
    side: 'mangrove_log',
    bottom: 'mangrove_log_topbottom'
  },
  'minecraft:cherry_log': {
    top: 'cherry_log_topbottom', 
    side: 'cherry_log',
    bottom: 'cherry_log_topbottom'
  },
  
  // Stripped logs
  'minecraft:stripped_oak_log': {
    top: 'stripped_oak_log_topbottom',
    side: 'stripped_oak_log',
    bottom: 'stripped_oak_log_topbottom'
  },
  'minecraft:stripped_spruce_log': {
    top: 'stripped_spruce_log_topbottom',
    side: 'stripped_spruce_log',
    bottom: 'stripped_spruce_log_topbottom'
  },
  'minecraft:stripped_birch_log': {
    top: 'stripped_birch_log_topbottom',
    side: 'stripped_birch_log',
    bottom: 'stripped_birch_log_topbottom'
  },
  'minecraft:stripped_jungle_log': {
    top: 'stripped_jungle_log_topbottom',
    side: 'stripped_jungle_log',
    bottom: 'stripped_jungle_log_topbottom'
  },
  'minecraft:stripped_acacia_log': {
    top: 'stripped_acacia_log_topbottom',
    side: 'stripped_acacia_log',
    bottom: 'stripped_acacia_log_topbottom'
  },
  'minecraft:stripped_dark_oak_log': {
    top: 'stripped_dark_oak_log_topbottom',
    side: 'stripped_dark_oak_log',
    bottom: 'stripped_dark_oak_log_topbottom'
  },
  'minecraft:stripped_mangrove_log': {
    top: 'stripped_mangrove_log_topbottom',
    side: 'stripped_mangrove_log',
    bottom: 'stripped_mangrove_log_topbottom'
  },
  'minecraft:stripped_cherry_log': {
    top: 'stripped_cherry_log_topbottom',
    side: 'stripped_cherry_log',
    bottom: 'stripped_cherry_log_topbottom'
  },
  
  // Nether stems
  'minecraft:crimson_stem': {
    top: 'crimson_stem_topbottom',
    side: 'crimson_stem',
    bottom: 'crimson_stem_topbottom'
  },
  'minecraft:warped_stem': {
    top: 'warped_stem_topbottom',
    side: 'warped_stem',
    bottom: 'warped_stem_topbottom'
  },
  'minecraft:stripped_crimson_stem': {
    top: 'stripped_crimson_stem_topbottom',
    side: 'stripped_crimson_stem',
    bottom: 'stripped_crimson_stem_topbottom'
  },
  'minecraft:stripped_warped_stem': {
    top: 'stripped_warped_stem_topbottom',
    side: 'stripped_warped_stem',
    bottom: 'stripped_warped_stem_topbottom'
  },
  
  // Sand variants
  'minecraft:sand': 'sand',
  'minecraft:red_sand': 'red_sand',
  'minecraft:sandstone': {
    top: 'sandstone',
    side: 'sandstone', 
    bottom: 'sandstone'
  },
  'minecraft:red_sandstone': {
    top: 'red_sandstone',
    side: 'red_sandstone',
    bottom: 'red_sandstone'
  },
  
  // Ores
  'minecraft:coal_ore': 'coal_ore',
  'minecraft:iron_ore': 'iron_ore',
  'minecraft:gold_ore': 'gold_ore',
  'minecraft:diamond_ore': 'diamond_ore',
  'minecraft:emerald_ore': 'emerald_ore',
  'minecraft:lapis_lazuli_ore': 'lapis_lazuli_ore',
  'minecraft:redstone_ore': 'redstone_ore',
  'minecraft:copper_ore': 'copper_ore',
  
  // Deepslate ores
  'minecraft:deepslate_coal_ore': 'deepslate_coal_ore',
  'minecraft:deepslate_iron_ore': 'deepslate_iron_ore',
  'minecraft:deepslate_gold_ore': 'deepslate_gold_ore',
  'minecraft:deepslate_diamond_ore': 'deepslate_diamond_ore',
  'minecraft:deepslate_emerald_ore': 'deepslate_emerald_ore',
  'minecraft:deepslate_lapis_lazuli_ore': 'deepslate_lapis_lazuli_ore',
  'minecraft:deepslate_redstone_ore': 'deepslate_redstone_ore',
  'minecraft:deepslate_copper_ore': 'deepslate_copper_ore',
  
  // Nether blocks
  'minecraft:netherrack': 'netherrack',
  'minecraft:nether_bricks': 'nether_bricks',
  'minecraft:red_nether_bricks': 'red_nether_bricks',
  'minecraft:blackstone': {
    top: 'blackstone_topbottom',
    side: 'blackstone',
    bottom: 'blackstone_topbottom'
  },
  'minecraft:polished_blackstone': 'polished_blackstone',
  'minecraft:polished_blackstone_bricks': 'polished_blackstone_bricks',
  'minecraft:basalt': {
    top: 'basalt_topbottom',
    side: 'basalt',
    bottom: 'basalt_topbottom'
  },
  'minecraft:polished_basalt': {
    top: 'polished_basalt_topbottom',
    side: 'polished_basalt',
    bottom: 'polished_basalt_topbottom'
  },
  
  // End blocks
  'minecraft:end_stone': 'end_stone',
  'minecraft:end_stone_bricks': 'end_stone_bricks',
  'minecraft:obsidian': 'obsidian',
  'minecraft:crying_obsidian': 'crying_obsidian',
  
  // Wool
  'minecraft:white_wool': 'white_wool',
  'minecraft:light_gray_wool': 'light_gray_wool',
  'minecraft:gray_wool': 'gray_wool',
  'minecraft:black_wool': 'black_wool',
  'minecraft:brown_wool': 'brown_wool',
  'minecraft:red_wool': 'red_wool',
  'minecraft:orange_wool': 'orange_wool',
  'minecraft:yellow_wool': 'yellow_wool',
  'minecraft:lime_wool': 'lime_wool',
  'minecraft:green_wool': 'green_wool',
  'minecraft:cyan_wool': 'cyan_wool',
  'minecraft:light_blue_wool': 'light_blue_wool',
  'minecraft:blue_wool': 'blue_wool',
  'minecraft:purple_wool': 'purple_wool',
  'minecraft:magenta_wool': 'magenta_wool',
  'minecraft:pink_wool': 'pink_wool',
  
  // Glass
  'minecraft:glass': 'glass',
  'minecraft:white_stained_glass': 'white_stained_glass',
  'minecraft:light_gray_stained_glass': 'light_gray_stained_glass',
  'minecraft:gray_stained_glass': 'gray_stained_glass',
  'minecraft:black_stained_glass': 'black_stained_glass',
  
  // Basic liquids and special blocks
  'minecraft:water': 'water',
  'minecraft:lava': 'lava',
  'minecraft:bedrock': 'bedrock',
  'minecraft:gravel': 'gravel',
  
  // Ice and snow
  'minecraft:ice': 'ice',
  'minecraft:snow_block': 'snow_block',
  'minecraft:packed_ice': 'packed_ice',
  
  // Clay
  'minecraft:clay': 'clay',
  
  // Terracotta  
  'minecraft:terracotta': 'terracotta',
  
  // Metal blocks
  'minecraft:iron_block': 'iron_block',
  'minecraft:gold_block': 'gold_block', 
  'minecraft:diamond_block': 'diamond_block',
  'minecraft:emerald_block': 'emerald_block',
  'minecraft:coal_block': 'coal_block',
  
  // Bricks and stone variants
  'minecraft:bricks': 'bricks',
  'minecraft:stone_bricks': 'stone_bricks',
  'minecraft:mossy_stone_bricks': 'mossy_stone_bricks',
  'minecraft:cracked_stone_bricks': 'cracked_stone_bricks',
  'minecraft:chiseled_stone_bricks': 'chiseled_stone_bricks',
  'minecraft:mossy_cobblestone': 'mossy_cobblestone',
  
  // Quartz blocks
  'minecraft:quartz_block': {
    top: 'quartz_block_topbottom',
    side: 'quartz_block',
    bottom: 'quartz_block_topbottom'
  },
  
  // Sandstone variants
  'minecraft:chiseled_sandstone': 'chiseled_sandstone',
  'minecraft:smooth_sandstone': 'smooth_sandstone',
  'minecraft:cut_sandstone': 'cut_sandstone',
  'minecraft:chiseled_red_sandstone': 'chiseled_red_sandstone',
  'minecraft:smooth_red_sandstone': 'smooth_red_sandstone',
  'minecraft:cut_red_sandstone': 'cut_red_sandstone',
  
  // Prismarine variants
  'minecraft:prismarine': 'prismarine',
  'minecraft:prismarine_bricks': 'prismarine_bricks', 
  'minecraft:dark_prismarine': 'dark_prismarine',
  'minecraft:sea_lantern': 'sea_lantern',
  
  // Bone block
  'minecraft:bone_block': {
    top: 'bone_block_topbottom',
    side: 'bone_block',
    bottom: 'bone_block_topbottom'
  },
  
  // Hay block
  'minecraft:hay_block': {
    top: 'hay_block_topbottom',
    side: 'hay_block',
    bottom: 'hay_block_topbottom'
  },
  
  // Leaves (all use same texture for all faces)
  'minecraft:oak_leaves': 'oak_leaves',
  'minecraft:spruce_leaves': 'spruce_leaves',
  'minecraft:birch_leaves': 'birch_leaves',
  'minecraft:jungle_leaves': 'jungle_leaves',
  'minecraft:acacia_leaves': 'acacia_leaves',
  'minecraft:dark_oak_leaves': 'dark_oak_leaves',
  
  // Lapis ore and block
  'minecraft:lapis_ore': 'lapis_ore',
  'minecraft:lapis_block': 'lapis_block',
  
  // Redstone ore
  'minecraft:redstone_ore': 'redstone_ore',
  
  // Cactus (special block model)
  'minecraft:cactus': 'cactus'
}

export function getBlockTexture(blockType, face = 'side') {
  const mapping = BLOCK_TEXTURE_MAPPINGS[blockType]
  
  if (!mapping) {
    // Fallback to block name without minecraft: prefix
    const textureName = blockType.replace('minecraft:', '')
    return `/assets/textures/blocks/${textureName}.png`
  }
  
  if (typeof mapping === 'string') {
    // Single texture for all faces
    return `/assets/textures/blocks/${mapping}.png`
  }
  
  if (typeof mapping === 'object') {
    // Multi-face texture
    const textureName = mapping[face] || mapping.side || mapping.top || Object.values(mapping)[0]
    return `/assets/textures/blocks/${textureName}.png`
  }
  
  return `/assets/textures/blocks/${blockType.replace('minecraft:', '')}.png`
}

export function getTexturePath(blockType, face = 'side') {
  return getBlockTexture(blockType, face)
}

export function getBlockTextures(blockType) {
  const mapping = BLOCK_TEXTURE_MAPPINGS[blockType]
  
  if (!mapping) {
    const textureName = blockType.replace('minecraft:', '')
    const path = `/assets/textures/blocks/${textureName}.png`
    return { top: path, side: path, bottom: path }
  }
  
  if (typeof mapping === 'string') {
    const path = `/assets/textures/blocks/${mapping}.png`
    return { top: path, side: path, bottom: path }
  }
  
  if (typeof mapping === 'object') {
    return {
      top: `/assets/textures/blocks/${mapping.top || mapping.side || Object.values(mapping)[0]}.png`,
      side: `/assets/textures/blocks/${mapping.side || mapping.top || Object.values(mapping)[0]}.png`,
      bottom: `/assets/textures/blocks/${mapping.bottom || mapping.side || mapping.top || Object.values(mapping)[0]}.png`
    }
  }
  
  const fallback = `/assets/textures/blocks/${blockType.replace('minecraft:', '')}.png`
  return { top: fallback, side: fallback, bottom: fallback }
}

// Enhanced block information functions
export function getBlocksByCategory(category) {
  return BLOCK_CATEGORIES[category] || []
}

export function getBlockCategory(blockType) {
  const blockInfo = getBlockInfo(blockType)
  return blockInfo.category || 'unknown'
}

export function getAllCategories() {
  return Object.keys(BLOCK_CATEGORIES)
}

// NBT/SNBT support functions
export function getBlockNBT(blockType, blockData = 0, properties = {}) {
  const blockInfo = getBlockInfo(blockType)
  return {
    id: blockInfo.id || 0,
    name: blockType,
    properties: properties,
    data: blockData,
    // Additional NBT data for compatibility
    Count: 1,
    Damage: blockData
  }
}

export function blockTypeFromNBT(nbt) {
  if (nbt.name) {
    return nbt.name
  }
  if (nbt.id) {
    // Find block by ID
    for (const [blockType, blockInfo] of Object.entries(BLOCK_TYPES)) {
      if (blockInfo.id === nbt.id) {
        return blockType
      }
    }
  }
  return 'minecraft:stone'
}

// SNBT (Stringified NBT) support
export function getBlockSNBT(blockType, blockData = 0, properties = {}) {
  const nbt = getBlockNBT(blockType, blockData, properties)
  // Simple SNBT representation
  const propsStr = Object.keys(properties).length > 0 
    ? `[${Object.entries(properties).map(([k, v]) => `${k}="${v}"`).join(',')}]` 
    : ''
  return `${blockType}${propsStr}`
}

export function blockTypeFromSNBT(snbt) {
  // Parse simple SNBT format: minecraft:block_name[prop1="value1",prop2="value2"]
  const match = snbt.match(/^([^[]+)(\[.*\])?$/)
  if (match) {
    return match[1]
  }
  return 'minecraft:stone'
}

// WorldEdit schematic support
export function getWorldEditBlockData(blockType, blockData = 0, properties = {}) {
  const blockInfo = getBlockInfo(blockType)
  return {
    id: blockInfo.id || 0,
    data: blockData,
    name: blockType,
    properties: properties
  }
}

// Search functionality
export function searchBlocks(query) {
  const lowercaseQuery = query.toLowerCase()
  const results = []
  
  Object.entries(BLOCK_TYPES).forEach(([blockType, blockInfo]) => {
    if (blockType.toLowerCase().includes(lowercaseQuery) ||
        blockInfo.name.toLowerCase().includes(lowercaseQuery)) {
      results.push(blockType)
    }
  })
  
  return results
}

// Block properties
export function isBlockSolid(blockType) {
  return !isTransparent(blockType)
}

export function getBlockLuminance(blockType) {
  // Return light level for glowing blocks
  switch (blockType) {
    case 'minecraft:glowstone':
    case 'minecraft:sea_lantern':
      return 15
    case 'minecraft:lava':
      return 15
    case 'minecraft:magma_block':
      return 3
    default:
      return 0
  }
}

// Enhanced block properties and material types
export function getBlockMaterialType(blockType) {
  const category = getBlockCategory(blockType)
  switch (category) {
    case 'building':
    case 'ores':
      return 'solid'
    case 'natural':
      if (blockType.includes('leaves') || blockType.includes('water') || blockType.includes('lava')) {
        return 'fluid'
      }
      return 'organic'
    case 'glass':
      return 'transparent'
    default:
      return 'solid'
  }
}

export function getBlockHardness(blockType) {
  // Approximate hardness values (time to break in survival mode)
  switch (blockType) {
    case 'minecraft:bedrock':
      return -1 // Unbreakable
    case 'minecraft:obsidian':
      return 50
    case 'minecraft:stone':
    case 'minecraft:cobblestone':
      return 1.5
    case 'minecraft:dirt':
    case 'minecraft:grass_block':
      return 0.5
    case 'minecraft:glass':
      return 0.3
    default:
      if (blockType.includes('_ore')) return 3
      if (blockType.includes('_planks')) return 2
      if (blockType.includes('_log')) return 2
      if (blockType.includes('wool')) return 0.8
      if (blockType.includes('leaves')) return 0.2
      return 1
  }
}

export function getBlockBlastResistance(blockType) {
  // Blast resistance values
  switch (blockType) {
    case 'minecraft:bedrock':
      return 3600000
    case 'minecraft:obsidian':
      return 1200
    case 'minecraft:end_stone':
      return 9
    case 'minecraft:stone':
    case 'minecraft:cobblestone':
      return 6
    case 'minecraft:bricks':
    case 'minecraft:stone_bricks':
      return 6
    default:
      if (blockType.includes('concrete')) return 1.8
      if (blockType.includes('terracotta')) return 4.2
      if (blockType.includes('wool')) return 1
      return 3
  }
}

export function canBlockBurn(blockType) {
  // Whether block can catch fire
  const burnableBlocks = [
    'minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks',
    'minecraft:jungle_planks', 'minecraft:acacia_planks', 'minecraft:dark_oak_planks',
    'minecraft:oak_log', 'minecraft:spruce_log', 'minecraft:birch_log',
    'minecraft:jungle_log', 'minecraft:acacia_log', 'minecraft:dark_oak_log',
    'minecraft:oak_leaves', 'minecraft:spruce_leaves', 'minecraft:birch_leaves',
    'minecraft:jungle_leaves', 'minecraft:acacia_leaves', 'minecraft:dark_oak_leaves',
    'minecraft:bookshelf', 'minecraft:hay_block'
  ]
  return burnableBlocks.includes(blockType) || blockType.includes('wool')
}

export function getBlockToolType(blockType) {
  // Best tool for harvesting
  if (blockType.includes('_ore') || blockType === 'minecraft:stone' || 
      blockType.includes('cobblestone') || blockType.includes('bricks')) {
    return 'pickaxe'
  }
  if (blockType.includes('_log') || blockType.includes('_planks') || 
      blockType === 'minecraft:bookshelf') {
    return 'axe'
  }
  if (blockType === 'minecraft:dirt' || blockType === 'minecraft:grass_block' ||
      blockType.includes('sand') || blockType === 'minecraft:gravel') {
    return 'shovel'
  }
  if (blockType.includes('leaves')) {
    return 'shears'
  }
  return 'hand'
}

export function getBlockDrops(blockType, fortune = 0, silkTouch = false) {
  // What the block drops when broken
  if (silkTouch) {
    return [{ item: blockType, count: 1 }]
  }
  
  switch (blockType) {
    case 'minecraft:stone':
      return [{ item: 'minecraft:cobblestone', count: 1 }]
    case 'minecraft:grass_block':
      return [{ item: 'minecraft:dirt', count: 1 }]
    case 'minecraft:diamond_ore':
      return [{ item: 'minecraft:diamond', count: 1 + Math.floor(Math.random() * fortune) }]
    case 'minecraft:coal_ore':
      return [{ item: 'minecraft:coal', count: 1 + Math.floor(Math.random() * fortune) }]
    case 'minecraft:iron_ore':
    case 'minecraft:gold_ore':
      return [{ item: blockType, count: 1 }] // Needs smelting
    case 'minecraft:glass':
      return [] // Breaks without drops unless silk touch
    default:
      if (blockType.includes('leaves')) {
        const drops = []
        if (Math.random() < 0.05) { // 5% chance for sapling
          drops.push({ item: blockType.replace('leaves', 'sapling'), count: 1 })
        }
        if (Math.random() < 0.02) { // 2% chance for apple (oak only)
          if (blockType === 'minecraft:oak_leaves') {
            drops.push({ item: 'minecraft:apple', count: 1 })
          }
        }
        return drops
      }
      return [{ item: blockType, count: 1 }]
  }
}

// Texture and rendering properties
export function hasCustomTexture(blockType) {
  // Check if block has texture mapping
  const mapping = BLOCK_TEXTURE_MAPPINGS[blockType]
  if (mapping) {
    return true // We have explicit mapping
  }
  
  // For blocks without explicit mapping, check if texture file exists
  // This is a simple synchronous check - for production you might want async/cached checking
  try {
    const textureName = blockType.replace('minecraft:', '')
    // Create a simple test to see if texture would be available
    return Boolean(textureName && textureName.length > 0)
  } catch (e) {
    return false
  }
}

export function isMultiFaceTexture(blockType) {
  const mapping = BLOCK_TEXTURE_MAPPINGS[blockType]
  return mapping && typeof mapping === 'object' && (mapping.top || mapping.side || mapping.bottom)
}

export function getTextureAnimation(blockType) {
  // Return animation data for animated textures
  const animatedBlocks = ['minecraft:water', 'minecraft:lava', 'minecraft:portal']
  if (animatedBlocks.includes(blockType)) {
    return {
      animated: true,
      frames: blockType === 'minecraft:water' ? 32 : 20,
      frameDuration: blockType === 'minecraft:water' ? 2 : 3
    }
  }
  return { animated: false }
}

export function getBlockModel(blockType) {
  // Return 3D model type for rendering
  if (blockType.includes('stairs')) return 'stairs'
  if (blockType.includes('slab')) return 'slab'
  if (blockType.includes('fence')) return 'fence'
  if (blockType.includes('wall')) return 'wall'
  if (blockType.includes('door')) return 'door'
  if (blockType.includes('trapdoor')) return 'trapdoor'
  if (blockType === 'minecraft:cactus') return 'cactus'
  return 'cube' // Default full block
}

// Development and debugging utilities
export function getAllBlockTypes() {
  return Object.keys(BLOCK_TYPES)
}

export function getBlockCount() {
  return Object.keys(BLOCK_TYPES).length
}

export function getCategoryCount() {
  return Object.keys(BLOCK_CATEGORIES).length
}

export function getBlocksByPattern(pattern) {
  const regex = new RegExp(pattern, 'i')
  return Object.keys(BLOCK_TYPES).filter(blockType => 
    regex.test(blockType) || regex.test(BLOCK_TYPES[blockType].name)
  )
}

export function debugBlockInfo() {
  console.log(`📊 MCWebEdit Block System Stats:`)
  console.log(`   🧱 Total blocks: ${getBlockCount()}`)
  console.log(`   📁 Categories: ${getCategoryCount()}`)
  console.log(`   🎨 Texture system: Ready`)
  console.log(`   📝 NBT/SNBT support: Available`)
  console.log(`   🌍 WorldEdit compatibility: Enabled`)
  
  const categories = getAllCategories()
  categories.forEach(category => {
    const blocks = getBlocksByCategory(category)
    console.log(`   📂 ${category}: ${blocks.length} blocks`)
  })
}

// Advanced texture functions for 3D rendering
export function getBlockFaceTexture(blockType, face, context = {}) {
  /**
   * Get the texture URL for a specific face of a block
   * @param {string} blockType - The block type (e.g., 'minecraft:grass_block')
   * @param {string} face - The face ('top', 'bottom', 'north', 'south', 'east', 'west', 'side')
   * @param {object} context - Additional context (position, neighbors, etc.)
   * @returns {string} - The texture URL
   */
  
  // Normalize face names (north/south/east/west all map to 'side' for most blocks)
  const normalizedFace = ['north', 'south', 'east', 'west'].includes(face) ? 'side' : face
  
  return getBlockTexture(blockType, normalizedFace)
}

export function getBlockTextureSet(blockType) {
  /**
   * Get all textures for a block as a set for 3D rendering
   * @param {string} blockType - The block type
   * @returns {object} - Object with texture URLs for each face direction

   */
  
  const textures = getBlockTextures(blockType)
  
  return {
    // Six faces of a cube
    top: textures.top,
    bottom: textures.bottom,
    north: textures.side,
    south: textures.side,
    east: textures.side,
    west: textures.side,
    
    // Aliases for convenience
    side: textures.side,
    front: textures.side,
    back: textures.side,
    left: textures.side,
    right: textures.side
  }
}

export function createBlockMaterial(blockType, materialLibrary = {}) {
  /**
   * Create a Three.js material set for a block
   * @param {string} blockType - The block type
   * @param {object} materialLibrary - Optional Three.js material library for caching
   * @returns {object} - Material configuration for Three.js
   */
  
  const textureSet = getBlockTextureSet(blockType)
  const blockInfo = getBlockInfo(blockType)
  
  return {
    type: blockInfo.transparent ? 'transparent' : 'opaque',
    textures: textureSet,
    color: blockInfo.color,
    transparent: Boolean(blockInfo.transparent),
    opacity: blockInfo.transparent ? 0.8 : 1.0,
    animated: getTextureAnimation(blockType).animated,
    model: getBlockModel(blockType)
  }
}

export function getBlockRenderProperties(blockType) {
  /**
   * Get comprehensive rendering properties for a block
   * @param {string} blockType - The block type
   * @returns {object} - Complete rendering configuration
   */
  
  const blockInfo = getBlockInfo(blockType)
  const textureSet = getBlockTextureSet(blockType)
  const animation = getTextureAnimation(blockType)
  const model = getBlockModel(blockType)
  
  return {
    // Basic properties
    id: blockInfo.id,
    name: blockInfo.name,
    category: blockInfo.category,
    
    // Visual properties
    color: blockInfo.color,
    transparent: Boolean(blockInfo.transparent),
    opacity: blockInfo.transparent ? 0.8 : 1.0,
    
    // Textures
    textures: textureSet,
    hasCustomTexture: hasCustomTexture(blockType),
    isMultiFace: isMultiFaceTexture(blockType),
    
    // Animation
    animated: animation.animated,
    animationFrames: animation.frames,
    animationDuration: animation.frameDuration,
    
    // 3D Model
    model: model,
    
    // Utility flags
    isFullBlock: model === 'cube',
    needsSpecialHandling: ['stairs', 'slab', 'fence', 'wall', 'door', 'trapdoor', 'cactus'].includes(model),
    
    // Rendering hints
    castShadows: !blockInfo.transparent,
    receiveShadows: true,
    frustumCulled: true,
    depthWrite: !blockInfo.transparent
  }
}

// Utility function for block face culling in 3D rendering
export function shouldCullBlockFace(blockType, face, neighborBlockType) {
  /**
   * Determine if a block face should be culled (hidden) due to an adjacent block
   * @param {string} blockType - The current block type
   * @param {string} face - The face being checked
   * @param {string} neighborBlockType - The adjacent block type
   * @returns {boolean} - True if face should be culled
   */
  
  // Don't cull if there's no neighbor
  if (!neighborBlockType || neighborBlockType === 'minecraft:air') {
    return false
  }
  
  const blockInfo = getBlockInfo(blockType)
  const neighborInfo = getBlockInfo(neighborBlockType)
  
  // Don't cull transparent blocks against opaque blocks
  if (blockInfo.transparent && !neighborInfo.transparent) {
    return false
  }
  
  // Don't cull different transparent blocks against each other
  if (blockInfo.transparent && neighborInfo.transparent && blockType !== neighborBlockType) {
    return false
  }
  
  // Cull opaque faces against opaque blocks
  if (!blockInfo.transparent && !neighborInfo.transparent) {
    return true
  }
  
  return false
}
