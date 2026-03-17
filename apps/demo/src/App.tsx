import React from 'react';
import { WebControl } from '@sharelyai/webcontrol';
import DemoControls from './components/DemoControls';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Sharely Web Control Demos</h1>
      <DemoControls />
      <p>Select a demo from the links above.</p>
      <hr />
      <h3>Default WebControl (floating widget)</h3>
      <WebControl />
    </div>
  );
}

export default App;
