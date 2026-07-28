import ResultsClient from "../components/ResultsClient";

export default function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; paid?: string }>;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-10">
      <ResultsClient searchParams={searchParams} />
    </div>
  );
}
