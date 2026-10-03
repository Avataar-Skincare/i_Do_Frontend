type Faq = { q: string; a: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="max-w-[820px] mx-auto">
      {faqs.map((faq, i) => (
        <details key={faq.q} className="border-b border-line group" open={i === 0}>
          <summary className="list-none cursor-pointer py-5.5 pr-11 pl-1 font-semibold text-[1.05rem] relative flex marker:content-none [&::-webkit-details-marker]:hidden">
            {faq.q}
            <span className="absolute right-1.5 top-5 text-2xl font-normal text-gold-deep group-open:hidden">+</span>
            <span className="absolute right-1.5 top-5 text-2xl font-normal text-gold-deep hidden group-open:inline">–</span>
          </summary>
          <div className="pb-6 pr-11 pl-1 text-ink-2 text-[0.96rem] leading-[1.65] max-w-[70ch]">{faq.a}</div>
        </details>
      ))}
    </div>
  );
}
