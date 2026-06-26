import React, { useMemo, useState } from 'react';
import { defaultTheme } from '@sharelyai/ui-shared';
import { WebControl } from '@sharelyai/webcontrol';

// Connection defaults come from the root .env (same source config.ts seeds),
// but are editable in the playground.
const ENV_WORKSPACE_ID = import.meta.env.VITE_WORKSPACE_ID || '';
const ENV_BASE_URL = import.meta.env.VITE_API_DEFAULT_URL || 'https://api.sharely.ai';

// ---------------------------------------------------------------------------
// Option lists — values match @sharelyai/services constants exactly so the
// widget never logs an "invalid mode" warning.
// ---------------------------------------------------------------------------
const MODES = [
  { value: 'top-center-floating', label: 'Top center (floating)' },
  { value: 'bottom-center-floating', label: 'Bottom center (floating)' },
  { value: 'bottom-right-floating', label: 'Bottom right (floating)' },
  { value: 'placed-floating', label: 'Placed (opens as modal)' },
  { value: 'placed-inline', label: 'Inline (embedded in page)' },
];

const AVATARS = [
  { value: 'expanded', label: 'Expanded (pill)' },
  { value: 'circle', label: 'Compact (circle)' },
];

const PRIVACY = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
];

const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'pt-br', label: 'Portuguese (Brazil)' },
  { value: 'de', label: 'German' },
  { value: 'pl', label: 'Polish' },
  { value: 'zh-hans', label: 'Chinese (Simplified)' },
  { value: 'zh-hant', label: 'Chinese (Traditional)' },
];

type Views = {
  chat: boolean;
  search: boolean;
  searchTags: boolean;
  browse: boolean;
  agent: boolean;
};

type State = {
  workspaceId: string;
  baseUrl: string;
  mode: string;
  avatar: string;
  justChat: boolean;
  closedText: string;
  lang: string;
  openByDefault: boolean;
  privacy: string;
  views: Views;
  width: string;
  height: string;
  zIndex: string;
  themePrimary: string;
  themeSecondary: string;
};

const DEFAULTS: State = {
  workspaceId: ENV_WORKSPACE_ID,
  baseUrl: ENV_BASE_URL,
  mode: 'top-center-floating',
  avatar: 'expanded',
  justChat: false,
  closedText: '',
  lang: 'en',
  openByDefault: false,
  privacy: 'PUBLIC',
  views: { chat: true, search: false, searchTags: false, browse: false, agent: false },
  width: '',
  height: '',
  zIndex: '',
  themePrimary: defaultTheme.colors.primary,
  themeSecondary: defaultTheme.colors.secondary,
};

// localStorage key for a saved playground config.
const STORAGE_KEY = 'sharely-playground-config';

// Read a saved config from localStorage, tolerating older / partial shapes by
// merging onto DEFAULTS. Returns null when nothing is stored or parsing fails.
function loadStored(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...DEFAULTS,
      ...parsed,
      views: { ...DEFAULTS.views, ...(parsed.views ?? {}) },
    };
  } catch {
    return null;
  }
}

const PRESETS: { label: string; state: State }[] = [
  {
    label: 'Floating chat',
    state: { ...DEFAULTS },
  },
  {
    label: 'Inline · all views',
    state: {
      ...DEFAULTS,
      mode: 'placed-inline',
      openByDefault: true,
      views: { chat: true, search: true, searchTags: true, browse: true, agent: false },
    },
  },
  {
    label: 'Agent only',
    state: {
      ...DEFAULTS,
      mode: 'bottom-right-floating',
      openByDefault: true,
      views: { chat: false, search: false, searchTags: false, browse: false, agent: true },
    },
  },
  {
    label: 'Search + Browse',
    state: {
      ...DEFAULTS,
      mode: 'placed-inline',
      openByDefault: true,
      views: { chat: false, search: true, searchTags: true, browse: true, agent: false },
    },
  },
];

