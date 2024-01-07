import React, { useState, ChangeEvent, FC } from 'react';
import { Button, Select, Input, Alert } from 'antd';
import intersect from '@turf/intersect';
import booleanIntersects from '@turf/boolean-intersects';
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

interface Layer {
    id: string;
    data: FeatureCollection;
    visible: boolean;
    color: string;
    name?: string; // Adding name as an optional property
  }
  

interface IntersectionFunctionProps {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}


const IntersectionFunction: FC<IntersectionFunctionProps> = ({ layers, setLayers }) => {
  const [selectedLayer1, setSelectedLayer1] = useState<string>('');
  const [selectedLayer2, setSelectedLayer2] = useState<string>('');
  const [name, setName] = useState<string>('New layer');
  const [error, setError] = useState<string>('');

  const handleIntersection = () => {
    const layer1 = layers.find(layer => layer.id === selectedLayer1);
    const layer2 = layers.find(layer => layer.id === selectedLayer2);

    if (!layer1 || !layer2) {
      setError('Please select two valid layers.');
      return;
    }

    const intersectionResult: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    layer1.data.features.forEach(feature1 => {
        layer2.data.features.forEach(feature2 => {
          if (booleanIntersects(feature1, feature2)) {
            // Ensure both features are Polygon or MultiPolygon before calling intersect
            if ((feature1.geometry.type === 'Polygon' || feature1.geometry.type === 'MultiPolygon') &&
                (feature2.geometry.type === 'Polygon' || feature2.geometry.type === 'MultiPolygon')) {
              const intersection = intersect(feature1.geometry, feature2.geometry);
              if (intersection) {
                intersectionResult.features.push({
                  ...intersection, 
                  properties: { ...feature1.properties, ...feature2.properties } // Merge properties
                });
              }
            }
          }
        });
      });


    

    if (intersectionResult.features.length === 0) {
        setError('No intersections found.');
        return;
      }
  
      const layerName = name.trim() !== '' ? name : `New Layer ${uuidv4().substring(0, 8)}`;

      const newLayer: Layer = {
        id: uuidv4(),
        name: name, // This is the name entered in the input field
        data: intersectionResult,
        visible: true,
        color: '#ff0000'
      };
  
      // Directly pass the new array of layers
      setLayers([...layers, newLayer]);
    };
      

  const handleLayerChange1 = (value: string) => {
    setSelectedLayer1(value);
  };

  const handleLayerChange2 = (value: string) => {
    setSelectedLayer2(value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <div>
      {error && <Alert message={error} type="error" />}
      <Select value={selectedLayer1} onChange={handleLayerChange1} style={{ width: 200 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.id}</Option>)}
      </Select>
      <Select value={selectedLayer2} onChange={handleLayerChange2} style={{ width: 200 }}>
        {layers.map(layer => <Option key={layer.id} value={layer.id}>{layer.id}</Option>)}
      </Select>
      <Input 
        placeholder="Layer Name" 
        value={name} 
        onChange={handleNameChange} 
      />
      <Button onClick={handleIntersection}>Intersect Layers</Button>
    </div>
  );
};

export default IntersectionFunction;