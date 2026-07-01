import { createPortal } from "react-dom";
import { Close } from "@sharelyai/ui-shared";
import { Overlay, Container, Header, InfoList, InfoRow } from "./styles";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
  version?: string;
  /** "Agent" or "Regular" */
  chatType: string;
  /** Custom agent id, or falls back to "Default" */
  agentId?: string;
  uiLanguage?: string;
  knowledgeLanguage?: string;
}

export const AboutModal = ({
  open,
  onClose,
  version,
  chatType,
  agentId,
  uiLanguage,
  knowledgeLanguage,
}: AboutModalProps) => {
  if (!open || typeof document === "undefined") return null;

  const rows = [
    { label: "Web Control Version", value: version || "unknown" },
    { label: "Chat", value: chatType },
    { label: "Agent ID", value: agentId || "Default" },
    { label: "UI Language", value: uiLanguage || "—" },
    { label: "Knowledge Language", value: knowledgeLanguage || "—" },
  ];

  return createPortal(
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <Header>
          <span className="about-title">Web Control Info</span>
          <button className="about-close" onClick={onClose} aria-label="Close">
            <Close />
          </button>
        </Header>
        <InfoList>
          {rows.map((row) => (
            <InfoRow key={row.label}>
              <span className="about-label">{row.label}</span>
              <span className="about-value">{row.value}</span>
            </InfoRow>
          ))}
        </InfoList>
      </Container>
    </Overlay>,
    document.body,
  );
};
