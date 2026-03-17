import React from 'react';
import { BrowsePanel } from '@sharelyai/ui-browse';
import { SharelyProvider } from '@sharelyai/services';

function BrowseOnly() {
  return (
    <SharelyProvider>
      <div style={{ padding: '20px' }}>
        <h2>Browse Only Demo</h2>
        <p>This demo shows only the BrowsePanel component.</p>
        <div style={{ height: '500px', width: '800px', border: '1px solid #ccc', margin: '20px auto' }}>
          <BrowsePanel />
        </div>
      </div>
    </SharelyProvider>
  );
}

export default BrowseOnly;
