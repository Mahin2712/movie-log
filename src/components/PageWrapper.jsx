export default function PageWrapper({ title, children }) {
  return (
    <section className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
