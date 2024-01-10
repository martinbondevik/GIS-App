import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';
import difference from '@turf/difference';
import { FeatureCollection, Polygon, MultiPolygon, Feature, Geometry } from 'geojson';

const { Option } = Select;

// Layer interface to type each layer with id, data, visibility, color, and optional name
interface Layer {
  id: string;
  data: FeatureCollection<Geometry>;
  visible: boolean;
  color: string;
  name?: string;
}

// Props interface for the DifferenceFunction component
interface DifferenceFunctionProps {
  layers: Layer[];
  setLayers: (layers: Layer[] | ((prevLayers: Layer[]) => Layer[])) => void;
}

// The DifferenceFunction component
const DifferenceFunction: React.FC<DifferenceFunctionProps> = ({ layers, setLayers }) => {
  // State to track the IDs of the selected base and subtract layers, and the name for the new layer
  const [baseLayerId, setBaseLayerId] = useState<string>('');
  const [subtractLayerId, setSubtractLayerId] = useState<string>('');
  const [name, setName] = useState<string>('New Difference Layer');

  // Function to handle the difference calculation
  const handleDifference = () => {
    // Finding the selected layers from the state
    const baseLayer = layers.find(layer => layer.id === baseLayerId);
    const subtractLayer = layers.find(layer => layer.id === subtractLayerId);

    // Ensure both layers are selected and have features
    if (baseLayer && subtractLayer && baseLayer.data.features.length && subtractLayer.data.features.length) {
      const baseFeature = baseLayer.data.features[0];
      const subtractFeature = subtractLayer.data.features[0];

      // Check if the features are Polygon or MultiPolygon
      if ((baseFeature.geometry.type === 'Polygon' || baseFeature.geometry.type === 'MultiPolygon') &&
          (subtractFeature.geometry.type === 'Polygon' || subtractFeature.geometry.type === 'MultiPolygon')) {
        // Calculate the difference between the two features
        const differenceResult = difference(baseFeature.geometry as Polygon | MultiPolygon, subtractFeature.geometry as Polygon | MultiPolygon);
        
        // If a difference result is obtained, create a new layer
        if (differenceResult) {
          const newLayer: Layer = {
            id: `difference-${Date.now()}`,
            name,
            data: { type: 'FeatureCollection', features: [differenceResult as Feature<Geometry>] },
            visible: true,
            color: '#DC143C', // Default color for the difference layer
          };
          // Update the layers state with the new layer
          setLayers(prevLayers => [...prevLayers, newLayer]);
        }
      }
    }
  };

  return (
    <div>
      {/* Dropdown for selecting the base layer */}
      <label htmlFor="diffbase">Select base layer:</label>
      <Select id="diffbase" value={baseLayerId} onChange={value => setBaseLayerId(value)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.name}</Option>)}
      </Select>
      {/* Dropdown for selecting the subtract layer */}
      <label htmlFor="diffsub">Select subtract layer:</label>
      <Select id="diffsub" value={subtractLayerId} onChange={value => setSubtractLayerId(value)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.name}</Option>)}
      </Select>
      {/* Input field for naming the new difference layer */}
      <label htmlFor="diffN">Name of the new layer:</label>
      <Input id="diffN" placeholder="Name of Difference Layer" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      {/* Button to trigger the difference calculation */}
      <Button onClick={handleDifference} type="primary" style={{ width: '100%' }}>Create Difference Layer</Button>
    </div>
  );
};

export default DifferenceFunction;
