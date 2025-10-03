'use client'

import { useEffect, useRef } from 'react'

interface GoogleMapProps {
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  className?: string
}

export function GoogleMap({ center, zoom = 15, className = '' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initMap = () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && mapRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const google = window.google as any
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          })

          new google.maps.Marker({
            position: center,
            map,
            title: 'فروشگاه تانسو'
          })
        } else {
          // Fallback: show a placeholder
          if (mapRef.current) {
            mapRef.current.innerHTML = `
              <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                <div class="text-center">
                  <div class="text-gray-500 mb-2">📍</div>
                  <p class="text-gray-600">نقشه فروشگاه</p>
                  <p class="text-sm text-gray-500">تهران، خیابان ولیعصر، پلاک 123</p>
                  <p class="text-xs text-gray-400 mt-2">برای نمایش نقشه، API key Google Maps را تنظیم کنید</p>
                </div>
              </div>
            `
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        // Fallback: show a placeholder if Google Maps fails to load
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <div class="text-center">
                <div class="text-gray-500 mb-2">📍</div>
                <p class="text-gray-600">نقشه فروشگاه</p>
                <p class="text-sm text-gray-500">تهران، خیابان ولیعصر، پلاک 123</p>
              </div>
            </div>
          `
        }
      }
    }

    // Try to load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => {
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <div class="text-center">
                <div class="text-gray-500 mb-2">📍</div>
                <p class="text-gray-600">نقشه فروشگاه</p>
                <p class="text-sm text-gray-500">تهران، خیابان ولیعصر، پلاک 123</p>
                <p class="text-xs text-gray-400 mt-2">خطا در بارگذاری نقشه</p>
              </div>
            </div>
          `
        }
      }
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [center, zoom])

  return (
    <div className={`w-full h-96 rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}