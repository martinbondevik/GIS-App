import React, { useState, ChangeEvent } from 'react';
import { Button, Input, Select, Alert } from 'antd';
import buffer from '@turf/buffer';
import { FeatureCollection, Geometry } from 'geojson';
import { v4 as uuidv4 } from 'uuid';

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
  const [selectedLayerId, setSelectedLayerId] = useState<string>('');
  const [bufferRadius, setBufferRadius] = useState<number>(0);
  const [name, setName] = useState<string>('Buffered Layer');

  const handleBuffer = () => {
    const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
    if (!selectedLayer) return;

    const buffered = buffer(selectedLayer.data, bufferRadius, { units: 'meters' });
    const newLayer: Layer = {
      id: uuidv4(),
      name,
      data: buffered,
      visible: true,
      color: '#ff0000', // Default color or add color picker
    };
    setLayers([...layers, newLayer]);
  };

  return (
    <div>
      <Select value={selectedLayerId} onChange={(e) => setSelectedLayerId(e)} style={{ width: '100%', marginBottom: 10 }}>
        {layers.map(layer => (
          <Option key={layer.id} value={layer.id}>{layer.name}</Option>
        ))}
      </Select>
      <Input type="number" placeholder="Buffer radius in meters" value={bufferRadius} onChange={(e) => setBufferRadius(Number(e.target.value))} style={{ width: '100%', marginBottom: 10 }} />
      <Input placeholder="Name of output layer" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      <Button onClick={handleBuffer} type="primary">Create Buffer</Button>
    </div>
  );
};

export default BufferFunction;
