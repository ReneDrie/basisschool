import { Picture } from '../art/Art';
import { choiceLabel, animalSymbol, type Diagram } from '../content';

export function QuestionVisual({ diagram }: { diagram: Diagram }) {
  if (diagram.kind === 'clock') {
    const minuteAngle = diagram.minute * 6,
      hourAngle = (diagram.hour % 12) * 30 + diagram.minute / 2;
    return (
      <svg
        className={`learning-clock face-${diagram.face ?? 0}`}
        viewBox="0 0 240 240"
        role="img"
        aria-label="Analoge klok met een korte uurwijzer en een lange minuutwijzer"
      >
        <circle cx="120" cy="120" r="110" fill="#fffdf8" stroke="#a7b9c5" strokeWidth="6" />
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1="120"
            y1={i % 5 === 0 ? 18 : 14}
            x2="120"
            y2={i % 5 === 0 ? 26 : 19}
            stroke="#52685f"
            strokeWidth={i % 5 === 0 ? 3 : 1}
            transform={`rotate(${i * 6} 120 120)`}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i + 1) * Math.PI) / 6;
          return (
            <text
              key={i}
              x={120 + 83 * Math.sin(angle)}
              y={120 - 83 * Math.cos(angle) + 7}
              textAnchor="middle"
              fontSize="20"
              fill="#35473c"
            >
              {i + 1}
            </text>
          );
        })}
        <line
          x1="120"
          y1="120"
          x2="120"
          y2="65"
          stroke="#35473c"
          strokeWidth="8"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 120 120)`}
        />
        <line
          x1="120"
          y1="120"
          x2="120"
          y2="39"
          stroke="#567caa"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 120 120)`}
        />
        <circle cx="120" cy="120" r="7" fill="#35473c" />
      </svg>
    );
  }
  if (diagram.kind === 'money')
    return (
      <div className="learning-coins" aria-label="Munten">
        {diagram.cents.map((cents, i) => (
          <div
            key={i}
            className={`learning-coin ${cents >= 100 ? 'euros' : cents >= 10 ? 'gold' : 'copper'}`}
            role="img"
            aria-label={`${cents >= 100 ? cents / 100 : cents} ${cents >= 100 ? 'euro' : 'cent'}`}
          >
            <strong>{cents >= 100 ? cents / 100 : cents}</strong>
            <span>{cents >= 100 ? 'euro' : 'cent'}</span>
          </div>
        ))}
      </div>
    );
  if (diagram.kind === 'shapes')
    return (
      <div className="learning-shapes" role="img" aria-label={diagram.items.map(choiceLabel).join(', ')}>
        {diagram.items.map((item, i) => (
          <Picture key={i} symbol={item} />
        ))}
      </div>
    );
  if (diagram.kind === 'fraction') {
    const filled = (i: number) => (diagram.reverse ? i >= diagram.parts - diagram.filled : i < diagram.filled);
    if (diagram.style === 'pie')
      return (
        <svg
          className="learning-fraction-pie"
          viewBox="0 0 240 240"
          role="img"
          aria-label={`Een geheel met ${diagram.parts} gelijke taartpunten; tel de gekleurde of witte stukken.`}
        >
          {Array.from({ length: diagram.parts }, (_, i) => {
            const a = (i * 2 * Math.PI) / diagram.parts - Math.PI / 2,
              b = ((i + 1) * 2 * Math.PI) / diagram.parts - Math.PI / 2;
            return (
              <path
                key={i}
                d={`M120 120L${120 + 100 * Math.cos(a)} ${120 + 100 * Math.sin(a)}A100 100 0 0 1 ${120 + 100 * Math.cos(b)} ${120 + 100 * Math.sin(b)}Z`}
                fill={filled(i) ? '#c69a70' : '#fffdf4'}
                stroke="#9b8c79"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      );
    return (
      <div
        className={`learning-fraction fraction-${diagram.style ?? 'grid'}`}
        role="img"
        aria-label={`Een geheel verdeeld in ${diagram.parts} gelijke stukken; tel de gekleurde of witte stukken.`}
        style={{
          gridTemplateColumns: `repeat(${diagram.style === 'bar' ? diagram.parts : diagram.parts <= 4 ? diagram.parts : 4}, 1fr)`,
        }}
      >
        {Array.from({ length: diagram.parts }, (_, i) => (
          <span key={i} className={filled(i) ? 'filled' : ''} />
        ))}
      </div>
    );
  }
  if (diagram.kind === 'pattern')
    return (
      <div className="learning-pattern" role="img" aria-label={diagram.items.map(choiceLabel).join(', ')}>
        {diagram.items.map((item, i) => (
          <span key={i} className={item === '?' ? 'empty' : ''} aria-hidden="true">
            <Picture symbol={item} />
          </span>
        ))}
      </div>
    );
  if (diagram.kind === 'comparison')
    return (
      <div className="learning-comparison">
        {diagram.rows.map((row) => (
          <div className="comparison-row" key={row.label}>
            <strong>
              {animalSymbol(row.label) && (
                <span className="comparison-animal" aria-hidden="true">
                  <Picture symbol={animalSymbol(row.label)!} />
                </span>
              )}
              {row.label}
            </strong>
            <span aria-label={row.objects.map(choiceLabel).join(', ')}>
              {row.objects.map((object, i) => (
                <span key={i} aria-hidden="true">
                  <Picture symbol={object} />
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    );
  if (diagram.kind === 'chart') {
    if (diagram.style === 'table')
      return (
        <table className="learning-table">
          <caption>{diagram.title}</caption>
          <thead>
            <tr>
              <th scope="col">Keuze</th>
              <th scope="col">Stemmen</th>
            </tr>
          </thead>
          <tbody>
            {diagram.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    const max = Math.max(...diagram.rows.map((row) => row.value));
    return (
      <figure className="learning-chart">
        <figcaption>{diagram.title}</figcaption>
        <p>Aantal stemmen</p>
        {diagram.rows.map((row) => (
          <div className="chart-row" key={row.label}>
            <strong>{row.label}</strong>
            <div>
              <span style={{ width: `${(row.value / max) * 100}%` }} />
              <b>{row.value}</b>
            </div>
          </div>
        ))}
      </figure>
    );
  }
  return (
    <div className="learning-picture" role="img" aria-label={diagram.label}>
      <Picture symbol={diagram.symbol} />
    </div>
  );
}
