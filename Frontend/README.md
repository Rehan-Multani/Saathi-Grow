## Saathi Grow Frontend API configuration

The frontend uses a single environment-driven base URL for all API calls to the backend.

- **Env variable**: `VITE_API_URL`
- **Default dev example**: see `.env.example` in this folder.
- **Usage in code**: imported via `API_BASE_URL` from `src/config/apiConfig.js` and then extended per module (e.g. `${API_BASE_URL}/auth`, `${API_BASE_URL}/admin/products`, etc.).

To point the frontend at a different backend (staging/production), set `VITE_API_URL` accordingly in your `.env` file and rebuild.
