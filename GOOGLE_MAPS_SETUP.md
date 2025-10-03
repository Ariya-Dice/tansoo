# Google Maps Setup Instructions

## Getting a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced functionality)
4. Go to "Credentials" and create a new API key
5. Restrict the API key to your domain for security

## Setting up the API Key

1. Copy your API key
2. Open the `.env` file in your project root
3. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
```

## Important Notes

- The API key must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Make sure to restrict your API key to prevent unauthorized usage
- The map will show a fallback placeholder if the API key is not set or invalid

## Store Location

The map is configured to show the store location at:
- **Address**: تهران، خیابان ولیعصر، پلاک 123، طبقه دوم، واحد 5
- **Coordinates**: 35.7219, 51.3347 (Tehran, Iran)

You can update these coordinates in `src/app/contact/page.tsx` if needed.
