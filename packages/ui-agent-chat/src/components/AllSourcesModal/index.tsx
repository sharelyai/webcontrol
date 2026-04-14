import type { Source } from "@sharelyai/services";
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  SourceChipRelevance,
} from "../styles";
import { IconButton } from "../IconButton";
import { CloseIcon, FileTextIcon } from "../icons";

function getFileExtension(source: Source): string | null {
  const filename = source.metadata?.filename;
  if (!filename) return null;
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toUpperCase() : null;
}

interface AllSourcesModalProps {
  open: boolean;
  onClose: () => void;
  sources: Source[];
  onSourceClick?: (source: Source) => void;
}

export function AllSourcesModal({
  open,
  onClose,
  sources,
  onSourceClick,
}: AllSourcesModalProps) {
  if (!open) return null;

  const sorted = [...sources].sort((a, b) => {
    const aScore = a.metadata?.similarity ?? 0;
    const bScore = b.metadata?.similarity ?? 0;
    return bScore - aScore;
  });

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <ModalHeader>
          <ModalTitle>All sources ({sources.length})</ModalTitle>
          <IconButton
            icon={<CloseIcon size={20} />}
            ariaLabel="Close"
            onClick={onClose}
          />
        </ModalHeader>
        <ModalBody>
          {sorted.map((source) => {
            const similarity = source.metadata?.similarity;
            const pct =
              similarity !== undefined ? Math.round(similarity * 100) : null;

            return (
              <button
                key={source.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "none",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  transition: "background 0.15s",
                }}
                onClick={() => {
                  onSourceClick?.(source);
                  onClose();
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F2F4F7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <FileTextIcon size={18} />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "70%",
                  }}
                >
                  {source.title}
                </span>
                {source.metadata?.pageNumber != null && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#667085",
                      background: "#F2F4F7",
                      borderRadius: 4,
                      padding: "2px 6px",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    p. {source.metadata.pageNumber}
                  </span>
                )}
                {getFileExtension(source) && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#667085",
                      background: "#F2F4F7",
                      borderRadius: 4,
                      padding: "2px 6px",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {getFileExtension(source)}
                  </span>
                )}
                {pct !== null && (
                  <SourceChipRelevance>{pct}%</SourceChipRelevance>
                )}
              </button>
            );
          })}
        </ModalBody>
      </ModalContainer>
    </ModalBackdrop>
  );
}
