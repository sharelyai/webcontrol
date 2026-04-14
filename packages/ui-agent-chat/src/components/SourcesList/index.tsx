import type { Source } from "@sharelyai/services";
import { useSourceDownload } from "@sharelyai/services";
import {
  SourcesSection,
  SourcesSectionLabel,
  SourceChipsRow,
  SourceChipButton,
  SourceChipTitle,
  SourceChipRelevance,
  SourceMoreChip,
} from "../styles";
import { LinkIcon, FileTextIcon } from "../icons";

const MAX_VISIBLE = 5;

function truncateTitle(title: string, maxLength = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + "...";
}

interface SourcesListProps {
  sources: Source[];
  onSourceClick?: (source: Source) => void;
  onShowAllSources?: (sources: Source[]) => void;
  /** @deprecated No longer used in new design */
  defaultCollapsed?: boolean;
  /** @deprecated No longer used in new design */
  highlightedSourceId?: string | null;
}

export function SourcesList({
  sources,
  onSourceClick,
  onShowAllSources,
}: SourcesListProps) {
  const { downloadSource } = useSourceDownload();

  if (sources.length === 0) return null;

  const sorted = [...sources].sort((a, b) => {
    const aScore = a.metadata?.similarity ?? 0;
    const bScore = b.metadata?.similarity ?? 0;
    return bScore - aScore;
  });
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - MAX_VISIBLE;

  const handleClick = (source: Source) => {
    if (onSourceClick) {
      onSourceClick(source);
    } else {
      downloadSource(source);
    }
  };

  return (
    <SourcesSection>
      <SourcesSectionLabel>
        <LinkIcon size={18} />
        Sources
        <span style={{ opacity: 0.7 }}>({sources.length})</span>
      </SourcesSectionLabel>
      <SourceChipsRow>
        {visible.map((source) => {
          const similarity = source.metadata?.similarity;
          const pct =
            similarity !== undefined ? Math.round(similarity * 100) : null;

          return (
            <SourceChipButton
              key={source.id}
              onClick={() => handleClick(source)}
              aria-label={`${source.title}${pct !== null ? `, ${pct}% relevant` : ""}`}
            >
              <FileTextIcon size={18} />
              <SourceChipTitle>
                {truncateTitle(source.title)}
                {source.metadata?.pageNumber != null && (
                  <span style={{ color: "#667085", fontWeight: 400 }}> — p. {source.metadata.pageNumber}</span>
                )}
              </SourceChipTitle>
              {pct !== null && (
                <SourceChipRelevance>{pct}%</SourceChipRelevance>
              )}
            </SourceChipButton>
          );
        })}
        {remaining > 0 && (
          <SourceMoreChip onClick={() => onShowAllSources?.(sources)}>
            +{remaining} more
          </SourceMoreChip>
        )}
      </SourceChipsRow>
    </SourcesSection>
  );
}
