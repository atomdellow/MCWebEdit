# MCWebEdit Texture System

This document explains how to set up and use textures in MCWebEdit.

## Quick Start

To download all block textures automatically:

```bash
npm run textures:download
```

This will download 100+ block textures from the Minecraft Wiki and place them in the correct directory.

## How It Works

### Texture Loading
- MCWebEdit automatically tries to load textures from `/assets/textures/blocks/`
- Texture files should be named using the block ID without the `minecraft:` prefix
- For example: `minecraft:stone` → `stone.png`

### Directory Structure
```
client/public/assets/textures/blocks/
├── stone.png
├── grass_block.png
├── dirt.png
├── oak_planks.png
├── ...
└── texture-status.json  (generated report)
```

### Supported Blocks
The texture downloader supports all major Minecraft blocks including:

#### Building Blocks
- Stone variants (stone, granite, diorite, andesite)
- Wood planks and logs (all 6 types)
- Sandstone variants
- Stone bricks and variants
- Glass and colored glass

#### Natural Blocks
- Grass, dirt, sand, gravel
- Leaves (all types, transparent)
- Ice, snow, clay
- Ores (coal, iron, gold, diamond, etc.)

#### Decorative Blocks
- All 16 wool colors
- All 16 terracotta colors
- All 16 concrete colors
- Bricks, cobblestone, obsidian
- Prismarine variants

#### Special Blocks
- Nether blocks (netherrack, soul sand, glowstone)
- End blocks (end stone, purpur)
- Utility blocks (crafting table, bookshelf, etc.)

## Manual Usage

### Running the Downloader
```bash
# Download textures (skip existing)
npm run textures:download

# Re-download all textures (overwrite existing)
npm run textures:download:force

# Or run directly
node scripts/downloadTextures.js
node scripts/downloadTextures.js --force
```

### Enabling Textures in MCWebEdit
1. Open MCWebEdit in your browser
2. In the 3D viewport, look for texture settings
3. Enable "Use Block Textures"
4. Textures will automatically load for supported blocks

### Fallback Behavior
- If a texture file is missing, MCWebEdit falls back to solid colors
- The fallback colors are defined in `client/src/utils/blockTypes.js`
- This ensures all blocks are always visible, even without textures

## Adding Custom Textures

### Method 1: Add to the Downloader
1. Edit `scripts/downloadTextures.js`
2. Add your block mapping to `TEXTURE_MAPPINGS`
3. Run the downloader

### Method 2: Manual Addition
1. Create a 16x16 PNG file
2. Name it using the block ID: `minecraft:block_name` → `block_name.png`
3. Place it in `client/public/assets/textures/blocks/`

### Texture Requirements
- **Size**: 16x16 pixels (classic Minecraft size)
- **Format**: PNG with transparency support
- **Style**: Pixel art compatible with Minecraft aesthetic

## Troubleshooting

### Common Issues

**Textures not loading:**
- Check browser console for 404 errors
- Verify texture files exist in the correct directory
- Ensure filenames match exactly (case-sensitive)

**Download failures:**
- Some wiki URLs may change over time
- Network issues or rate limiting
- Re-run the downloader to retry failed downloads

**Performance issues:**
- Large numbers of textures may impact performance
- Consider reducing visible blocks in large models
- Use solid colors for better performance on slower devices

### Texture Status Report
After running the downloader, check `texture-status.json` for:
- Which textures were successfully downloaded
- Which textures failed and why
- Overall download statistics

## Technical Details

### Wiki Image URLs
The downloader fetches textures from the Minecraft Wiki using their static asset URLs:
- Base URL: `https://static.wikia.nocookie.net/minecraft_gamepedia/images/`
- URL pattern: `{base}/{first_char}/{first_two_chars}/{filename}`

### Texture Mapping
The `TEXTURE_MAPPINGS` object in the downloader maps:
- MCWebEdit block IDs (`minecraft:stone`)
- Wiki texture filenames (`Stone_(texture)_JE5_BE3.png`)

This allows us to automatically download the correct texture for each block.

### Caching
- Downloaded textures are cached locally
- Re-running the downloader skips existing files
- Use `--force` flag to re-download everything

## Future Enhancements

Planned improvements to the texture system:

### Animated Textures
- Water, lava, and portal animations
- Texture atlas support for performance

### High Resolution Support
- 32x32 and 64x64 texture packs
- Automatic scaling based on performance

### Texture Pack System
- Multiple texture pack support
- User-uploadable texture packs
- Texture pack switching in UI

### Advanced Features
- Normal maps and PBR textures
- Custom block models
- Biome-specific texture variants

## Contributing

To add support for new blocks:

1. Add the block to `blockTypes.js` with ID and color
2. Add texture mapping to `downloadTextures.js`
3. Test the download and rendering
4. Submit a pull request

For texture-related issues or suggestions, please open an issue on GitHub.

---

**Note**: This texture system respects the Minecraft Wiki's content policies and downloads are used for educational/development purposes. Please ensure compliance with relevant licensing terms when distributing texture packs.
