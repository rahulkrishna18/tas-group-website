import Link from "next/link";

export default function NotFound() {
  return (
    <main className="chart-grid grid min-h-[100svh] place-items-center bg-abyss px-6 text-center">
      <div>
        <p className="label text-cargo">Status · Off route</p>
        <h1 className="display mt-6 text-[clamp(3rem,10vw,8rem)]">404</h1>
        <p className="mx-auto mt-4 max-w-md text-mist">This page isn’t on our network. Let’s get your cargo back on course.</p>
        <Link href="/" className="btn-cargo mt-8">
          Return to origin
        </Link>
      </div>
    </main>
  );
}
