// src/pages/LandingPage.tsx
import { Hero } from '../components/features/landing/Hero';
import { HowItWorks } from '../components/features/landing/HowItWorks';
import { ExploreSpaces } from '../components/features/landing/ExploreSpaces';
import { FeaturedVideos } from '../components/features/landing/FeaturedVideos';
import { Testimonials } from '../components/features/landing/Testimonials';


export const LandingPage = () => {
  return (
    <>
      <Hero />
      <FeaturedVideos/>
      <HowItWorks />
      <ExploreSpaces />
      <Testimonials />
    </>
  );
};
