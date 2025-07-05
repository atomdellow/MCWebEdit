# MCWebEdit Block Textures

This directory contains PNG texture files for Minecraft blocks used in the MCWebEdit voxel editor.

## Current Texture Status

The texture system is set up and ready to use. To add textures:

1. Save 16x16 PNG files with the correct block names (without `minecraft:` prefix)
2. Place them in this directory
3. The renderer will automatically try to load them

## Example Texture Files Needed

Here are some key textures you can add:

### Basic Building Blocks
- `stone.png` - Gray stone texture
- `grass_block.png` - Grass block with green top
- `dirt.png` - Brown dirt texture
- `cobblestone.png` - Cobblestone pattern
- `oak_planks.png` - Wooden planks texture
- `oak_log.png` - Tree log with rings

### Ores
- `coal_ore.png` - Stone with black coal specks
- `iron_ore.png` - Stone with brown iron specks
- `gold_ore.png` - Stone with yellow gold specks
- `diamond_ore.png` - Stone with cyan diamond specks

### Decorative
- `bricks.png` - Red brick pattern
- `glass.png` - Transparent or white glass
- `obsidian.png` - Dark purple-black obsidian

### Wool (Colored)
- `white_wool.png` - White fluffy texture
- `red_wool.png` - Red fluffy texture
- `blue_wool.png` - Blue fluffy texture
- (etc. for all 16 colors)

### Concrete (Colored)
- `white_concrete.png` - Smooth white surface
- `red_concrete.png` - Smooth red surface
- (etc. for all 16 colors)

## Texture Sources

- **Official Minecraft textures**: Extract from Minecraft resource packs (ensure proper licensing)
- **Free texture packs**: Many community texture packs allow reuse
- **Custom textures**: Create your own 16x16 pixel art
- **AI-generated**: Use AI tools to create Minecraft-style textures

## Fallback Behavior

If a texture file is missing, the system will fall back to using solid colors defined in `blockTypes.js`.

## Adding Textures

To add a texture file:

```bash
# Example: Adding a stone texture
# Save your 16x16 PNG as: stone.png
# The system will automatically try to load /assets/textures/blocks/stone.png
```

## Texture Format

- **Size**: 16x16 pixels (classic Minecraft size)
- **Format**: PNG with transparency support
- **Color depth**: 24-bit RGB or 32-bit RGBA
- **Style**: Pixel art, Minecraft-compatible designs

## Future Features

- Animated textures (water, lava, portal)
- Texture pack switching
- Higher resolution texture support (32x32, 64x64)
- Texture atlasing for performance
- Custom texture uploads through UI
