# UIB INFO212 System Development Project, made with Lovable

## Project info

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Leaflet (for maps)
- Yelp Fusion API (for bar data)

## 🔑 Setup

1. Get a free Yelp API key: https://www.yelp.com/developers/v3/manage_app
2. Copy `.env.example` to `.env`
3. Add your Yelp API key to `.env`
4. Run `npm run dev`

See `YELP_SETUP.md` for detailed setup instructions.
