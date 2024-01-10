import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox GL CSS for map styling

// Interface for the Layer data structure
interface Layer {
  id: string;
  data: any; // GeoJSON data
  visible: boolean;
  color: string;
}

// Props for the MapboxComponent
interface MapboxComponentProps {
  accessToken: string; // Mapbox access token
  styleUrl: string; // URL for the map style
  center: [number, number]; // Center coordinates of the map
  zoom: number; // Zoom level
  layers: Layer[]; // Array of layers to be displayed on the map
}

const MapboxComponent: React.FC<MapboxComponentProps> = ({ accessToken, styleUrl, center, zoom, layers }) => {
  // References for the map container and the Mapbox map instance
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Effect hook for initializing and setting up the map
  useEffect(() => {
    // Set the Mapbox access token
    mapboxgl.accessToken = accessToken;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: styleUrl,
      center,
      zoom
    });

    // On map load, add the layers
    map.current.on('load', () => {
      layers.forEach(layer => {
        // Check if the source already exists
        if (!map.current?.getSource(layer.id)) {
          // Add a new source with GeoJSON data
          map.current?.addSource(layer.id, {
            type: 'geojson',
            data: layer.data
          });

          // Determine the type of layer based on geometry
          const geometryType = layer.data.features[0]?.geometry.type;
          let layerType: 'fill' | 'circle' | 'line';
          switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
              layerType = 'circle';
              break;
            case 'LineString':
            case 'MultiLineString':
              layerType = 'line';
              break;
            case 'Polygon':
            case 'MultiPolygon':
            default:
              layerType = 'fill';
              break;
          }

          // Add the layer to the map with specific styling
          map.current?.addLayer({
            id: layer.id,
            type: layerType,
            source: layer.id,
            paint: {
              [`${layerType}-color`]: layer.color,
              [`${layerType}-opacity`]: layer.visible ? 0.6 : 0
            }
          });
        }
      });
    });

    // Cleanup function to remove the map
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [accessToken, styleUrl, center, zoom, layers]); // Dependencies for the effect

  // Effect hook to update layers dynamically
  useEffect(() => {
    if (map.current) {
      layers.forEach(layer => {
        // Get the source and update data
        const source = map.current?.getSource(layer.id) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(layer.data);

          // Determine the paint type based on geometry
          const geometryType = layer.data.features[0]?.geometry.type;
          let paintType: 'fill' | 'circle' | 'line';
          switch (geometryType) {
            case 'Point':
            case 'MultiPoint':
              paintType = 'circle';
              break;
            case 'LineString':
            case 'MultiLineString':
              paintType = 'line';
              break;
            case 'Polygon':
            case 'MultiPolygon':
            default:
              paintType = 'fill';
              break;
          }

          // Update the layer's paint properties
          map.current?.setPaintProperty(layer.id, `${paintType}-color`, layer.color);
          map.current?.setPaintProperty(layer.id, `${paintType}-opacity`, layer.visible ? 0.6 : 0);
          map.current?.setLayoutProperty(layer.id, 'visibility', layer.visible ? 'visible' : 'none');
        }
      });
    }
  }, [layers]); // Dependencies for the effect

  // Render the map container
  return <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />;
};

export default MapboxComponent;
