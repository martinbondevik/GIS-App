import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Layer {
  id: string;
  data: any;
  visible: boolean;
  color: string;
}

interface MapboxComponentProps {
  accessToken: string;
  styleUrl: string;
  center: [number, number];
  zoom: number;
  layers: Layer[];
}

const MapboxComponent: React.FC<MapboxComponentProps> = ({ accessToken, styleUrl, center, zoom, layers }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: styleUrl,
      center,
      zoom
    });

    map.current.on('load', () => {
      layers.forEach(layer => {
        if (!map.current?.getSource(layer.id)) {
          map.current?.addSource(layer.id, {
            type: 'geojson',
            data: layer.data
          });

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

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [accessToken, styleUrl, center, zoom, layers]);

  useEffect(() => {
    if (map.current) {
      layers.forEach(layer => {
        const source = map.current?.getSource(layer.id) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(layer.data);
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

          map.current?.setPaintProperty(layer.id, `${paintType}-color`, layer.color);
          map.current?.setPaintProperty(layer.id, `${paintType}-opacity`, layer.visible ? 0.6 : 0);
          map.current?.setLayoutProperty(layer.id, 'visibility', layer.visible ? 'visible' : 'none');
        }
      });
    }
  }, [layers]);

  return <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />;
};

export default MapboxComponent;
