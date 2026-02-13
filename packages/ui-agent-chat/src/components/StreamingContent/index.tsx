import ReactMarkdown from "react-markdown";
import { Cursor, StreamingWrapper } from "../styles";

interface StreamingContentProps {
  content: string;
}

export function StreamingContent({ content }: StreamingContentProps) {
  return (
    <StreamingWrapper>
      <ReactMarkdown>{content}</ReactMarkdown>
      <Cursor />
    </StreamingWrapper>
  );
}
