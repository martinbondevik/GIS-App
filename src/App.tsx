import React, { useState } from "react";
import { Layout, Button, Switch, Input, Alert } from "antd";
import {
  UploadOutlined,
  InteractionOutlined, // If you still need this for other purposes
  RadiusSettingOutlined,
  AimOutlined,         // For Intersection Function
  MinusSquareOutlined, // For Difference Function
  ScissorOutlined,     // For Clip Function
} from "@ant-design/icons";

import MapboxComponent from "./components/MapboxComponent";
import IntersectionFunction from "./components/IntersectionFunction";
import BufferFunction from "./components/BufferFunction";
import UnionFunction from "./components/UnionFunction";
import DifferenceFunction from "./components/DifferenceFunction";
import ClipFunction from "./components/ClipFunction";

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [layers, setLayers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null); // State to track the error message


  const predefinedColors = ["#FF6347", "#4682B4", "#32CD32", "#FFD700", "#6A5ACD", "#FFA07A", "#40E0D0", "#DA70D6", "#F08080", "#20B2AA"];
  let colorIndex = 0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
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
                color: predefinedColors[colorIndex % predefinedColors.length], // Cycle through the color array
              };
              setLayers((prevLayers) => [...prevLayers, newLayer]);
              colorIndex++; // Increment the color index
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            setError("Failed to parse the file. Please ensure it is a valid GeoJSON.");
          }
        };
        reader.readAsText(file);
      });
      setError(null); // Clear any error after processing all files
    }
  };
  

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          return { ...layer, visible: !layer.visible };
        }
        return layer;
      })
    );
  };

  const changeLayerColor = (layerId: string, color: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          return { ...layer, color: color };
        }
        return layer;
      })
    );
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        GIS app 4 u
      </Header>
      <Layout>
        <Sider
          width={300}
          style={{
            overflowY: "auto", // Enable vertical scrolling
            height: 'calc(100vh - 64px)',
            background: "#fff",
          }}
        >
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
          <h3 style={{ flex: 1, padding: "10px"}}>
            Layers <UploadOutlined />
          </h3>
          {layers.map((layer) => (
            <div key={layer.id} style={{ flex: 1, padding: "10px"}}>
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
            multiple
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <Button onClick={() => document.getElementById("fileInput")?.click()} type="primary" style={{ width: '100%', marginBottom: 10}} >
            Upload Files
          </Button>

          {/* Functions section */}
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Intersection Function
              <AimOutlined />
            </h3>
            <IntersectionFunction layers={layers} setLayers={setLayers} />
          </div>
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Buffer Function
              <RadiusSettingOutlined />
            </h3>
            <BufferFunction layers={layers} setLayers={setLayers} />
          </div>
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Union Function
              <InteractionOutlined />
            </h3>
            <UnionFunction layers={layers} setLayers={setLayers} />
          </div>
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Difference Function
              <MinusSquareOutlined />
            </h3>
            <DifferenceFunction layers={layers} setLayers={setLayers} />
          </div>
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Clip Function
              <ScissorOutlined />
            </h3>
            <ClipFunction layers={layers} setLayers={setLayers} />
          </div>
          <div
            style={{ flex: 1, padding: "10px", borderTop: "1px solid #e8e8e8" }}
          >
            <h3 style={{ margin: "0 0 10px" }}>
              Other Function
              <InteractionOutlined />
            </h3>
            <Button block style={{ marginTop: "10px" }}>
              more functions
            </Button>
          </div>
        </Sider>
        <Content style={{ margin: 0, minHeight: "100%", position: "relative", height: 'calc(100vh - 64px)' }}>
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
