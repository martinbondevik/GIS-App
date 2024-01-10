import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';
import { intersect } from '@turf/turf';
import { FeatureCollection, Geometry } from 'geojson';

const { Option } = Select;

// Defines the structure of each layer with its properties
interface Layer {
  id: string;
  data: FeatureCollection<Geometry>;
  visible: boolean;
  color: string;
  name?: string;
}

// Props for the ClipFunction component, including the layers and a function to set them
interface ClipFunctionProps {
  layers: Layer[];
  setLayers: (layers: Layer[] | ((prevLayers: Layer[]) => Layer[])) => void;
}

// The ClipFunction component
const ClipFunction: React.FC<ClipFunctionProps> = ({ layers, setLayers }) => {
  // State to store the IDs of the layers selected for clipping and the clip layer
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [clipLayerId, setClipLayerId] = useState<string>('');
  const [name, setName] = useState<string>('New Clipped Layer');

  // Function to handle the clip operation
  const handleClip = () => {
    const clipLayer = layers.find(layer => layer.id === clipLayerId);
    if (!clipLayer) return;
  
    selectedLayers.forEach(layerId => {
      const targetLayer = layers.find(layer => layer.id === layerId);
      if (targetLayer) {
        targetLayer.data.features.forEach(feature => {
          // Ensure both geometries are of type 'Polygon' or 'MultiPolygon'
          if ((feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
              (clipLayer.data.features[0].geometry.type === 'Polygon' || clipLayer.data.features[0].geometry.type === 'MultiPolygon')) {
  
            const clipped = intersect(feature.geometry, clipLayer.data.features[0].geometry);
            
            if (clipped) {
              const newLayer: Layer = {
                id: `${layerId}-clipped-${Date.now()}`,
                name: `${name} (${targetLayer.name})`,
                data: { type: 'FeatureCollection', features: [clipped] },
                visible: true,
                color: '#808000', // Default color for the clipped layer
              };
              setLayers(prevLayers => [...prevLayers, newLayer]);
            }
          }
        });
      }
    });
  };
  

  return (
    <div>
      {/* Dropdown for selecting multiple layers to clip */}
      <label htmlFor="clip">Select multiple layers to clip: </label>
      <Select
        id="clip"
        mode="multiple"
        value={selectedLayers}
        onChange={setSelectedLayers}
        style={{ width: '100%', marginBottom: 10 }}
      >
        {layers.map(layer => (
          <Option key={layer.id} value={layer.id}>{layer.name}</Option>
        ))}
      </Select>
      {/* Dropdown for selecting the clipping layer */}
      <label htmlFor="clipping">Select clipping layer:</label>
      <Select
        id="clipping"
        value={clipLayerId}
        onChange={setClipLayerId}
        style={{ width: '100%', marginBottom: 10 }}
      >
        {layers.map(layer => (
          <Option key={layer.id} value={layer.id}>{layer.name}</Option>
        ))}
      </Select>
      {/* Input field for naming the new clipped layer */}
      <label htmlFor="clipN">Name of the new layer:</label>
      <Input
        id="clipN"
        placeholder="Name of Clipped Layer"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      {/* Button to initiate the clipping operation */}
      <Button onClick={handleClip} type="primary" style={{ width: '100%' }}>Clip Layers</Button>
    </div>
  );
};

export default ClipFunction;
