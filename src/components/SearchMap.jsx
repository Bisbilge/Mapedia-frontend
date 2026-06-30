import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function SearchMap({ venues }) {
  const navigate = useNavigate()

  if (!venues.length) return null

  // Center on mean lat/lng
  const lat = venues.reduce((s, v) => s + parseFloat(v.latitude), 0) / venues.length
  const lng = venues.reduce((s, v) => s + parseFloat(v.longitude), 0) / venues.length

  return (
    <div style={{ height: 320, borderBottom: '1px solid var(--border)' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map(venue => (
          <Marker
            key={venue.id}
            position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
            icon={DefaultIcon}
          >
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong
                  style={{ cursor: 'pointer', color: '#0066cc' }}
                  onClick={() => navigate(`/venue/${venue.slug}`)}
                >
                  {venue.name}
                </strong>
                {(venue.city || venue.country) && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {[venue.city, venue.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default SearchMap
