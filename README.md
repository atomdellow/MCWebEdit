# MC Web Edit

A collaborative browser-based voxel editor for Minecraft Java Edition with World-Edit schematic support.

## Features

- 🧱 **3D Voxel Editing**: Interactive Three.js-powered 3D editor
- 🤝 **Real-time Collaboration**: Multiple users can edit simultaneously via Socket.io
- 📁 **Schematic Import/Export**: Support for WorldEdit .schem and .schematic files
- 🎨 **Block Palette**: Complete set of Minecraft blocks
- 🕹️ **RTS-style Controls**: Intuitive camera controls for navigation
- 💬 **Built-in Chat**: Communicate with collaborators
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **Socket.io** - Real-time communication
- **MongoDB** + **Mongoose** - Database and ODM
- **prismarine-nbt** - NBT file parsing for Minecraft schematics

### Frontend
- **Vue 3** + **Vite** - Frontend framework and build tool
- **Pinia** - State management
- **Three.js** - 3D rendering
- **Socket.io Client** - Real-time communication

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MCWebEdit
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment**
   ```bash
   # Copy server environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your settings:
   # - MongoDB connection string
   # - Port configuration
   # - CORS settings
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both the backend server (port 3001) and frontend development server (port 5173).

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### Creating a New Model
1. Click "Create New" on the home page
2. Set dimensions (width × height × length)
3. Enter a name and description
4. Click "Create" to open the editor

### Importing Schematics
1. Click "Choose File" on the home page
2. Select a `.schem` or `.schematic` file
3. Optionally customize the name and description
4. Click "Import" to open in the editor

### Editor Controls
- **Mouse**: Click and drag to rotate camera
- **Mouse Wheel**: Zoom in/out
- **WASD**: Pan camera horizontally
- **QE**: Move camera up/down
- **Left Click**: Place selected block
- **Right Click**: Remove block

### Collaboration
- Multiple users can join the same model by sharing the URL
- Real-time block updates are synchronized automatically
- Use the chat panel to communicate with other users
- See active users in the top-right corner

### Exporting
1. Click the "Export" button in the editor
2. A `.schem` file will be downloaded
3. Import into WorldEdit or other compatible tools

## Project Structure

```
MCWebEdit/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
├── client/                 # Frontend Vue.js application
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia stores
│   │   ├── services/      # API and Socket services
│   │   └── utils/         # Utility functions
│   └── package.json
└── package.json           # Root workspace configuration
```

## API Endpoints

### Schematic Operations
- `POST /api/schematic/upload-schematic` - Upload and parse schematic file
- `GET /api/schematic/model/:id` - Get model data
- `PUT /api/schematic/model/:id` - Update model
- `POST /api/schematic/export-schematic/:id` - Export as schematic
- `GET /api/schematic/models` - List all models
- `POST /api/schematic/create-empty` - Create new empty model
- `DELETE /api/schematic/model/:id` - Delete model
- `POST /api/schematic/model/:id/block` - Set individual block

### Real-time Events (Socket.io)
- `join-model` - Join editing session
- `leave-model` - Leave editing session
- `block-change` - Block placement/removal
- `bulk-operation` - Multi-block operations
- `cursor-update` - Cursor position updates
- `chat-message` - Chat messages

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [WorldEdit](https://worldedit.enginehub.org/) for the schematic file format
- [PrismarineJS](https://github.com/PrismarineJS) for NBT parsing
- [Three.js](https://threejs.org/) for 3D rendering
- [Vue.js](https://vuejs.org/) for the reactive frontend framework
