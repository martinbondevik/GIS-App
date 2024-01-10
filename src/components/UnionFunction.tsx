import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';
import union from '@turf/union';
import { FeatureCollection, Polygon, MultiPolygon, Feature, Geometry } from 'geojson';

const { Option } = Select;

// Layer interface defines the structure for each layer in the application
interface Layer {
  id: string;
  data: FeatureCollection<Geometry>;
  visible: boolean;
  color: string;
  name?: string;
}

// Props interface for the UnionFunction component
interface UnionFunctionProps {
  layers: Layer[];  // Array of layers available in the application
  setLayers: (layers: Layer[] | ((prevLayers: Layer[]) => Layer[])) => void;  // Function to update the layers
}

// UnionFunction component for creating a union of two selected layers
const UnionFunction: React.FC<UnionFunctionProps> = ({ layers, setLayers }) => {
  // State variables to store the IDs of the selected layers and the name for the new union layer
  const [selectedLayer1, setSelectedLayer1] = useState<string>('');
  const [selectedLayer2, setSelectedLayer2] = useState<string>('');
  const [name, setName] = useState<string>('New Union Layer');

  // Function to handle the union operation
  const handleUnion = () => {
    // Finding the selected layers based on their IDs
    const layer1 = layers.find(layer => layer.id === selectedLayer1);
    const layer2 = layers.find(layer => layer.id === selectedLayer2);

    // Ensure both layers are selected and have features
    if (layer1 && layer2 && layer1.data.features.length && layer2.data.features.length) {
      const feature1 = layer1.data.features[0];
      const feature2 = layer2.data.features[0];

      // Check if the features are Polygons or MultiPolygons
      if ((feature1.geometry.type === 'Polygon' || feature1.geometry.type === 'MultiPolygon') &&
          (feature2.geometry.type === 'Polygon' || feature2.geometry.type === 'MultiPolygon')) {
        // Perform the union operation
        const unionResult = union(feature1.geometry as Polygon | MultiPolygon, feature2.geometry as Polygon | MultiPolygon);
        
        // If a union result is obtained, create a new layer
        if (unionResult) {
          const newLayer: Layer = {
            id: `union-${Date.now()}`,
            name,
            data: { type: 'FeatureCollection', features: [unionResult as Feature<Geometry>] },
            visible: true,
            color: '#708090', // Default color for the union layer
          };
          // Update the layers state with the new layer
          setLayers(prevLayers => [...prevLayers, newLayer]);
        }
      }
    }
  };

  return (
    <div>
      {/* Dropdown for selecting the first layer */}
      <label htmlFor="union1">Select first layer:</label>
      <Select id="union1" value={selectedLayer1} onChange={value => setSelectedLayer1(value)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.name}</Option>)}
      </Select>
      {/* Dropdown for selecting the second layer */}
      <label htmlFor="union2">Select second layer:</label>
      <Select id="union2" value={selectedLayer2} onChange={value => setSelectedLayer2(value)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.name}</Option>)}
      </Select>
      {/* Input field for naming the new union layer */}
      <label htmlFor="unionN">Name of the new layer:</label>
      <Input id="unionN" placeholder="Name of Union Layer" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      {/* Button to trigger the union operation */}
      <Button onClick={handleUnion} type="primary" style={{ width: '100%' }}>Create Union Layer</Button>
    </div>
  );
};

export default UnionFunction;
