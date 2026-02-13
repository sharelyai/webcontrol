import React from 'react';
import { Link } from 'react-router-dom';

function DemoControls() {
  return (
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/full-demo">Full WebControl Demo</Link></li>
        <li><Link to="/modes-demo">Position Modes Demo</Link></li>
        <li><Link to="/inline-demo">Inline Mode Demo</Link></li>
        <li><Link to="/chat-only">Chat Only Demo</Link></li>
        <li><Link to="/search-only">Search Only Demo</Link></li>
        <li><Link to="/browse-only">Browse Only Demo</Link></li>
        <li><Link to="/custom-shell">Custom Shell Demo</Link></li>
        <li><Link to="/headless-demo">Headless Hooks Demo</Link></li>
      </ul>
    </nav>
  );
}

export default DemoControls;
