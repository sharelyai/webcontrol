import React from 'react';
import { WebControl } from '@sharely/webcontrol';

function FullDemo() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Full WebControl Demo</h2>
      <p>
        Default mode (<code>top-center-floating</code>). The launcher pill appears at the top-center.
        Click it to open the full panel.
      </p>
      <WebControl />
    </div>
  );
}

export default FullDemo;
