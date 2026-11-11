import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

const newSum = () => ({ a: 12 + Math.floor(Math.random() * 8), b: 6 + Math.floor(Math.random() * 4) });

/** A sum that young children cannot do yet, in front of the settings for parents. */
export function ParentGate({ onPass }: { onPass: () => void }) {
  const [sum, setSum] = useState(newSum),
    [answer, setAnswer] = useState(''),
    [error, setError] = useState(false);
  function check(event: FormEvent) {
    event.preventDefault();
    if (Number(answer.trim()) === sum.a * sum.b) {
      onPass();
      return;
    }
    setSum(newSum());
    setAnswer('');
    setError(true);
  }
  return (
    <form className="parent-gate" onSubmit={check}>
      <p className="modal-intro">
        Hier kun je de groep wijzigen, reservekopieën maken en profielen verwijderen. Los eerst deze som op.
      </p>
      <label className="field-label">
        Hoeveel is {sum.a} × {sum.b}?
        <input
          autoFocus
          autoComplete="off"
          inputMode="numeric"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(false);
          }}
          maxLength={4}
          aria-invalid={error}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          Dat klopte niet. Probeer deze som.
        </p>
      )}
      <button className="primary-button full-width" type="submit" disabled={!answer.trim()}>
        Naar de instellingen
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
