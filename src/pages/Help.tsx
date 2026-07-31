import { Link } from 'react-router-dom';
import { de } from '../i18n/de';

export function Help() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">{de.help.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.help.intro}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">{de.help.modesTitle}</h2>
        <div className="mt-3 flex flex-col gap-3">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{de.help.modesLearnLabel}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{de.help.modesLearnText}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{de.help.modesExamLabel}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{de.help.modesExamText}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{de.help.typesTitle}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{de.help.typesIntro}</p>
        <dl className="mt-3 flex flex-col gap-2">
          {de.help.typesList.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
              <dt className="text-sm font-medium">{item.label}</dt>
              <dd className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <HelpSection title={de.help.srsTitle} text={de.help.srsText} />
      <HelpSection title={de.help.categoriesTitle} text={de.help.categoriesText} />
      <HelpSection title={de.help.progressTitle} text={de.help.progressText} />
      <HelpSection title={de.help.statsTitle} text={de.help.statsText} />
      <HelpSection title={de.help.settingsTitle} text={de.help.settingsText} />
      <HelpSection title={de.help.dataTitle} text={de.help.dataText} />

      <Link to="/" className="mt-2 text-sm text-teal-700 underline dark:text-teal-400">
        {de.help.backToDashboard}
      </Link>
    </div>
  );
}

function HelpSection({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{text}</p>
    </section>
  );
}
