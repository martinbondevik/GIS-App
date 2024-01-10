import React, { useState, ChangeEvent } from 'react';
import { Button, Input, Select, Alert } from 'antd';
import buffer from '@turf/buffer'; // Importing buffer function from Turf.js for geospatial buffering
import { FeatureCollection, Geometry } from 'geojson'; // Importing GeoJSON types for spatial data handling
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 to generate unique identifiers

const { Option } = Select;

interface Layer {
  id: string;
  data: FeatureCollection;
  visible: boolean;
  color: string;
  name?: string;
}

interface BufferFunctionProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}

const BufferFunction: React.FC<BufferFunctionProps> = ({ layers, setLayers }) => {
  // State for selected layer, buffer radius and name of new buffered layer
  const [selectedLayerId, setSelectedLayerId] = useState<string>('');
  const [bufferRadius, setBufferRadius] = useState<number>(0);
  const [name, setName] = useState<string>('Buffered Layer');

  const handleBuffer = () => {
    const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
    if (!selectedLayer) return;

    // Creating a buffer for the selected layer using Turf.js buffer function
    const buffered = buffer(selectedLayer.data, bufferRadius, { units: 'meters' });

    // Creating a new layer with the buffered data
    const newLayer: Layer = {
      id: uuidv4(), // Generating a unique ID for the new layer
      name,
      data: buffered,
      visible: true,
      color: '#008080', // Default color for the new layer
    };

    // Updating the layers array to include the new buffered layer
    setLayers([...layers, newLayer]);
  };

  return (
    <div>
      {/* Layer selection dropdown */}
      <label htmlFor="buf">Select layer:</label>
      <Select id="buf" value={selectedLayerId} onChange={(e) => setSelectedLayerId(e)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => (
          <Option key={layer.id} value={layer.id}>{layer.name}</Option>
        ))}
      </Select>

      {/* Input field for buffer radius */}
      <label htmlFor="bufrad">Select buffer radius (m):</label>
      <Input id="bufrad" type="number" placeholder="Buffer radius in meters" value={bufferRadius} onChange={(e) => setBufferRadius(Number(e.target.value))} style={{ width: '100%', marginBottom: 10 }} />

      {/* Input field for naming the new buffered layer */}
      <label htmlFor="bufN">Name of the new layer:</label>
      <Input id="bufN" placeholder="Name of output layer" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />

      {/* Button to trigger buffer creation */}
      <Button onClick={handleBuffer} type="primary" style={{ width: '100%', marginBottom: 10 }} >Create Buffer</Button>
    </div>
  );
};

export default BufferFunction;
