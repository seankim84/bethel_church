type Props = {
  en: string;
  ko: string;
};

export function SectionTitle({ en, ko }: Props) {
  return (
    <div className="mb-8">
      <p className="section-title-en">{en}</p>
      <h2 className="section-title-ko">{ko}</h2>
    </div>
  );
}
