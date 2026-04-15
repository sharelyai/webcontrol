import { useState, useRef, useCallback, useMemo } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
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
import {
  HoverCard,
  HoverCardRow,
  HoverCardLabel,
  HoverCardValue,
  HoverCardHeader,
  HoverCardLink,
  TypeBadge,
  SimilarityScore,
  HoverCardOpenButton,
} from "../CitationBadge/styles";
import {
  LinkIcon,
  FileTextIcon,
  AtomIcon,
  TagIcon,
  UsersIcon,
  ExternalLinkIcon,
  LoaderIcon,
} from "../icons";

const MAX_VISIBLE = 5;

function truncateTitle(title: string, maxLength = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + "...";
}

function getFileExtension(source: Source): string | null {
  const filename = source.metadata?.filename;
  if (!filename) return null;
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toUpperCase() : null;
}

function isDownloadableSource(source: Source): boolean {
  const sourceType = source.metadata?.sourceType?.toUpperCase();
  if (sourceType === "STRING") return false;
  if (source.metadata?.knowledgeId && getFileExtension(source)) return true;
  return false;
}

function getSourceTypeIcon(type: Source["type"]) {
  switch (type) {
    case "knowledge":
    case "document":
      return <FileTextIcon />;
    case "atom":
      return <AtomIcon />;
    case "taxonomy":
      return <TagIcon />;
    case "role":
      return <UsersIcon />;
    case "url":
      return <LinkIcon />;
    default:
      return <FileTextIcon />;
  }
}

interface SourceChipWithHoverProps {
  source: Source;
  onClick: (source: Source) => void;
}

function SourceChipWithHover({ source, onClick }: SourceChipWithHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { downloadSource, isLoading } = useSourceDownload();

  const middleware = useMemo(() => [offset(8), flip(), shift({ padding: 8 })], []);
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware,
  });

  const floatingRefs = useRef(refs);
  floatingRefs.current = refs;
  const safeSetReference = useCallback(
    (node: HTMLElement | null) => { floatingRefs.current.setReference(node); },
    []
  );
  const safeSetFloating = useCallback(
    (node: HTMLElement | null) => { floatingRefs.current.setFloating(node); },
    []
  );

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 150);
  };

  const handleOpenDocument = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      downloadSource(source);
    },
    [downloadSource, source],
  );

  const similarity = source.metadata?.similarity;
  const pct = similarity !== undefined ? Math.round(similarity * 100) : null;

  return (
    <>
      <SourceChipButton
        ref={safeSetReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(source)}
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
      {isHovered && (
        <HoverCard
          ref={safeSetFloating}
          style={floatingStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <HoverCardHeader>
            <TypeBadge $type={source.type}>
              {getSourceTypeIcon(source.type)}
              {getFileExtension(source) || source.metadata?.sourceType || source.type}
            </TypeBadge>
            {pct !== null && (
              <SimilarityScore>{pct}% match</SimilarityScore>
            )}
          </HoverCardHeader>

          <HoverCardRow>
            <HoverCardLabel>Title</HoverCardLabel>
            <HoverCardValue>{source.title}</HoverCardValue>
          </HoverCardRow>

          {source.metadata?.filename && getFileExtension(source) && (
            <HoverCardRow>
              <HoverCardLabel>File</HoverCardLabel>
              <HoverCardValue>{source.metadata.filename}</HoverCardValue>
            </HoverCardRow>
          )}

          {source.metadata?.pageNumber && getFileExtension(source) && (
            <HoverCardRow>
              <HoverCardLabel>Page</HoverCardLabel>
              <HoverCardValue>{source.metadata.pageNumber}</HoverCardValue>
            </HoverCardRow>
          )}

          {(source.snippet || source.excerpt) && (
            <HoverCardRow>
              <HoverCardLabel>Preview</HoverCardLabel>
              <HoverCardValue>
                {(source.snippet || source.excerpt || "")
                  .replace(/<[^>]*>/g, "")
                  .replace(/<[^>]*$/, "")
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"')
                  .replace(/&#039;/g, "'")
                  .trim()}
              </HoverCardValue>
            </HoverCardRow>
          )}

          {source.url && (
            <HoverCardLink
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {source.url}
            </HoverCardLink>
          )}

          {source.metadata?.knowledgeId && isDownloadableSource(source) && (
            <HoverCardOpenButton
              onClick={handleOpenDocument}
              disabled={isLoading}
            >
              {isLoading ? <LoaderIcon /> : <ExternalLinkIcon />}
              {isLoading ? "Opening..." : "Open Document"}
            </HoverCardOpenButton>
          )}
        </HoverCard>
      )}
    </>
  );
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
        {visible.map((source) => (
          <SourceChipWithHover
            key={source.id}
            source={source}
            onClick={handleClick}
          />
        ))}
        {remaining > 0 && (
          <SourceMoreChip onClick={() => onShowAllSources?.(sources)}>
            +{remaining} more
          </SourceMoreChip>
        )}
      </SourceChipsRow>
    </SourcesSection>
  );
}
