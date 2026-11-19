import { useEffect, useRef, useState } from 'react';
import { formatCertDate } from '../../lib/home/cert-dates';

export interface CertSlide {
  name: string;
  issuer: string;
  badge?: { top: string; bottom: string };
  image?: string | null;
  dates?: {
    issued: { en: string; es: string };
    expires: { en: string; es: string };
  };
  issued?: string;
  expires?: string;
  status?: { en: string; es: string };
}

interface Props {
  certs: readonly CertSlide[];
  /** Override for the first cert's remote credential link. Omitted → no link. */
  credential?: { label: { en: string; es: string }; href: string };
  tag?: { en: string; es: string };
}

const AUTOPLAY_MS = 5200;

function pad(index: number, count: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
}

/**
 * Two-cert slider. Autoplay is 5.2s and stops for good on next, previous, or
 * a dot. Hover and focus only pause it. Reduced motion or a single cert never
 * starts it.
 */
export default function CertSlider({ certs, credential, tag }: Props) {
  const count = certs.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [takenOver, setTakenOver] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);
    return () => {
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resume);
    };
  }, []);

  useEffect(() => {
    if (paused || takenOver || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, takenOver, count]);

  function show(next: number, fromUser: boolean) {
    if (count === 0) return;
    setIndex(((next % count) + count) % count);
    if (fromUser) setTakenOver(true);
  }

  return (
    <div
      ref={rootRef}
      data-testid="cert-slider"
      className="relative flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        {tag ? (
          <p className="font-mono text-xs uppercase text-muted">
            <span data-lang-content="en">{tag.en}</span>
            <span data-lang-content="es">{tag.es}</span>
          </p>
        ) : (
          <span />
        )}
        {count > 0 && (
          <p
            data-testid="cert-position"
            className="font-mono text-[11px] tracking-wide text-dim"
          >
            {pad(index, count)}
          </p>
        )}
      </div>

      <div className="relative min-h-[148px]">
        {certs.map((cert, i) => {
          const issued = formatCertDate(cert.issued);
          const expires = formatCertDate(cert.expires);
          const active = i === index;
          return (
            <div
              key={cert.name}
              className={`absolute inset-0 flex items-center gap-4 transition duration-300 ease-out motion-reduce:transition-none ${
                active
                  ? 'z-10 translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-1 opacity-0'
              }`}
              aria-hidden={active ? undefined : true}
            >
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={cert.name}
                  width={74}
                  height={74}
                  className="size-[74px] rounded-[14px] object-contain"
                />
              ) : (
                cert.badge && (
                  <div
                    className="flex size-[74px] flex-col items-center justify-center rounded-[14px] bg-[linear-gradient(145deg,#2F6BFF,#1b3fa8)] shadow-[0_10px_30px_rgba(47,107,255,0.35)]"
                    aria-hidden="true"
                  >
                    <span className="font-serif text-2xl text-white">
                      {cert.badge.top}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.1em] text-white/80">
                      {cert.badge.bottom}
                    </span>
                  </div>
                )
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <p className="font-sans font-semibold text-[17px] text-text">
                    {cert.name}
                  </p>
                  <p className="font-mono text-[11px] text-faint">
                    {cert.issuer}
                  </p>
                </div>
                {(issued || expires) && cert.dates && (
                  <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
                    {issued && (
                      <div className="flex gap-1.5">
                        <dt>
                          <span data-lang-content="en">
                            {cert.dates.issued.en}
                          </span>
                          <span data-lang-content="es">
                            {cert.dates.issued.es}
                          </span>
                        </dt>
                        <dd className="text-faint">
                          <time dateTime={issued.dateTime}>{issued.label}</time>
                        </dd>
                      </div>
                    )}
                    {expires && (
                      <div className="flex gap-1.5">
                        <dt>
                          <span data-lang-content="en">
                            {cert.dates.expires.en}
                          </span>
                          <span data-lang-content="es">
                            {cert.dates.expires.es}
                          </span>
                        </dt>
                        <dd className="text-faint">
                          <time dateTime={expires.dateTime}>
                            {expires.label}
                          </time>
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
                {cert.status && (
                  <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success-400/40 bg-success-400/10 px-2.5 py-1 font-mono text-[11px] text-success-400">
                    <span
                      className="size-1.5 rounded-full bg-success-400"
                      aria-hidden="true"
                    />
                    <span data-lang-content="en">{cert.status.en}</span>
                    <span data-lang-content="es">{cert.status.es}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {credential && (
        <a
          href={credential.href}
          target="_blank"
          rel="noopener"
          className="inline-flex w-fit items-center gap-1 font-mono text-[11px] text-primary2 hover:text-text"
        >
          <span data-lang-content="en">{credential.label.en}</span>
          <span data-lang-content="es">{credential.label.es}</span>
          <span aria-hidden="true">↗</span>
        </a>
      )}

      {count > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            {certs.map((cert, i) => (
              <button
                key={cert.name}
                type="button"
                data-testid={`cert-dot-${i}`}
                aria-label={`Certification ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                  i === index ? 'w-5 bg-primary-600' : 'w-1.5 bg-dim'
                }`}
                onClick={() => show(i, true)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="cert-prev"
              aria-label="Previous certification"
              className="inline-flex size-9 items-center justify-center rounded-[9px] border border-border2 bg-panel2 text-body hover:border-primary hover:text-text"
              onClick={() => show(index - 1, true)}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              data-testid="cert-next"
              aria-label="Next certification"
              className="inline-flex size-9 items-center justify-center rounded-[9px] border border-border2 bg-panel2 text-body hover:border-primary hover:text-text"
              onClick={() => show(index + 1, true)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
