export default function JsonLd({ schema }) {
  if (!schema) return null;
  const list = Array.isArray(schema) ? schema.filter(Boolean) : [schema];
  return (
    <>
      {list.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
