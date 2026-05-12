import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CollectionGrid from './components/CollectionGrid';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import { products, collections, categories } from './lib/data';

function Home() {
  const newArrivals = products.filter((p) => p.isNew);
  const featured = products.filter((p) => p.isFeatured);

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

      <div className="divider max-w-[1440px] mx-auto" />

      <CollectionGrid collections={collections} />

      <div className="divider max-w-[1440px] mx-auto" />

      <FeaturedProducts products={newArrivals} title="New Arrivals" subtitle="Just dropped" />

      {/* Category Strip */}
      <section className="py-16 bg-secondary" id="categories-section">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group relative py-8 md:py-12 px-6 border border-border bg-surface hover:bg-ink transition-all duration-500 text-center"
                id={`category-${cat.slug}`}
              >
                <p className="text-overline uppercase text-ink-muted group-hover:text-primary/60 transition-colors duration-500 mb-2">
                  {cat.productCount} Styles
                </p>
                <h3 className="text-title text-ink group-hover:text-primary transition-colors duration-500">
                  {cat.name}
                </h3>
                <p className="text-caption text-ink-secondary group-hover:text-primary/70 transition-colors duration-500 mt-1">
                  {cat.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts products={featured} title="Staff Picks" subtitle="Curated for you" />

      <Newsletter />
      <Footer />
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="font-sans bg-primary text-ink antialiased min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes like /shop, /cart, /login here later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
