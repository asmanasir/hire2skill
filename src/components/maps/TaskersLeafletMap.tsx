'use client'

import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

type TaskerLite = {
  id: string
  display_name: string
  location: string
  latitude?: number | null
  longitude?: number | null
}

export type LeafletMapPin = {
  key: string
  label: string
  items: TaskerLite[]
  center: [number, number]
  positions: { tasker: TaskerLite; latlng: [number, number] }[]
}

function clusterDivIcon(count: number, ringColor: string) {
  return L.divIcon({
    className: 'tasker-map-cluster-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 8px;border-radius:9999px;background:#171717;color:#fff;font-size:11px;font-weight:800;box-shadow:0 0 0 2px ${ringColor},0 4px 12px rgba(0,0,0,0.22);">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function FitMapToPoints({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) {
      map.setView([65.2, 12.5], 5)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], 10)
      return
    }
    const b = L.latLngBounds(points as LatLngExpression[])
    if (b.isValid()) {
      map.fitBounds(b, { padding: [52, 52], maxZoom: 11 })
    }
  }, [map, points])
  return null
}

export function TaskersLeafletMap({
  pins,
  clusterMin,
  ringColor,
  activePinKey,
  focusedTaskerId,
  onClusterClick,
  onTaskerClick,
}: {
  pins: LeafletMapPin[]
  clusterMin: number
  ringColor: string
  activePinKey: string | null
  focusedTaskerId: string | null
  onClusterClick: (key: string) => void
  onTaskerClick: (id: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const allPoints = useMemo(
    () =>
      pins.flatMap(p =>
        p.items.length >= clusterMin ? [p.center] : p.positions.map(x => x.latlng),
      ),
    [pins, clusterMin],
  )

  if (!mounted) {
    return <div className="h-full min-h-[420px] w-full animate-pulse bg-neutral-200/80" aria-hidden />
  }

  return (
    <MapContainer
      center={[65.2, 12.5]}
      zoom={5}
      className="z-0 h-full w-full min-h-[420px]"
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <FitMapToPoints points={allPoints} />
      {pins.map(pin => {
        if (pin.items.length >= clusterMin) {
          const open = activePinKey === pin.key && !focusedTaskerId
          return (
            <Marker
              key={pin.key}
              position={pin.center}
              icon={clusterDivIcon(pin.items.length, ringColor)}
              title={`${pin.items.length} · ${pin.label}`}
              eventHandlers={{
                click: () => {
                  onClusterClick(pin.key)
                },
              }}
              zIndexOffset={open ? 800 : 400}
            />
          )
        }
        return pin.positions.map(({ tasker, latlng }) => {
          const selected = focusedTaskerId === tasker.id
          return (
            <CircleMarker
              key={tasker.id}
              center={latlng}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: ringColor,
                weight: selected ? 3 : 2,
                fillColor: '#171717',
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => {
                  onTaskerClick(tasker.id)
                },
              }}
            />
          )
        })
      })}
    </MapContainer>
  )
}
