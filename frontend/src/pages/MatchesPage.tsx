// src/pages/MatchesPage.tsx
import { Heart } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const MatchesPage = () => {
  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Matches
            </h1>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Tus intereses mutuos van a aparecer acá.
            </p>
          </div>

          <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
            <Heart className="size-10 mx-auto text-base-content/30 mb-4" />
            <p className="text-lg font-medium text-base-content/60">
              Todavía no tenés matches confirmados.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};