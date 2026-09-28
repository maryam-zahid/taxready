type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={
        centered
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold text-primary">
          {eyebrow}
        </p>
      )}

      <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[34px] lg:text-[40px]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}