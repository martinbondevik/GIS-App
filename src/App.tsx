import React, { useState } from 'react';
import { Layout, Button, Switch, Input, Alert } from 'antd';
import { UploadOutlined, InteractionOutlined, RadiusSettingOutlined } from '@ant-design/icons';
import MapboxComponent from './components/MapboxComponent';
import IntersectionFunction from './components/IntersectionFunction'; // Update the import path as needed
import BufferFunction from './components/BufferFunction'; 

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [layers, setLayers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null); // State to track the error message


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          const jsonContent = content ? JSON.parse(content.toString()) : null;
          if (jsonContent) {
            const newLayer = {
              id: file.name,
              name: file.name,
              data: jsonContent,
              visible: true,
              color: '#ff0000', // default color
            };
            setLayers((prevLayers) => [...prevLayers, newLayer]);
            setError(null); // Clear any previous error
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // Handle the error gracefully here, e.g., show an alert to the user
          setError("Failed to parse the file. Please ensure it is a valid GeoJSON."); // Set the error message
        }
      };
      reader.readAsText(file);
    }
  };
  


  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          return { ...layer, visible: !layer.visible };
        }
        return layer;
      }),
    );
  };

  const changeLayerColor = (layerId: string, color: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          return { ...layer, color: color };
        }
        return layer;
      }),
    );
  };

  return (
    <Layout style={{ minHeight: 1000 }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        GIS app 4 u
      </Header>
      <Layout>
      <Sider
        width={300}
        style={{ 
          overflowY: 'auto', // Enable vertical scrolling
          height: 'calc(100vh - 64px)', // Adjust height based on your Header's height
          background: '#fff'
        }}
      >
        {error && <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />}
        <h3 style={{ margin: '0 0 10px' }}>Layers <UploadOutlined /></h3>
        {layers.map((layer) => (
            <div key={layer.id}>
              <span>{layer.name}</span>
              <Switch
                checked={layer.visible}
                onChange={() => toggleLayerVisibility(layer.id)}
              />
              <Input
                type="color"
                value={layer.color}
                onChange={(e) => changeLayerColor(layer.id, e.target.value)}
              />
            </div>
          ))}
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button onClick={() => document.getElementById('fileInput')?.click()}>
            Upload Files
          </Button>


          {/* Functions section */}
          <div style={{ flex: 1, padding: '10px', borderTop: '1px solid #e8e8e8' }}>
            <h3 style={{ margin: '0 0 10px' }}>Intersection Function<InteractionOutlined /></h3>
            <IntersectionFunction layers={layers} setLayers={setLayers} />
          </div>
          <div style={{ flex: 1, padding: '10px', borderTop: '1px solid #e8e8e8' }}>
            <h3 style={{ margin: '0 0 10px' }}>Buffer Function<InteractionOutlined /></h3>
            <BufferFunction layers={layers} setLayers={setLayers} />

          </div>
          <div style={{ flex: 1, padding: '10px', borderTop: '1px solid #e8e8e8' }}>
            <h3 style={{ margin: '0 0 10px' }}>Other Function<InteractionOutlined /></h3>
            <Button block style={{ marginTop: '10px' }}>more functions</Button>
          </div>
        </Sider>
        <Content style={{ margin: 0, minHeight: "100%", position: 'relative' }}>
          <MapboxComponent
            accessToken="pk.eyJ1IjoibWFydGluYmJveCIsImEiOiJjbHIyNnM2bmQwY3UzMmlxam5uMDZ0a2xjIn0.Yo8M7Ong0D4-Z9KBXt1r9A"
            styleUrl="mapbox://styles/mapbox/streets-v11"
            center={[10.3951, 63.4305]}
            zoom={10}
            layers={layers}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
