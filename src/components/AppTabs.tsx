import { BookOpen, Flag, Trophy } from 'lucide-react';

export type AppPage = 'island' | 'lessons' | 'treasures';

export function AppTabs({ page, onChange }: { page: AppPage; onChange: (page: AppPage) => void }) {
  return (
    <nav className="app-tabs" aria-label="Hoofdnavigatie">
      {(
        [
          ['island', 'Eiland', Flag],
          ['lessons', 'Lessen', BookOpen],
          ['treasures', 'Schatten', Trophy],
        ] as const
      ).map(([id, title, Icon]) => (
        <button
          key={id}
          className={page === id ? 'selected' : ''}
          aria-current={page === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <span>
            <Icon size={27} />
          </span>
          {title}
        </button>
      ))}
    </nav>
  );
}
