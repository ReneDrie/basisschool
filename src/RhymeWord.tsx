import { Art } from './Art';
import { rhymePictures } from './learning/rhymes';

export function RhymeWord({ word }: { word: string }) {
  return (
    <span className="rhyme-word">
      <Art kind={rhymePictures[word]} label={word} />
      <span aria-hidden="true">{word}</span>
    </span>
  );
}
