import { LinkCreator } from "@/components/LinkCreater";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Dynamic Link Creator
        </h1>
        <LinkCreator />
      </div>
    </main>
  );
}