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
  mergeSourcesByKnowledgeId,
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

describe('mergeSourcesByKnowledgeId', () => {
  it('matches by metadata.knowledgeId and pulls URL from metadata entry', () => {
    const sources: Source[] = [
      { id: 'src1', type: 'knowledge', title: 'Original Title',
        metadata: { knowledgeId: 'kid-1' } },
    ];
    const meta = [
      { id: 'meta1', knowledgeId: 'kid-1', metadata: {
        sourceUrl: 'https://merged.com', title: 'Meta Title', text: 'meta text',
      }, score: 0.8 },
    ];
    const result = mergeSourcesByKnowledgeId(sources, meta);
    expect(result[0].url).toBe('https://merged.com');
    expect(result[0].metadata?.sourceUrl).toBe('https://merged.com');
    expect(result[0].metadata?.similarity).toBe(0.8);
    expect(result[0].title).toBe('Original Title');
    expect(result[0].snippet).toBe('meta text');
  });

  it('falls back to source.id when metadata.knowledgeId is missing', () => {
    const sources: Source[] = [
      { id: 'kid-1', type: 'knowledge', title: 'T' },
    ];
    const meta = [
      { id: 'meta1', knowledgeId: 'kid-1', metadata: {
        sourceUrl: 'https://by-id.com',
      } },
    ];
    const result = mergeSourcesByKnowledgeId(sources, meta);
    expect(result[0].url).toBe('https://by-id.com');
  });

  it('does not overwrite an existing url on the source', () => {
    const sources: Source[] = [
      { id: 'src1', type: 'knowledge', title: 'T',
        url: 'https://original.com',
        metadata: { knowledgeId: 'kid-1' } },
    ];
    const meta = [
      { id: 'meta1', knowledgeId: 'kid-1', metadata: {
        sourceUrl: 'https://from-meta.com',
      } },
    ];
    const result = mergeSourcesByKnowledgeId(sources, meta);
    expect(result[0].url).toBe('https://original.com');
  });

  it('leaves unmatched sources alone but normalizes knowledgeId', () => {
    const sources: Source[] = [
      { id: 'src-no-match', type: 'knowledge', title: 'Lonely' },
    ];
    const meta = [
      { id: 'unrelated', knowledgeId: 'kid-other', metadata: {} },
    ];
    const result = mergeSourcesByKnowledgeId(sources, meta);
    expect(result[0].title).toBe('Lonely');
    expect(result[0].metadata?.knowledgeId).toBe('src-no-match');
  });

  it('uses snippet-as-URL only when nothing else resolves', () => {
    const sources: Source[] = [
      { id: 'src1', type: 'knowledge', title: 'T',
        snippet: 'https://from-snippet.com',
        metadata: { knowledgeId: 'kid-1' } },
    ];
    const result = mergeSourcesByKnowledgeId(sources, []);
    expect(result[0].url).toBe('https://from-snippet.com');
  });

  it('returns input untouched when sources is empty', () => {
    expect(mergeSourcesByKnowledgeId([], [{ id: 'm', metadata: {} }])).toEqual([]);
  });
});

describe('processLoadedMessageSources end-to-end merge', () => {
  it('uses message.sources as the canonical list and enriches via knowledgeId', () => {
    const result = processLoadedMessageSources({
      sources: [
        { id: 'kid-1', type: 'knowledge', title: 'From sources',
          metadata: { knowledgeId: 'kid-1' } },
      ],
      toolCalls: [{
        name: 'semantic_search',
        output: {
          sourcesMetadata: [
            { id: 'meta-1', knowledgeId: 'kid-1', score: 0.91, metadata: {
              sourceUrl: 'https://doc.example.com/page',
              title: 'Doc title from semantic',
              text: 'a relevant chunk',
              type: 'URL',
            } },
          ],
        },
      }],
    });

    expect(result.length).toBe(1);
    expect(result[0].url).toBe('https://doc.example.com/page');
    expect(result[0].metadata?.knowledgeId).toBe('kid-1');
    expect(result[0].metadata?.similarity).toBe(0.91);
    expect(result[0].title).toBe('From sources');
  });

  it('keeps snippet-as-URL fallback path working when toolCalls have no metadata', () => {
    const result = processLoadedMessageSources({
      sources: [
        { id: 'kid-1', type: 'knowledge', title: 'T',
          snippet: 'https://snippet-only.com',
          metadata: { knowledgeId: 'kid-1' } },
      ],
    });
    expect(result[0].url).toBe('https://snippet-only.com');
  });

  // Regression: real BSF bulletin payload — message.sources IDs (search_knowledge
  // result IDs) and semantic_search knowledgeIds are completely disjoint. URLs
  // must survive on the rendered sources even though no merge match happens.
  it('preserves message.sources URLs when sources and sourcesMetadata IDs do not overlap', () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: '10317c9e-ee45-4695-8779-f7270507ad0f',
          type: 'knowledge',
          title: 'U.S. Child Safety Updates',
          url: 'https://support.mybsf.org/bsf_article/u-s-child-safety-updates/',
          snippet: 'BSF remains deeply committed...',
        },
        {
          id: '33253bc9-7ce5-4359-9f2b-3919213b341b',
          type: 'knowledge',
          title: 'Reminder: Upcoming Leaders Meeting Alignment',
          url: 'https://support.mybsf.org/bsf_article/reminder-upcoming-leaders-meeting-alignment/',
          snippet: 'BSF is committed...',
        },
      ],
      toolCalls: [
        {
          name: 'search_knowledge',
          output: {
            results: [
              {
                id: '10317c9e-ee45-4695-8779-f7270507ad0f',
                type: 'STRING',
                title: 'U.S. Child Safety Updates',
                content: '<p>...</p>',
                sourceUrl: 'https://support.mybsf.org/bsf_article/u-s-child-safety-updates/',
              },
            ],
          },
        },
        {
          name: 'semantic_search',
          output: {
            sourcesMetadata: [
              {
                id: '2b720202-1788-4c47-8cf0-d7748334bfdc',
                knowledgeId: 'd2ada252-5e7a-425d-9253-3429451326f1',
                score: 0.874,
                title: 'AP/Class Staff Bulletin',
                source: '0:AP/Class Staff Bulletin:d2ada252-5e7a-425d-9253-3429451326f1',
                text: 'Link: https://lead.bsfinternational.org/bulletin/ Title: AP/Class Staff Bulletin',
              },
            ],
            dataArraySortedWithSource: [
              {
                text: 'Link: https://lead.bsfinternational.org/bulletin/ Title: AP/Class Staff Bulletin',
                source: '0:AP/Class Staff Bulletin:d2ada252-5e7a-425d-9253-3429451326f1',
              },
            ],
          },
        },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('10317c9e-ee45-4695-8779-f7270507ad0f');
    expect(result[0].url).toBe('https://support.mybsf.org/bsf_article/u-s-child-safety-updates/');
    expect(result[1].url).toBe(
      'https://support.mybsf.org/bsf_article/reminder-upcoming-leaders-meeting-alignment/',
    );
    expect(result[0].title).toBe('U.S. Child Safety Updates');
    expect(result[1].title).toBe('Reminder: Upcoming Leaders Meeting Alignment');
  });
});
