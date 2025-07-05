# Block Textures

This directory contains Minecraft block textures for the MCWebEdit voxel editor.

## Directory Structure
```
/assets/textures/blocks/
├── stone.png
├── grass_block.png
├── dirt.png
├── oak_planks.png
├── ...
```

## File Naming Convention
- Use the block name without the `minecraft:` prefix
- Use underscores instead of spaces
- Use lowercase letters
- File extension should be `.png`

Examples:
- `minecraft:oak_planks` → `oak_planks.png`
- `minecraft:stone_bricks` → `stone_bricks.png`
- `minecraft:red_wool` → `red_wool.png`

## Image Requirements
- Format: PNG with transparency support
- Recommended size: 16x16 pixels (classic Minecraft texture size)
- Alternative sizes: 32x32, 64x64, 128x128 for higher resolution
- Use consistent sizing across all textures

## Usage
Textures are automatically loaded by the `getBlockTexture()` function in `blockTypes.js`.
If a texture file is not found, the system will fall back to using solid colors.

## Adding New Textures
1. Save the texture file in this directory with the correct name
2. The texture will be automatically available in the voxel editor
3. No code changes required for basic texture loading

## Texture Sources
- Official Minecraft textures (ensure proper licensing)
- Custom textures created for this project
- Community-created texture packs (with permission)

## Future Enhancements
- Support for animated textures
- Texture atlasing for performance
- Multiple texture pack support
- Texture variation/randomization
- Normal maps and PBR materials
