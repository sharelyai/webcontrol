import { useState, useRef, useCallback, useMemo } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import type { Source } from "@sharelyai/services";
import { useSourceDownload } from "@sharelyai/services";
import {
  BadgeWrapper,
  HoverCard,
  HoverCardRow,
  HoverCardLabel,
  HoverCardValue,
  HoverCardHeader,
  HoverCardLink,
  TypeBadge,
  SimilarityScore,
  HoverCardOpenButton,
} from "./styles";
import {
  FileTextIcon,
  AtomIcon,
  TagIcon,
  UsersIcon,
  LinkIcon,
  ExternalLinkIcon,
  LoaderIcon,
} from "../icons";

interface CitationBadgeProps {
  index: number;
  source: Source;
  onSourceClick?: (sourceId: string) => void;
}

function getFileExtension(source: Source): string | null {
  const filename = source.metadata?.filename;
  if (!filename) return null;
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toUpperCase() : null;
}

function isDownloadableSource(source: Source): boolean {
  const sourceType = source.metadata?.sourceType?.toUpperCase();
  // STRING type sources are text-only, not downloadable files
  if (sourceType === "STRING") return false;
  // Must have a knowledgeId and a filename with an extension to be downloadable
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

export function CitationBadge({
  index,
  source,
  onSourceClick,
}: CitationBadgeProps) {
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSourceClick?.(source.id);
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
  const similarityPercent =
    similarity !== undefined ? Math.round(similarity * 100) : null;

  return (
    <>
      <BadgeWrapper
        ref={safeSetReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label={`Source ${index}: ${source.title}`}
      >
        {index}
      </BadgeWrapper>
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
            {similarityPercent !== null && (
              <SimilarityScore>{similarityPercent}% match</SimilarityScore>
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
