import { useState, useCallback } from "react";
import type { Source } from "@sharelyai/services";
import { useSourceDownload } from "@sharelyai/services";
import {
  SourceChipsContainer,
  SourceChipsHeader,
  SourceChipsContent,
  SourceChip,
  SourceChipHeader,
  SourceTypeIcon,
  SourceChipTitle,
  SourceChipScore,
  SourceChipExpandIcon,
  SourceChipContent,
  SourceChipRow,
  SourceChipLabel,
  SourceChipValue,
  SourceChipExcerpt,
  SourceChipLink,
  SourceChipTypeBadge,
  SourceChipOpenButton,
} from "../styles";
import {
  FileTextIcon,
  AtomIcon,
  TagIcon,
  UsersIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  LoaderIcon,
} from "../icons";

interface SourcesListProps {
  sources: Source[];
  highlightedSourceId?: string | null;
  defaultCollapsed?: boolean;
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

function truncateTitle(title: string, maxLength = 40): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + "...";
}

export function SourcesList({
  sources,
  highlightedSourceId,
  defaultCollapsed = true,
}: SourcesListProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { downloadSource, isLoading } = useSourceDownload();

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleExpanded = useCallback((sourceId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  }, []);

  const handleOpenDocument = useCallback(
    (e: React.MouseEvent, source: Source) => {
      e.stopPropagation();
      downloadSource(source);
    },
    [downloadSource],
  );

  if (sources.length === 0) return null;

  return (
    <SourceChipsContainer>
      <SourceChipsHeader onClick={toggleCollapsed} $collapsed={isCollapsed}>
        <FileTextIcon />
        <h4>Sources</h4>
        <span>({sources.length})</span>
        <SourceChipExpandIcon $expanded={!isCollapsed}>
          {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </SourceChipExpandIcon>
      </SourceChipsHeader>

      {!isCollapsed && (
        <SourceChipsContent>
          {sources.map((source, index) => {
            const isExpanded = expandedIds.has(source.id);
            const isHighlighted = highlightedSourceId === source.id;
            const similarity = source.metadata?.similarity;
            const similarityPercent =
              similarity !== undefined ? Math.round(similarity * 100) : null;

            return (
              <SourceChip
                key={source.id}
                $expanded={isExpanded}
                id={`source-${source.id}`}
                style={{
                  boxShadow: isHighlighted
                    ? "0 0 0 2px var(--color-cornflowerBlue, #6495ED)"
                    : undefined,
                }}
              >
                <SourceChipHeader onClick={() => toggleExpanded(source.id)}>
                  <SourceTypeIcon $type={source.type}>
                    {getSourceTypeIcon(source.type)}
                  </SourceTypeIcon>

                  <SourceChipTitle>
                    [{index + 1}] {truncateTitle(source.title)}
                  </SourceChipTitle>

                  {similarityPercent !== null && (
                    <SourceChipScore>{similarityPercent}%</SourceChipScore>
                  )}

                  <SourceChipExpandIcon $expanded={isExpanded}>
                    <ChevronDownIcon />
                  </SourceChipExpandIcon>
                </SourceChipHeader>

                {isExpanded && (
                  <SourceChipContent>
                    <SourceChipRow>
                      <SourceChipLabel>Type</SourceChipLabel>
                      <SourceChipTypeBadge $type={source.type}>
                        {getSourceTypeIcon(source.type)}
                        {source.type}
                      </SourceChipTypeBadge>
                    </SourceChipRow>

                    <SourceChipRow>
                      <SourceChipLabel>Title</SourceChipLabel>
                      <SourceChipValue>{source.title}</SourceChipValue>
                    </SourceChipRow>

                    {source.metadata?.filename && (
                      <SourceChipRow>
                        <SourceChipLabel>File</SourceChipLabel>
                        <SourceChipValue>
                          {source.metadata.filename}
                        </SourceChipValue>
                      </SourceChipRow>
                    )}

                    {source.metadata?.pageNumber && (
                      <SourceChipRow>
                        <SourceChipLabel>Page</SourceChipLabel>
                        <SourceChipValue>
                          {source.metadata.pageNumber}
                        </SourceChipValue>
                      </SourceChipRow>
                    )}

                    {source.metadata?.knowledgeType && (
                      <SourceChipRow>
                        <SourceChipLabel>Knowledge Type</SourceChipLabel>
                        <SourceChipValue>
                          {source.metadata.knowledgeType}
                        </SourceChipValue>
                      </SourceChipRow>
                    )}

                    {source.metadata?.atomType && (
                      <SourceChipRow>
                        <SourceChipLabel>Atom Type</SourceChipLabel>
                        <SourceChipValue>
                          {source.metadata.atomType}
                        </SourceChipValue>
                      </SourceChipRow>
                    )}

                    {(source.snippet || source.excerpt) && (
                      <SourceChipRow>
                        <SourceChipLabel>Excerpt</SourceChipLabel>
                        <SourceChipExcerpt>
                          {source.snippet || source.excerpt}
                        </SourceChipExcerpt>
                      </SourceChipRow>
                    )}

                    {source.url && (
                      <SourceChipLink
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkIcon />
                        Open link
                      </SourceChipLink>
                    )}

                    {(source.metadata?.knowledgeId || source.id) && (
                      <SourceChipOpenButton
                        onClick={(e) => handleOpenDocument(e, source)}
                        disabled={isLoading}
                      >
                        {isLoading ? <LoaderIcon /> : <ExternalLinkIcon />}
                        {isLoading ? "Opening..." : "Open Document"}
                      </SourceChipOpenButton>
                    )}
                  </SourceChipContent>
                )}
              </SourceChip>
            );
          })}
        </SourceChipsContent>
      )}
    </SourceChipsContainer>
  );
}
