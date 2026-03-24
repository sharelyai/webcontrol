import { ReactNode, Fragment, Children, isValidElement, cloneElement, ReactElement } from "react";
import type { Source } from "@sharelyai/services";
import { CitationBadge } from "../CitationBadge";

interface CitationRendererProps {
  children: ReactNode;
  sources: Source[];
  onSourceClick?: (sourceId: string) => void;
}

// Matches [N] (single) and [N-M] (range) citation patterns
const CITATION_PATTERN = /\[(\d+)(?:-(\d+))?\]/g;

// Process a string to replace citation patterns with CitationBadge components
function processString(
  text: string,
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
  keyPrefix = "",
): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(CITATION_PATTERN);

  while ((match = regex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const startNum = parseInt(match[1], 10);
    const endNum = match[2] ? parseInt(match[2], 10) : startNum;

    // For ranges like [1-6], show the first valid source as the badge
    const sourceIndex = startNum - 1; // Citations are 1-indexed
    const source = sources[sourceIndex];

    if (source) {
      parts.push(
        <CitationBadge
          key={`${keyPrefix}citation-${match.index}-${startNum}`}
          index={startNum}
          source={source}
          onSourceClick={onSourceClick}
        />,
      );
    } else {
      // If no matching source, render as plain text
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last citation
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Recursively process children to handle nested React elements
function processChildren(
  children: ReactNode,
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
  keyPrefix = "",
): ReactNode {
  // Handle null/undefined
  if (children == null) {
    return children;
  }

  // Handle strings - this is where we actually replace citations
  if (typeof children === "string") {
    const parts = processString(children, sources, onSourceClick, keyPrefix);
    if (parts.length === 1 && typeof parts[0] === "string") {
      return parts[0];
    }
    return (
      <>
        {parts.map((part, index) =>
          typeof part === "string" ? (
            <Fragment key={`${keyPrefix}text-${index}`}>{part}</Fragment>
          ) : (
            part
          ),
        )}
      </>
    );
  }

  // Handle numbers (render as-is)
  if (typeof children === "number") {
    return children;
  }

  // Handle arrays
  if (Array.isArray(children)) {
    return Children.map(children, (child, index) =>
      processChildren(child, sources, onSourceClick, `${keyPrefix}${index}-`),
    );
  }

  // Handle React elements - recursively process their children
  if (isValidElement(children)) {
    const element = children as ReactElement<{ children?: ReactNode }>;
    const elementChildren = element.props.children;

    if (elementChildren != null) {
      const processedChildren = processChildren(
        elementChildren,
        sources,
        onSourceClick,
        `${keyPrefix}el-`,
      );
      return cloneElement(element, {}, processedChildren);
    }
    return element;
  }

  // Fallback - return as-is
  return children;
}

export function CitationRenderer({
  children,
  sources,
  onSourceClick,
}: CitationRendererProps) {
  // If no sources, just render children as-is
  if (!sources || sources.length === 0) {
    return <>{children}</>;
  }

  return <>{processChildren(children, sources, onSourceClick)}</>;
}

// Custom text component for ReactMarkdown that handles citations
export function createCitationTextComponent(
  sources: Source[],
  onSourceClick?: (sourceId: string) => void,
) {
  return function CitationText({ children }: { children: ReactNode }) {
    return (
      <CitationRenderer sources={sources} onSourceClick={onSourceClick}>
        {children}
      </CitationRenderer>
    );
  };
}
