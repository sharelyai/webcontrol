import { useState, useRef, useCallback } from "react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import type { Source } from "@sharely/services";
import { useSourceDownload } from "@sharely/services";
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

  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

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
        ref={refs.setReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label={`Source ${index}: ${source.title}`}
      >
        {index}
      </BadgeWrapper>
      {isHovered && (
        <HoverCard
          ref={refs.setFloating}
          style={floatingStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <HoverCardHeader>
            <TypeBadge $type={source.type}>
              {getSourceTypeIcon(source.type)}
              {source.type}
            </TypeBadge>
            {similarityPercent !== null && (
              <SimilarityScore>{similarityPercent}% match</SimilarityScore>
            )}
          </HoverCardHeader>

          <HoverCardRow>
            <HoverCardLabel>Title</HoverCardLabel>
            <HoverCardValue>{source.title}</HoverCardValue>
          </HoverCardRow>

          {source.metadata?.filename && (
            <HoverCardRow>
              <HoverCardLabel>File</HoverCardLabel>
              <HoverCardValue>{source.metadata.filename}</HoverCardValue>
            </HoverCardRow>
          )}

          {source.metadata?.pageNumber && (
            <HoverCardRow>
              <HoverCardLabel>Page</HoverCardLabel>
              <HoverCardValue>{source.metadata.pageNumber}</HoverCardValue>
            </HoverCardRow>
          )}

          {(source.snippet || source.excerpt) && (
            <HoverCardRow>
              <HoverCardLabel>Preview</HoverCardLabel>
              <HoverCardValue>
                {source.snippet || source.excerpt}
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

          {(source.metadata?.knowledgeId || source.id) && (
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
