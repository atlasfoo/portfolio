export interface NavSegment {
  href: string;
  left: number;
  width: number;
  sectionTop: number;
}

export interface PlaceNavHintInput {
  navLeft: number;
  line: number;
  segments: NavSegment[];
}

export type PlaceNavHintOutput =
  | { hidden: true }
  | { hidden: false; x: number; width: number; href: string };

export function placeNavHint(input: PlaceNavHintInput): PlaceNavHintOutput {
  const { navLeft, line, segments } = input;
  if (!segments || segments.length === 0) {
    return { hidden: true };
  }

  if (line < segments[0].sectionTop) {
    return { hidden: true };
  }

  let i = segments.length - 1;
  while (i > 0 && segments[i].sectionTop > line) {
    i--;
  }

  const curr = segments[i];
  if (i === segments.length - 1) {
    return {
      hidden: false,
      x: curr.left - navLeft,
      width: curr.width,
      href: curr.href,
    };
  }

  const next = segments[i + 1];
  const span = next.sectionTop - curr.sectionTop;
  const t = span > 1 ? (line - curr.sectionTop) / span : 1;

  const currentX = curr.left - navLeft;
  const nextX = next.left - navLeft;

  return {
    hidden: false,
    x: currentX + (nextX - currentX) * t,
    width: curr.width + (next.width - curr.width) * t,
    href: t > 0.55 ? next.href : curr.href,
  };
}

export function hintStyle(
  result: PlaceNavHintOutput,
): { opacity: '0' } | { opacity: '1'; transform: string; width: string } {
  if (result.hidden) return { opacity: '0' };
  return {
    opacity: '1',
    transform: `translateX(${result.x}px)`,
    width: `${result.width}px`,
  };
}
