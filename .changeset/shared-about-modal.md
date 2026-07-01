---
"@sharelyai/ui-agent-chat": patch
"@sharelyai/services": patch
"@sharelyai/ui-shared": patch
"@sharelyai/ui-chat": patch
"@sharelyai/ui-search": patch
"@sharelyai/ui-browse": patch
---

Add a shared "Web Control Info" modal to `AgentChatPanel`. The version control now opens a built-in `AboutModal` (also exported), populated via the new `versionInfo` prop (`{ chatType, agentId, uiLanguage, knowledgeLanguage }`). Hosts can still override behavior with `onVersionClick`.
