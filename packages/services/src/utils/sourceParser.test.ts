import { describe, it, expect } from 'vitest';
import {
  parseSourceString,
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  stripHtml,
  processLoadedMessageSources,
  processLoadedMessages,
  isLikelyUrl,
  resolveSourceUrl,
} from './sourceParser';
import type { Source } from '../types/agent';

describe('parseSourceString', () => {
  it('parses standard pageNumber:filename:knowledgeId format', () => {
    const result = parseSourceString('3:report.pdf:abc-123');
    expect(result).toEqual({ pageNumber: 3, filename: 'report.pdf', knowledgeId: 'abc-123' });
  });

  it('handles filename with colons', () => {
    const result = parseSourceString('0:file:with:colons.html:uuid-456');
    expect(result).toEqual({ pageNumber: 1, filename: 'file:with:colons.html', knowledgeId: 'uuid-456' });
  });

  it('defaults pageNumber to 1 for non-numeric first part', () => {
    const result = parseSourceString('abc:file.pdf:uuid');
    expect(result.pageNumber).toBe(1);
  });
});

describe('transformRawSourcesToMap', () => {
  it('creates a map from raw source items', () => {
    const raw = [
      { text: 'content1', source: '1:file1.pdf:id1' },
      { text: 'content2', source: '2:file2.pdf:id2' },
    ];
    const map = transformRawSourcesToMap(raw);
    expect(map.size).toBe(2);
    expect(map.get('id1')).toEqual({ pageNumber: 1, filename: 'file1.pdf', text: 'content1' });
  });
});

describe('mergeSourcesWithRawData', () => {
  it('merges sources with matching raw data', () => {
    const sources: Source[] = [
      { id: 'id1', type: 'knowledge', title: 'Source 1' },
    ];
    const rawMap = new Map([['id1', { pageNumber: 5, filename: 'doc.pdf', text: 'text' }]]);
    const result = mergeSourcesWithRawData(sources, rawMap);
    expect(result[0].metadata).toEqual({
      pageNumber: 5,
      filename: 'doc.pdf',
      knowledgeId: 'id1',
    });
  });

  it('sets knowledgeId even when no raw data matches', () => {
    const sources: Source[] = [
      { id: 'id2', type: 'document', title: 'Source 2' },
    ];
    const rawMap = new Map();
    const result = mergeSourcesWithRawData(sources, rawMap);
    expect(result[0].metadata).toEqual({ knowledgeId: 'id2' });
  });
});

describe('stripHtml', () => {
  it('removes HTML tags and trims', () => {
    expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('truncates to 200 characters', () => {
    const long = '<p>' + 'a'.repeat(300) + '</p>';
    expect(stripHtml(long).length).toBe(200);
  });
});

describe('processLoadedMessageSources', () => {
  it('returns empty array when no sources', () => {
    expect(processLoadedMessageSources({})).toEqual([]);
  });

  it('sets knowledgeId when no toolCalls raw data', () => {
    const msg = {
      sources: [{ id: 's1', type: 'knowledge' as const, title: 'T' }],
    };
    const result = processLoadedMessageSources(msg);
    expect(result[0].metadata?.knowledgeId).toBe('s1');
  });
});

describe('processLoadedMessages', () => {
  it('processes an array of messages', () => {
    const messages = [
      { id: '1', sources: [{ id: 's1', type: 'knowledge' as const, title: 'T' }] },
    ];
    const result = processLoadedMessages(messages);
    expect(result[0].sources[0].metadata?.knowledgeId).toBe('s1');
  });
});

describe('isLikelyUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isLikelyUrl('http://example.com')).toBe(true);
    expect(isLikelyUrl('https://example.com/path?q=1')).toBe(true);
    expect(isLikelyUrl('  https://leading-space.io  ')).toBe(true);
  });

  it('rejects non-URL strings and non-strings', () => {
    expect(isLikelyUrl('ftp://example.com')).toBe(false);
    expect(isLikelyUrl('just some preview text')).toBe(false);
    expect(isLikelyUrl('')).toBe(false);
    expect(isLikelyUrl(undefined)).toBe(false);
    expect(isLikelyUrl(null)).toBe(false);
    expect(isLikelyUrl(123 as any)).toBe(false);
  });
});

