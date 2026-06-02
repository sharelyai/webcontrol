import React from 'react';
import { BrowsePanel } from '@sharelyai/ui-browse';
import { SharelyProvider } from '@sharelyai/services';
import { ThemeProvider, GlobalStyle } from '@sharelyai/ui-shared';

function BrowseOnly() {
  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ padding: '20px' }}>
          <h2>Browse Only Demo</h2>
          <p>This demo shows only the BrowsePanel component.</p>
          <div style={{ height: '500px', width: '800px', border: '1px solid #ccc', margin: '20px auto' }}>
            <BrowsePanel />
          </div>
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}

export default BrowseOnly;
