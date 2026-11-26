import type { ReactNode } from "react";

export interface LegalSection {
  title: string;
  content: ReactNode;
}

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-3xl pb-12">
      <div className="bg-[#F3EFE6] border border-[#343A35]/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <header className="space-y-2 border-b border-[#343A35]/10 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#343A35]">{title}</h1>
          <p className="text-xs text-[#343A35]/70">Última atualização: {updated}</p>
          {intro && (
            <div className="text-sm sm:text-base text-[#343A35]/90 leading-relaxed space-y-3 pt-2">
              {intro}
            </div>
          )}
        </header>

        {sections.map((section, index) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-bold text-[#343A35]">
              {index + 1}. {section.title}
            </h2>
            <div className="text-sm sm:text-base text-[#343A35]/90 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:font-semibold [&_strong]:text-[#343A35]">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}