import type { Source } from "@sharely/services";
import {
  SourceIndex,
  SourceLink,
  SourceSnippet,
  SourcesWrapper,
  SourceTitle,
} from "../styles";

interface SourcesListProps {
  sources: Source[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <SourcesWrapper>
      <h4>Sources</h4>
      <ul>
        {sources.map((source, index) => (
          <li key={source.id}>
            <div>
              <SourceIndex>[{index + 1}]</SourceIndex>
              {source.url ? (
                <SourceLink
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title}
                </SourceLink>
              ) : (
                <SourceTitle>{source.title}</SourceTitle>
              )}
            </div>
            {source.snippet && <SourceSnippet>{source.snippet}</SourceSnippet>}
          </li>
        ))}
      </ul>
    </SourcesWrapper>
  );
}
