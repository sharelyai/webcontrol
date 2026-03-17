import React from 'react';
import { SearchPanel } from '@sharelyai/ui-search';
import { SharelyProvider } from '@sharelyai/services';

function SearchOnly() {
  return (
    <SharelyProvider>
      <div style={{ padding: '20px' }}>
        <h2>Search Only Demo</h2>
        <p>This demo shows only the SearchPanel component.</p>
        <div style={{ height: '500px', width: '800px', border: '1px solid #ccc', margin: '20px auto' }}>
          <SearchPanel />
        </div>
      </div>
    </SharelyProvider>
  );
}

export default SearchOnly;
