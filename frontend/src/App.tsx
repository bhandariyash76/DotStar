import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import WaitingListPage from './components/WaitingListPage';
import LatestDropSlider from './components/LatestDropSlider';
import CollectionBannerSlider from './components/CollectionBannerSlider';
import ProductPage from './pages/ProductPage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionPage from './pages/CollectionPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import { products } from './lib/data';
import { ThemeProvider } from './lib/ThemeContext';

const ACCESS_STORAGE_KEY = 'dotstar_access';

function Home() {
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <main>
      <Navbar />
      <Hero />

      {/* Brand Statement */}
      <section className="py-20 md:py-30 px-6 md:px-10 max-w-[1440px] mx-auto text-center" id="brand-section">
        <p className="text-overline uppercase text-ink-muted mb-6">Our philosophy</p>
        <h2 className="text-headline text-ink max-w-2xl mx-auto mb-6">
          Clothes that don't try too hard.
        </h2>
        <p className="text-body text-ink-secondary max-w-lg mx-auto">
          We design for people who value substance over logos. Every piece is
          cut for comfort, built to last, and meant to be worn — not displayed.
        </p>
      </section>

      <LatestDropSlider />

      <CollectionBannerSlider />

      <div className="divider max-w-[1440px] mx-auto" />

      <FeaturedProducts products={newArrivals} title="New Arrivals" subtitle="Just dropped" />

      <Newsletter />
      <Footer />
    </main>
  );
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_STORAGE_KEY) {
        setIsUnlocked(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleUnlock = () => {
    localStorage.setItem(ACCESS_STORAGE_KEY, 'true');
    setIsUnlocked(true);
  };

  return (
    <ThemeProvider>
      {!isUnlocked ? (
        <WaitingListPage onUnlock={handleUnlock} />
      ) : (
        <Router>
          <div className="font-sans bg-primary text-ink antialiased min-h-screen transition-colors duration-500">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:slug" element={<CollectionPage />} />
              <Route path="/new" element={<NewArrivalsPage />} />
            </Routes>
          </div>
        </Router>
      )}
    </ThemeProvider>
  );
}

export default App;
