# Movie Log - Project Map

This document maps out the entire structure of the `movie-log` project, which is a React JS Single Page Application bundled as an Electron desktop app using Vite, utilizing Tailwind CSS for styling and Firebase for backend synchronization and authentication.

## Core Configuration & Root Files
- `/package.json`: Project metadata, dependencies, and build scripts (Vite, Electron, etc.).
- `/vite.config.js`: Configuration for the Vite bundler.
- `/tailwind.config.cjs`: Configuration for Tailwind CSS styling.
- `/postcss.config.cjs`: PostCSS config.
- `/eslint.config.js`: ESLint configuration for code quality.
- `/index.html`: The main HTML template for the web app.

## Electron Layer (`/electron`)
Responsible for wrapping the web app into a desktop executable.
- `main.cjs`: The main process entry point, creates the browser window and manages app lifecycle.
- `preload.cjs`: Preload script to safely expose internal desktop APIs to the renderer process (React app).

## React Application Layer (`/src`)
The main source code for the frontend UI and logic.

### Entry Points
- `main.jsx`: Initializes the React tree and mounts it to the DOM (index.html).
- `App.jsx`: The root React component laying out main structural elements (sidebar, routing).
- `App.css`, `index.css`: Global styles, including Tailwind base imports and responsive design rules.

### UI Components (`/src/components`)
Reusable UI pieces across the app.
- `MediaCard.jsx`, `MediaGridCard.jsx`, `SearchResultCard.jsx`: Components for displaying individual movie/show cards.
- `MovieRow.jsx`, `WatchedRow.jsx`, `WatchedRowV2.jsx`, `WishlistRow.jsx`: Horizontal rows or specific table models for media items.
- `SearchResultsGrid.jsx`: Layout component for searching.
- `Header.jsx`, `Sidebar.jsx`: Main navigation components.
- `FilterBar.jsx`, `ViewToggle.jsx`: Sorting/filtering UX.
- `ProfilePanel.jsx`, `StatsPanel.jsx`: User insights and profile info.
- `ApiKeyHelpModal.jsx`, `SettingsModal.jsx`: Modals.
- `ShowDetailPage.jsx`: Extended details for media.
- `HelpIcon.jsx`, `PageWrapper.jsx`: Utility/layout wrappers.

### Pages (`/src/pages`)
Major views rendering in the main app area.
- `AllPage.jsx`: View all logged movies.
- `WatchlistPage.jsx`: View "watched" items.
- `WishlistPage.jsx`: View "wishlist" items.
- `InsightsPage.jsx`: Insights and statistics dashboard.

### Services (`/src/services`)
External API integrations.
- `tmdbClient.js`, `tmdbService.js`: Integration with The Movie Database (TMDB) API for fetching metadata, posters, etc.

### State & Context (`/src/state`, `/src/context`)
Global state management spanning across components.
- `AuthContext.jsx`: React Context for Firebase user authentication state.
- `useMediaStore.js`: Custom hook (likely Zustand or standard Context) for managing the global media library in-memory.

### Database & Sync (`/src/firebase`, `/src/sync`, `/src/storage`)
Local storage, cloud database logic, and the synchronization layer linking them together.
- **Firebase Core** (`/src/firebase/`):
  - `firebase.js`: Firebase app initialization.
  - `auth.js`, `firestore.js`: Wrappers for specific Firebase services.
  - `config.md`: Notes on Firebase configuration setup.
- **Local Storage** (`/src/storage/`):
  - `localStore.js`: Handling offline persistence (likely using IndexedDB or localStorage).
- **Synchronization Logic** (`/src/sync/`):
  - `libraryService.js`: Master service handling library CRUD operations.
  - `firestoreAdapter.js`: Translates generic queries to Firestore-specific logic.
  - `mergeRules.js`: Resolving conflicts during offline->online synchronization.
  - `migration.js`: Schema migration handling.
  - `sanitizers.js`: Cleaning up data payloads before saving.

### Utilities (`/src/utils`)
Helper functions.
- `ImportExport.js`: Logic to handle importing/exporting user library data (JSON/CSV).
- `stats.js`: Calculations for user view statistics.
- `constants.js`: System-wide constants.
- `uuid.js`: Unique ID generation.
