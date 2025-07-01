# OZ Dashboard

A comprehensive Opportunity Zone (OZ) dashboard built with Next.js that helps users analyze and interact with Opportunity Zone data across the United States.

## Features

- **Interactive OZ Map Visualization**: Explore Opportunity Zones on an interactive map
- **Development Location Checker**: Protected feature to check if a specific address or coordinates fall within an Opportunity Zone
- **Investment Insights**: Comprehensive analytics and KPIs for Opportunity Zone investments
- **User Authentication**: Secure login with Supabase and Google OAuth
- **Responsive Design**: Modern, mobile-friendly interface with dark/light theme support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Google Maps API key (for address autocomplete and geocoding)
- Supabase project (for authentication)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oz-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Setup

### Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API (New)** - Make sure to enable the NEW version, not the legacy one
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the key to your `.env.local` file

**Important**: Make sure you enable the **Places API (New)** and not the legacy "Places API". The legacy version is deprecated and will cause errors.

### Supabase Setup

Follow the authentication setup guide in `docs/SETUP_AUTH.md` for detailed Supabase configuration instructions.

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/data` - Static data and mock data
- `/src/services` - API services and data processing
- `/public/data` - GeoJSON and map data files
- `/docs` - Documentation files

## Key Features

### Development Location Checker (`/check-development`)

A protected route that allows authenticated users to:
- Enter an address with Google Places autocomplete
- Input coordinates directly
- Check if the location falls within an Opportunity Zone
- View detailed OZ information including census tract, state, and county data

The feature uses:
- Client-side processing with Turf.js for geospatial calculations
- 1MB compressed GeoJSON data for fast performance
- Google Places API for address autocomplete
- Google Geocoding API for address-to-coordinate conversion

## Technologies Used

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Maps & Geocoding**: Google Maps API
- **Geospatial Processing**: Turf.js
- **Data Visualization**: Chart.js, D3.js
- **State Management**: Zustand
- **UI Components**: Heroicons, Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the linter: `npm run lint`
5. Submit a pull request

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new):

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

For other deployment options, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## License

[Add your license here]
