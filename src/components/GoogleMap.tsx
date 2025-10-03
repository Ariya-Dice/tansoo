// src/components/GoogleMap.tsx
'use client'

import { useEffect, useRef } from 'react'

// Using global google maps types at runtime; avoid importing TS types as module


// Define the shape of the google object (simplified)
interface GoogleMapsAPI {
  maps: {
    Map: new (mapDiv: HTMLDivElement, options: google.maps.MapOptions) => google.maps.Map;
    Marker: new (options: google.maps.MarkerOptions) => google.maps.Marker;
    Geocoder: new () => google.maps.Geocoder;
    marker?: {
      AdvancedMarkerElement: new (options: google.maps.marker.AdvancedMarkerElementOptions) => google.maps.marker.AdvancedMarkerElement;
    };
  };
}

// Extend Window interface to include google object
declare global {
  interface Window {
    google?: GoogleMapsAPI;
  }
}

interface GoogleMapProps {
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  className?: string
  address?: string
}

export function GoogleMap({ center, zoom = 15, className = '', address }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <div class="text-center">
              <div class="text-gray-500 mb-2">📍</div>
              <p class="text-gray-600">نقشه فروشگاه</p>
              <p class="text-xs text-gray-400 mt-2">کلید Google Maps تنظیم نشده است</p>
            </div>
          </div>
        `
      }
      return
    }

    const loadScriptOnce = () => {
      if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
      // Use the typed window object
      if (window.google?.maps) return Promise.resolve()
      const existing = document.getElementById('gmaps-js') as HTMLScriptElement | null
      if (existing) {
        return new Promise<void>((resolve, reject) => {
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject(new Error('Script load error')))
        })
      }
      const script = document.createElement('script')
      script.id = 'gmaps-js'
      // Note: Added 'marker' library here for AdvancedMarkerElement compatibility
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places,marker` 
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      return new Promise<void>((resolve, reject) => {
        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () => reject(new Error('Script load error')))
      })
    }

    loadScriptOnce().then(() => {
      try {
        if (!mapRef.current || !window.google) return
        
        // Use the typed window.google object
        const google = window.google
        
        const map: google.maps.Map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        })

        const addMarker = (position: google.maps.LatLngLiteral) => {
          if (google.maps.marker?.AdvancedMarkerElement) {
            new google.maps.marker.AdvancedMarkerElement({
              position,
              map,
              title: 'فروشگاه تانسو',
            })
          } else {
            // Deprecated Marker API
            new google.maps.Marker({ 
              position, 
              map,
              title: 'فروشگاه تانسو' 
            })
          }
        }

        if (address) {
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ address }).then((result) => {
            const first = result.results?.[0]
            if (!first) return
            const loc = first.geometry.location as google.maps.LatLng | google.maps.LatLngLiteral
            let pos: google.maps.LatLngLiteral
            if (typeof (loc as google.maps.LatLngLiteral).lat === 'number') {
              pos = loc as google.maps.LatLngLiteral
            } else {
              const ll = loc as google.maps.LatLng
              pos = { lat: ll.lat(), lng: ll.lng() }
            }
            
            map.setCenter(pos)
            addMarker(pos)
          }).catch((err) => {
            console.error('Geocode error:', err)
            addMarker(center)
          })
        } else {
          addMarker(center)
        }
      } catch (err) {
        console.error('Error initializing Google Map:', err)
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <div class="text-center">
                <div class="text-gray-500 mb-2">📍</div>
                <p class="text-gray-600">فروشگاه بر روی نقشه</p>
                <p class="text-xs text-gray-400 mt-2">خطا در بارگذاری نقشه</p>
              </div>
            </div>
          `
        }
      }
    }).catch((err) => {
      console.error('Error loading Google Maps script:', err)
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <div class="text-center">
              <div class="text-gray-500 mb-2">📍</div>
              <p class="text-gray-600">فروشگاه بر روی نقشه</p>
              <p class="text-xs text-gray-400 mt-2">خطا در بارگذاری نقشه</p>
            </div>
          </div>
        `
      }
    })
  }, [center, zoom, address])

  return (
    <div className={`w-full h-96 rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}