// ---------------------------------------------------------------------------
// Small styled helpers (plain inline styles — no extra deps).
// ---------------------------------------------------------------------------
const card: React.CSSProperties = {
  border: '1px solid #e4e6ea',
  borderRadius: 12,
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#475467',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  border: '1px solid #d0d5dd',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ margin: '6px 0 0', fontSize: 11, color: '#98a2b3' }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function CodeBlock({ title, code, onCopy, copied }: { title: string; code: string; onCopy: () => void; copied: boolean }) {
  return (
    <div style={{ ...card, overflow: 'hidden', marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #e4e6ea',
          background: '#f9fafb',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475467' }}>{title}</span>
        <button onClick={onCopy} style={{ ...inputStyle, width: 'auto', padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 12, fontSize: 12, lineHeight: 1.5, overflowX: 'auto', color: '#101828' }}>
        {code}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------
export default function Playground() {
  // `s` is the DRAFT being edited in the form. `applied` is the config that
  // actually powers the live preview + output snippets. They start in sync
  // (seeded from a saved config in localStorage if present, else DEFAULTS) and
  // diverge as the form is edited until the user clicks "Load config".
  const [s, setS] = useState<State>(() => loadStored() ?? DEFAULTS);
  const [applied, setApplied] = useState<State>(() => loadStored() ?? DEFAULTS);
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // workspaceId / baseUrl are owned as local state here (initialised from env).
  // We deliberately do NOT read them back from the global store: WebControl's
  // internal provider writes config to that store on render, so subscribing
  // would couple this component to those writes and risk a re-render loop.
  const set = <K extends keyof State>(key: K, value: State[K]) => setS((prev) => ({ ...prev, [key]: value }));

  // Apply a preset while preserving the current connection (workspaceId/baseUrl).
  const applyPreset = (preset: State) =>
    setS((prev) => ({ ...preset, workspaceId: prev.workspaceId, baseUrl: prev.baseUrl }));
  const setView = <K extends keyof Views>(key: K, value: boolean) =>
    setS((prev) => ({ ...prev, views: { ...prev.views, [key]: value } }));

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  // Transient status message shown next to the action buttons.
  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 1500);
  };

  // Push the current draft into the preview/output.
  const loadConfig = () => {
    setApplied(s);
    flash('Config loaded');
  };

  // Persist the current draft to localStorage.
  const saveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      flash('Saved to localStorage');
    } catch {
      flash('Save failed');
    }
  };

  // Remove the saved config from localStorage.
  const removeConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      flash('Removed from localStorage');
    } catch {
      flash('Remove failed');
    }
  };

  // True when the form has edits not yet pushed to the preview.
  const dirty = JSON.stringify(s) !== JSON.stringify(applied);

  const isInline = applied.mode === 'placed-inline';

  // displayMode passed to the widget (derived from the APPLIED config)
  const displayMode = useMemo(
    () => ({
      OPEN_BY_DEFAULT: applied.openByDefault,
      MODE: applied.privacy,
      ...(applied.width ? { WIDTH: applied.width } : {}),
      ...(applied.height ? { HEIGHT: applied.height } : {}),
      ...(applied.zIndex ? { Z_INDEX: applied.zIndex } : {}),
      VIEWS: {
        CHAT: { SHOW: applied.views.chat },
        SEARCH: { SHOW: applied.views.search, SHOW_TAGS: applied.views.searchTags },
        BROWSE: { SHOW: applied.views.browse },
        AGENT: { SHOW: applied.views.agent },
      },
    }),
    [applied.openByDefault, applied.privacy, applied.width, applied.height, applied.zIndex, applied.views],
  );

  // theme override built off defaultTheme (derived from the APPLIED config)
  const theme = useMemo(
    () => ({
      ...defaultTheme,
      colors: { ...defaultTheme.colors, primary: applied.themePrimary, secondary: applied.themeSecondary },
    }),
    [applied.themePrimary, applied.themeSecondary],
  );

  // Remount the preview only when structural config changes (not on every
  // keystroke / color drag) so the widget doesn't reset constantly.
  const previewKey = JSON.stringify({
    workspaceId: applied.workspaceId,
    baseUrl: applied.baseUrl,
    mode: applied.mode,
    avatar: applied.avatar,
    justChat: applied.justChat,
    openByDefault: applied.openByDefault,
    privacy: applied.privacy,
    views: applied.views,
    width: applied.width,
    height: applied.height,
    zIndex: applied.zIndex,
    lang: applied.lang,
  });

  // Exported config (SharelyConfig shape used by the embed API)
  const exportConfig = useMemo(() => {
    const cfg: Record<string, unknown> = {
      workspaceId: applied.workspaceId || 'YOUR_WORKSPACE_ID',
      baseUrl: applied.baseUrl,
      mode: applied.mode,
      avatarmodeDesktop: applied.avatar,
      avatarmodeMobile: applied.avatar,
      lang: applied.lang,
      displayMode,
    };
    if (applied.justChat) cfg.justChat = true;
    if (applied.closedText) cfg.closedText = applied.closedText;
    return cfg;
  }, [applied.workspaceId, applied.baseUrl, applied.mode, applied.avatar, applied.lang, applied.justChat, applied.closedText, displayMode]);

  const configJson = JSON.stringify(exportConfig, null, 2);

  const embedSnippet = `<div id="sharelyai-webcontroller-id"></div>

<script src="https://your-deployment.example.com/assets/sharelyai.js"></script>
<script>
  window.sharelyai.initialize(${indent(configJson, 2)});
  window.sharelyai.render();
</script>`;

  const themeChanged =
    applied.themePrimary !== defaultTheme.colors.primary || applied.themeSecondary !== defaultTheme.colors.secondary;
  const reactSnippet = `<WebControl
  mode="${applied.mode}"
  avatarmodeDesktop="${applied.avatar}"
  avatarmodeMobile="${applied.avatar}"
  lang="${applied.lang}"${applied.justChat ? '\n  justChat' : ''}${applied.closedText ? `\n  closedText="${applied.closedText}"` : ''}
  displayMode={${indent(JSON.stringify(displayMode, null, 2), 2)}}${
    themeChanged
      ? `\n  theme={{ colors: { primary: '${applied.themePrimary}', secondary: '${applied.themeSecondary}' } }}`
      : ''
  }
/>`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#101828', maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0 }}>WebControl Playground</h1>
        <p style={{ margin: '4px 0 0', color: '#475467' }}>
          Configure the widget live, then copy the config or embed snippet.
        </p>
      </div>

      {!s.workspaceId && (
        <div
          style={{
            ...card,
            background: '#fffaeb',
            borderColor: '#fec84b',
            padding: '10px 14px',
            margin: '16px 0',
            fontSize: 13,
            color: '#93370d',
          }}
        >
          No <code>VITE_WORKSPACE_ID</code> set — the widget renders, but live data needs a workspace id in the root{' '}
          <code>.env</code>. The launcher and layout still work for previewing configuration.
        </div>
      )}

      {/* Presets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475467', alignSelf: 'center' }}>Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.state)}
            style={{ ...inputStyle, width: 'auto', padding: '6px 12px', cursor: 'pointer' }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setS(DEFAULTS)}
          style={{ ...inputStyle, width: 'auto', padding: '6px 12px', cursor: 'pointer', color: '#b42318' }}
        >
          Reset
        </button>
      </div>

      {/* Config actions — load the draft into the preview, or persist it. */}
      <div
        style={{
          ...card,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '12px 14px',
          margin: '16px 0',
          background: '#f9fafb',
        }}
      >
        <button
          onClick={loadConfig}
          disabled={!dirty}
          title="Apply the current settings to the live preview"
          style={{
            ...inputStyle,
            width: 'auto',
            padding: '8px 14px',
            cursor: dirty ? 'pointer' : 'default',
            fontWeight: 600,
            color: dirty ? '#fff' : '#98a2b3',
            background: dirty ? '#1570ef' : '#f2f4f7',
            borderColor: dirty ? '#1570ef' : '#d0d5dd',
          }}
        >
          {dirty ? 'Load config →' : 'Config loaded ✓'}
        </button>
        <button
          onClick={saveConfig}
          title="Save the current settings to localStorage"
          style={{ ...inputStyle, width: 'auto', padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}
        >
          Save to localStorage
        </button>
        <button
          onClick={removeConfig}
          title="Remove the saved config from localStorage"
          style={{ ...inputStyle, width: 'auto', padding: '8px 14px', cursor: 'pointer', color: '#b42318' }}
        >
          Remove saved
        </button>
        {dirty && (
          <span style={{ fontSize: 12, color: '#b54708' }}>Unloaded changes — click “Load config” to preview.</span>
        )}
        {status && <span style={{ fontSize: 12, fontWeight: 600, color: '#067647' }}>{status}</span>}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Controls */}
        <div style={{ ...card, padding: 20 }}>
          <Field label="Workspace ID" hint="Issued by your backend. Needed for live data.">
            <input
              style={inputStyle}
              value={s.workspaceId}
              onChange={(e) => set('workspaceId', e.target.value)}
              placeholder="YOUR_WORKSPACE_ID"
            />
          </Field>

          <Field label="Base URL" hint="API the widget talks to.">
            <input
              style={inputStyle}
              value={s.baseUrl}
              onChange={(e) => set('baseUrl', e.target.value)}
              placeholder="https://api.sharely.ai"
            />
          </Field>

          <Field label="Position mode">
            <select style={inputStyle} value={s.mode} onChange={(e) => set('mode', e.target.value)}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Avatar / launcher">
            <select style={inputStyle} value={s.avatar} onChange={(e) => set('avatar', e.target.value)}>
              {AVATARS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Views" hint="Which tabs appear inside the widget.">
            <Toggle checked={s.views.chat} onChange={(v) => setView('chat', v)} label="Chat" />
            <Toggle checked={s.views.search} onChange={(v) => setView('search', v)} label="Search" />
            {s.views.search && (
              <div style={{ marginLeft: 24 }}>
                <Toggle checked={s.views.searchTags} onChange={(v) => setView('searchTags', v)} label="Show search tags" />
              </div>
            )}
            <Toggle checked={s.views.browse} onChange={(v) => setView('browse', v)} label="Browse" />
            <Toggle checked={s.views.agent} onChange={(v) => setView('agent', v)} label="Agent chat (SSE)" />
          </Field>

          <Field label="Behavior">
            <Toggle checked={s.openByDefault} onChange={(v) => set('openByDefault', v)} label="Open by default" />
            <Toggle checked={s.justChat} onChange={(v) => set('justChat', v)} label="Just chat (skip tabs)" />
          </Field>

          <Field label="Privacy">
            <select style={inputStyle} value={s.privacy} onChange={(e) => set('privacy', e.target.value)}>
              {PRIVACY.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Language">
            <select style={inputStyle} value={s.lang} onChange={(e) => set('lang', e.target.value)}>
              {LANGS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Closed launcher text" hint="Shown on the collapsed pill.">
            <input
              style={inputStyle}
              value={s.closedText}
              onChange={(e) => set('closedText', e.target.value)}
              placeholder="e.g. Need help?"
            />
          </Field>

          <Field label="Sizing (optional)" hint="CSS values, e.g. 420px / 640px. Blank = defaults.">
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={inputStyle} value={s.width} onChange={(e) => set('width', e.target.value)} placeholder="width" />
              <input style={inputStyle} value={s.height} onChange={(e) => set('height', e.target.value)} placeholder="height" />
              <input style={inputStyle} value={s.zIndex} onChange={(e) => set('zIndex', e.target.value)} placeholder="z-index" />
            </div>
          </Field>

          <Field label="Theme colors">
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="color" value={s.themePrimary} onChange={(e) => set('themePrimary', e.target.value)} />
                Primary
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="color" value={s.themeSecondary} onChange={(e) => set('themeSecondary', e.target.value)} />
                Secondary
              </label>
            </div>
          </Field>
        </div>

        {/* Preview + output */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475467', marginBottom: 8 }}>
            Live preview {isInline ? '(inline)' : '(floating — positioned within this frame)'}
          </div>
          {/* `transform` makes position:fixed children resolve against this frame
              instead of the viewport, so floating modes preview in-place. */}
          <div
            style={{
              position: 'relative',
              height: 660,
              ...card,
              overflow: 'hidden',
              transform: 'translate(0, 0)',
              background: '#f4f6f8',
            }}
          >
            {isInline ? (
              <div style={{ height: '100%', padding: 16, boxSizing: 'border-box' }}>
                <WebControl
                  key={previewKey}
                  workspaceId={applied.workspaceId || undefined}
                  baseUrl={applied.baseUrl || undefined}
                  mode={applied.mode}
                  avatarmodeDesktop={applied.avatar}
                  avatarmodeMobile={applied.avatar}
                  justChat={applied.justChat}
                  closedText={applied.closedText || undefined}
                  lang={applied.lang}
                  displayMode={displayMode}
                  theme={theme}
                />
              </div>
            ) : (
              <WebControl
                key={previewKey}
                workspaceId={applied.workspaceId || undefined}
                baseUrl={applied.baseUrl || undefined}
                mode={applied.mode}
                avatarmodeDesktop={applied.avatar}
                avatarmodeMobile={applied.avatar}
                justChat={applied.justChat}
                closedText={applied.closedText || undefined}
                lang={applied.lang}
                displayMode={displayMode}
                theme={theme}
              />
            )}
          </div>

          <CodeBlock title="Config (SharelyConfig)" code={configJson} copied={copied === 'config'} onCopy={() => copy('config', configJson)} />
          <CodeBlock title="Embed via <script>" code={embedSnippet} copied={copied === 'embed'} onCopy={() => copy('embed', embedSnippet)} />
          <CodeBlock title="React usage" code={reactSnippet} copied={copied === 'react'} onCopy={() => copy('react', reactSnippet)} />
        </div>
      </div>
    </div>
  );
}

// Indent every line after the first by `spaces`, so a JSON block nests cleanly
// inside a snippet template.
function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n');
}
