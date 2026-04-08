import {
  EmptyStateWrapper,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateIcon,
} from "../styles";
import { AutoAwesomeIcon } from "../icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "What can we help you find?",
  description = "Search across all available resources.",
}: EmptyStateProps) {
  return (
    <EmptyStateWrapper>
      <EmptyStateIcon>
        <AutoAwesomeIcon size={48} />
      </EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyStateWrapper>
  );
}
