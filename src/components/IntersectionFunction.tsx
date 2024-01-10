import React, { useState, ChangeEvent, FC } from 'react';
import { Button, Select, Input, Alert } from 'antd';
import intersect from '@turf/intersect'; // Turf.js function for finding intersections
import booleanIntersects from '@turf/boolean-intersects'; // Turf.js function to check if two features intersect
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson'; // GeoJSON types for spatial data
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const { Option } = Select;

// Layer interface for the GIS layers
interface Layer {
  id: string;
  data: FeatureCollection;
  visible: boolean;
  color: string;
  name?: string;
}

// Props interface for the IntersectionFunction component
interface IntersectionFunctionProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}

// Functional Component for handling the intersection of layers
const IntersectionFunction: FC<IntersectionFunctionProps> = ({ layers, setLayers }) => {
  // State hooks for selected layers, new layer name, and error handling
  const [selectedLayer1, setSelectedLayer1] = useState<string>('');
  const [selectedLayer2, setSelectedLayer2] = useState<string>('');
  const [name, setName] = useState<string>('New layer');
  const [error, setError] = useState<string>('');

  // Function to handle intersection logic
  const handleIntersection = () => {
    const layer1 = layers.find(layer => layer.id === selectedLayer1);
    const layer2 = layers.find(layer => layer.id === selectedLayer2);

    // Error handling for layer selection
    if (!layer1 || !layer2) {
      setError('Please select two valid layers.');
      return;
    }

    // Initialize an empty FeatureCollection for intersection results
    const intersectionResult: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    // Loop through each feature in both layers to find intersections
    layer1.data.features.forEach(feature1 => {
      layer2.data.features.forEach(feature2 => {
        if (booleanIntersects(feature1, feature2)) {
          // Check if both features are polygons before finding intersection
          if ((feature1.geometry.type === 'Polygon' || feature1.geometry.type === 'MultiPolygon') &&
              (feature2.geometry.type === 'Polygon' || feature2.geometry.type === 'MultiPolygon')) {
            const intersection = intersect(feature1.geometry, feature2.geometry);
            if (intersection) {
              // Add the intersected feature to the result collection
              intersectionResult.features.push({
                ...intersection, 
                properties: { ...feature1.properties, ...feature2.properties }
              });
            }
          }
        }
      });
    });

    // Error handling if no intersections are found
    if (intersectionResult.features.length === 0) {
      setError('No intersections found.');
      return;
    }

    // Create a new layer with the intersection results
    const layerName = name.trim() !== '' ? name : `New Layer ${uuidv4().substring(0, 8)}`;
    const newLayer: Layer = {
      id: uuidv4(),
      name: layerName,
      data: intersectionResult,
      visible: true,
      color: '#FF8C00' // Default color for the new layer
    };

    // Update the layers state with the new layer
    setLayers([...layers, newLayer]);
  };

  // Event handlers for layer selection and name input
  const handleLayerChange1 = (value: string) => {
    setSelectedLayer1(value);
  };

  const handleLayerChange2 = (value: string) => {
    setSelectedLayer2(value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  // Component rendering
  return (
    <div>
      {/* Display error message if any */}
      {error && <Alert message={error} type="error" />}
      {/* Dropdown for selecting the first layer */}
      <label htmlFor="int1">Select first layer:</label>
      <Select id="int1" value={selectedLayer1} onChange={handleLayerChange1} style={{ width: '100%', marginBottom: 10 }} >
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.id}</Option>)}
      </Select>
      {/* Dropdown for selecting the second layer */}
      <label htmlFor="int2">Select second layer:</label>
      <Select id="int2" value={selectedLayer2} onChange={handleLayerChange2} style={{ width: '100%', marginBottom: 10 }} >
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.id}</Option>)}
      </Select>
      {/* Input field for naming the new intersection layer */}
      <label htmlFor="intN">Name of the new layer:</label>
      <Input 
        id="intN"
        placeholder="Layer Name" 
        value={name} 
        onChange={handleNameChange} 
        style={{ width: '100%', marginBottom: 10 }} 
      />
      {/* Button to execute the intersection operation */}
      <Button onClick={handleIntersection} type="primary" style={{ width: '100%', marginBottom: 10 }} >Intersect Layers</Button>
    </div>
  );
};

export default IntersectionFunction;
