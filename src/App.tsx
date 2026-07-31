import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { de } from './i18n/de';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Quiz } from './pages/Quiz';
import { Result } from './pages/Result';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Review } from './pages/Review';
import { Help } from './pages/Help';

const navItems = [
  { to: '/', label: de.nav.dashboard, end: true },
  { to: '/kategorien', label: de.nav.categories },
  { to: '/quiz', label: de.nav.quiz },
  { to: '/ergebnis', label: de.nav.result },
  { to: '/statistik', label: de.nav.stats },
  { to: '/einstellungen', label: de.nav.settings },
];

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <span className="text-lg font-bold">{de.appName}</span>
          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{de.appTagline}</span>
        </div>
        <NavLink
          to="/anleitung"
          aria-label={de.help.navLabel}
          className={({ isActive }) =>
            `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
              isActive
                ? 'border-teal-500 bg-teal-500 text-white'
                : 'border-slate-300 text-slate-600 hover:border-teal-400 dark:border-slate-700 dark:text-slate-300'
            }`
          }
        >
          ?
        </NavLink>
      </header>

      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kategorien" element={<Categories />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/ergebnis" element={<Result />} />
          <Route path="/statistik" element={<Stats />} />
          <Route path="/einstellungen" element={<Settings />} />
          <Route path="/review-modus" element={<Review />} />
          <Route path="/anleitung" element={<Help />} />
        </Routes>
      </main>

      <nav
        className="sticky bottom-0 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        aria-label="Hauptnavigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 px-1 py-2 text-center text-xs font-medium ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </BrowserRouter>
  );
}

export default App;
