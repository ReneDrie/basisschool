import { Art } from '../art/Art';
import { QuestionVisual } from '../questions/QuestionVisual';
import type { MatchFace } from '../learning/matching';

export function MatchCardFace({ face }: { face: MatchFace }) {
  if (face.kind === 'text')
    return <span className={`match-text ${face.text.length > 22 ? 'match-definition' : ''}`}>{face.text}</span>;
  if (face.kind === 'art')
    return (
      <span className={face.shadow ? 'match-shadow' : ''}>
        <Art kind={face.art} />
      </span>
    );
  if (face.kind === 'count')
    return (
      <span
        className="match-count"
        aria-hidden="true"
        style={{ gridTemplateColumns: `repeat(${Math.min(face.count, 5)},var(--match-count-size,25px))` }}
      >
        {Array.from({ length: face.count }, (_, i) => (
          <Art key={i} kind={face.art} />
        ))}
      </span>
    );
  return <QuestionVisual diagram={face.diagram} />;
}
