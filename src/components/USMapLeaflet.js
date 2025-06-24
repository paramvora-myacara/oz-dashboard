'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { feature } from 'topojson-client';
import { getStateInvestmentAttractivenessScore, exampleStateHoverData } from '@/data/mockData';

export default function USMapLeaflet() {
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    fetch('/maps/us-states-10m.json')
      .then(r => r.json())
      .then(topo => setGeo(feature(topo, topo.objects.states)));
  }, []);

  const style = (score) => ({
    fillColor: score>75? "#2E7D32": score>50? "#66BB6A": score>25? "#A5D6A7": "#E0E0E0",
    weight:0.5, color:"#fff"
  });

  const onEach = (f,l) => {
    const n = f.properties.name;
    const s = getStateInvestmentAttractivenessScore(n);
    const d = exampleStateHoverData(n);

    l.on({ mouseover:() => l.setStyle({ weight:1.5 }), mouseout:() => l.setStyle({ weight:0.5 }) });
    l.bindTooltip(
      `<strong>${d.StateName}</strong><br/>
       Capital: ${d["Total Capital Deployed"]}<br/>
       QOFs: ${d["Active QOFs"]}`,
      { direction:'auto' }
    );
    l.setStyle(style(s));
  };

  return (
    <section className="bg-bg-card p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2 text-center">National Overview</h2>
      <MapContainer center={[37.8,-96]} zoom={4} scrollWheelZoom={false} className="h-[450px] rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM"/>
        {geo && <GeoJSON data={geo} onEachFeature={onEach} />}
      </MapContainer>
    </section>
  );
} 