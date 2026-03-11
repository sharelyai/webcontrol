import { describe, it, expect } from 'vitest';
import {
  parseSourceString,
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  stripHtml,
  processLoadedMessageSources,
  processLoadedMessages,
} from './sourceParser';
import type { Source } from '../types/agent';

describe('parseSourceString', () => {
  it('parses standard pageNumber:filename:knowledgeId format', () => {
    const result = parseSourceString('3:report.pdf:abc-123');
    expect(result).toEqual({ pageNumber: 3, filename: 'report.pdf', knowledgeId: 'abc-123' });
  });

  it('handles filename with colons', () => {
    const result = parseSourceString('0:file:with:colons.html:uuid-456');
    expect(result).toEqual({ pageNumber: 0, filename: 'file:with:colons.html', knowledgeId: 'uuid-456' });
  });

  it('defaults pageNumber to 0 for non-numeric first part', () => {
    const result = parseSourceString('abc:file.pdf:uuid');
    expect(result.pageNumber).toBe(0);
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