describe('resolveSourceUrl', () => {
  it('prefers source.url over everything', () => {
    const source: Source = {
      id: '1', type: 'knowledge', title: 'T',
      url: 'https://primary.com',
      snippet: 'https://snippet.com',
      metadata: { sourceUrl: 'https://meta.com', source: 'https://other.com' },
    };
    expect(resolveSourceUrl(source)).toBe('https://primary.com');
  });

  it('falls through to metadata.sourceUrl when source.url is missing', () => {
    const source: Source = {
      id: '1', type: 'knowledge', title: 'T',
      metadata: { sourceUrl: 'https://meta.com', source: 'https://other.com' },
    };
    expect(resolveSourceUrl(source)).toBe('https://meta.com');
  });

  it('falls through to metadata.source when sourceUrl is missing', () => {
    const source: Source = {
      id: '1', type: 'knowledge', title: 'T',
      snippet: 'https://snippet.com',
      metadata: { source: 'https://meta-source.com' },
    };
    expect(resolveSourceUrl(source)).toBe('https://meta-source.com');
  });

  it('uses snippet as the LAST resort, only when it is a URL', () => {
    const sourceWithUrlSnippet: Source = {
      id: '1', type: 'knowledge', title: 'T',
      snippet: 'https://snippet.com',
    };
    expect(resolveSourceUrl(sourceWithUrlSnippet)).toBe('https://snippet.com');

    const sourceWithProseSnippet: Source = {
      id: '1', type: 'knowledge', title: 'T',
      snippet: 'This is just preview text, not a URL.',
    };
    expect(resolveSourceUrl(sourceWithProseSnippet)).toBeUndefined();
  });

  it('ignores metadata.source when it is a chunked file token, not a URL', () => {
    const source: Source = {
      id: '1', type: 'knowledge', title: 'T',
      metadata: { source: '0:report.pdf:abc-123' },
      snippet: 'https://snippet-fallback.com',
    };
    expect(resolveSourceUrl(source)).toBe('https://snippet-fallback.com');
  });

  it('returns undefined for null/undefined source', () => {
    expect(resolveSourceUrl(undefined)).toBeUndefined();
    expect(resolveSourceUrl(null)).toBeUndefined();
  });
});

describe('processLoadedMessageSources pass-through', () => {
  it('strips HTML from snippet and resolves URL via priority chain', () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: 'kid-1',
          type: 'knowledge',
          title: 'T',
          snippet: '<p>Some <b>preview</b></p>',
          metadata: { sourceUrl: 'https://meta.example.com' },
        },
      ],
    });
    expect(result[0].snippet).toBe('Some preview');
    expect(result[0].url).toBe('https://meta.example.com');
    expect(result[0].metadata?.knowledgeId).toBe('kid-1');
  });

  it('preserves an existing source.url and does not invoke any merge logic', () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: 'a',
          type: 'knowledge',
          title: 'A',
          url: 'https://a.example.com',
        },
        {
          id: 'b',
          type: 'knowledge',
          title: 'B',
          url: 'https://b.example.com',
        },
      ],
      // toolCalls is now ignored — backend already merged sources
      toolCalls: [
        { name: 'semantic_search', output: { sourcesMetadata: [{ id: 'x', knowledgeId: 'a' }] } },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://a.example.com');
    expect(result[1].url).toBe('https://b.example.com');
  });

  it('snippet-as-URL still wins as the last-resort fallback', () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: 'kid-1',
          type: 'knowledge',
          title: 'T',
          snippet: 'https://snippet-only.com',
        },
      ],
    });
    expect(result[0].url).toBe('https://snippet-only.com');
  });

  // Regression: real BSF bulletin payload — backend now ships a single
  // positional sources[] array. All URLs must come through untouched.
  it('passes through the unified BSF sources[] with URLs intact (positional)', () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: '10317c9e-ee45-4695-8779-f7270507ad0f',
          type: 'knowledge',
          title: 'U.S. Child Safety Updates',
          url: 'https://support.mybsf.org/bsf_article/u-s-child-safety-updates/',
          snippet: 'BSF remains deeply committed...',
        },
        // Position 10 in the original payload — the [11] AP/Class Staff Bulletin
        {
          id: 'd2ada252-5e7a-425d-9253-3429451326f1',
          type: 'semantic',
          title: 'AP/Class Staff Bulletin',
          snippet: 'Link: https://lead.bsfinternational.org/bulletin/ Title: AP/Class Staff Bulletin',
        },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe(
      'https://support.mybsf.org/bsf_article/u-s-child-safety-updates/',
    );
    // Bulletin entry has no url/sourceUrl and snippet is prose-with-URL — the
    // priority chain rejects "Link: …" snippets. URL stays undefined.
    expect(result[1].url).toBeUndefined();
    expect(result[0].title).toBe('U.S. Child Safety Updates');
    expect(result[1].title).toBe('AP/Class Staff Bulletin');
  });
});
