import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function NoteAnswer({ entry }) {
  return <div className="notes-answer">
    <h4>{entry.sourceUrl ? '원문 답변' : '핵심 답변'}</h4>
    {entry.answerMarkdown
      ? <div className="notes-markdown"><Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{entry.answerMarkdown.replace(/<\/br\s*>/gi, '<br>')}</Markdown></div>
      : <p>{entry.answer}</p>}
    {entry.sourceUrl && <a className="notes-original" href={entry.sourceUrl} target="_blank" rel="noreferrer">원문에서 보기 ↗</a>}
  </div>;
}
