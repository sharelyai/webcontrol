import { describe, it, expect } from 'vitest';
import {
  agentMessageToBodyMessage,
  bodyMessageToAgentMessage,
  mergeAgentMessagesWithBodyMessages,
} from './messageAdapters';
import type { AgentMessage } from '../types/agent';
import type { BodyMessage } from './messageAdapters';

const makeAgentMessage = (overrides: Partial<AgentMessage> = {}): AgentMessage => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  thinkingSteps: [],
  toolCalls: [],
  sources: [],
  tokenUsage: null,
  model: null,
  finishReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('agentMessageToBodyMessage', () => {
  it('converts user role to USER type', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ role: 'user' }));
    expect(result.type).toBe('USER');
  });

  it('converts assistant role to AI type', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ role: 'assistant' }));
    expect(result.type).toBe('AI');
  });

  it('maps content to message field', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ content: 'test' }));
    expect(result.message).toBe('test');
  });

  it('handles null content as empty string', () => {
    const result = agentMessageToBodyMessage(makeAgentMessage({ content: null }));
    expect(result.message).toBe('');
  });

  it('builds sourcesMetadata from sources', () => {
    const msg = makeAgentMessage({
      sources: [{ id: 's1', type: 'knowledge', title: 'Title', url: 'http://x.com', snippet: 'snip' }],
    });
    const result = agentMessageToBodyMessage(msg);
    expect(result.sourcesMetadata).toHaveLength(1);
    expect(result.sourcesMetadata![0].source).toBe('http://x.com');
  });
});

describe('bodyMessageToAgentMessage', () => {
  it('converts USER type to user role', () => {
    const body: BodyMessage = { id: '1', type: 'USER', message: 'Hi' };
    const result = bodyMessageToAgentMessage(body);
    expect(result.role).toBe('user');
  });

  it('defaults arrays and nulls for missing fields', () => {
    const body: BodyMessage = { id: '1', type: 'AI', message: 'Hi' };
    const result = bodyMessageToAgentMessage(body);
    expect(result.thinkingSteps).toEqual([]);
    expect(result.toolCalls).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.tokenUsage).toBeNull();
  });
});

describe('mergeAgentMessagesWithBodyMessages', () => {
  it('merges preserving thumbSignals and user from body messages', () => {
    const agent = [makeAgentMessage({ id: 'x', content: 'updated' })];
    const body: BodyMessage[] = [
      { id: 'x', type: 'USER', message: 'old', thumbSignals: [{ up: true }], user: { id: 'u1' } },
    ];
    const result = mergeAgentMessagesWithBodyMessages(agent, body);
    expect(result[0].message).toBe('updated');
    expect(result[0].thumbSignals).toEqual([{ up: true }]);
    expect(result[0].user).toEqual({ id: 'u1' });
  });
});
