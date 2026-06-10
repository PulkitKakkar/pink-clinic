import { useEffect, useState } from 'react'
import './App.css'
import pinkLogoAvif from './assets/pink-logo.avif'
import pinkLogoJpeg from './assets/pink-logo-new.jpeg'
import watlingtonImage from './assets/watlington.jpg'
import westStreetImage from './assets/west-street.jpg'
import { westStreetProducts } from './data/westStreetProducts'

type BranchId = 'west-street' | 'watlington-street'

type Branch = {
  id: BranchId
  name: string
  image: string
  address: string
  postcode: string
  description: string
  highlights: string[]
  phone: string
  email: string
  hours: string
}

const BRANCH_KEY = 'pink-clinic-selected-branch-v1'

const branches: Branch[] = [
  {
    id: 'west-street',
    name: 'West Street',
    image: westStreetImage,
    address: '4-5 West Street, Reading',
    postcode: 'RG1 1TT',
    description: 'Classic salon energy, central access, and a familiar beauty-led experience.',
    highlights: ['Classic salon experience', 'Central Reading location', 'Fast-turnaround appointments'],
    phone: '+44 118 999 1100',
    email: 'weststreet@pinkbeauty.co.uk',
    hours: 'Mon-Sat 9:00-18:00',
  },
  {
    id: 'watlington-street',
    name: 'Watlington Street',
    image: watlingtonImage,
    address: '25 Watlington St., Reading',
    postcode: 'RG1 4EN',
    description: 'Modern clinic ambience, free parking, and a premium positioning for advanced treatments.',
    highlights: ['Free parking', 'Premium ambience', 'Advanced clinic services'],
    phone: '+44 118 999 2200',
    email: 'watlington@pinkclinic.co.uk',
    hours: 'Mon-Sat 9:00-19:00',
  },
]

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)

function App() {
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }

    const stored = window.localStorage.getItem(BRANCH_KEY)
    return stored === 'west-street' || stored === 'watlington-street' ? stored : null
  })

  useEffect(() => {
    if (selectedBranch) {
      window.localStorage.setItem(BRANCH_KEY, selectedBranch)
    }
  }, [selectedBranch])

  const currentBranch = selectedBranch ? branches.find((branch) => branch.id === selectedBranch) ?? null : null
  const branchProducts = selectedBranch === 'west-street' ? westStreetProducts : []

  if (!selectedBranch || !currentBranch) {
    return (
      <div className="app-shell landing-mode">
        <header className="topbar">
          <button className="brand brand-logo" onClick={() => setSelectedBranch(null)} type="button">
            <picture className="brand-mark">
              <source srcSet={pinkLogoAvif} type="image/avif" />
              <img src={pinkLogoJpeg} alt="Pink Beauty logo" />
            </picture>
          </button>
          <button className="brand brand-title" onClick={() => setSelectedBranch(null)} type="button">
            <span>
              <strong>Pink Beauty</strong>
              <small>Salon & Aesthetics Clinic</small>
            </span>
          </button>
          <div className="topbar-actions" aria-hidden="true" />
        </header>

        <main className="landing-shell">
          <section className="landing-hero">
            <div className="hero-copy">
              <p className="eyebrow">Select a branch</p>
              <h1>Choose your branch.</h1>
            </div>

            <div className="branch-grid">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  className="branch-card"
                  onClick={() => setSelectedBranch(branch.id)}
                  type="button"
                >
                  <div className="branch-image-wrap">
                    <img src={branch.image} alt={`${branch.name} branch`} className="branch-image" />
                  </div>
                  <div className="branch-card-top">
                    <p className="branch-name">{branch.name}</p>
                    <p className="branch-postcode">{branch.postcode}</p>
                  </div>
                  <p className="branch-address">{branch.address}</p>
                  <span className="branch-cta">Select this branch</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand brand-logo" onClick={() => setSelectedBranch(null)} type="button">
          <picture className="brand-mark">
            <source srcSet={pinkLogoAvif} type="image/avif" />
            <img src={pinkLogoJpeg} alt="Pink Beauty logo" />
          </picture>
        </button>
        <button className="brand brand-title" onClick={() => setSelectedBranch(null)} type="button">
          <span>
            <strong>Pink Beauty</strong>
            <small>Salon & Aesthetics Clinic</small>
          </span>
        </button>

        <div className="topbar-actions">
          <div className="branch-switcher" role="tablist" aria-label="Branch switcher">
            {branches.map((branch) => (
              <button
                key={branch.id}
                className={`branch-switch ${selectedBranch === branch.id ? 'active' : ''}`}
                onClick={() => setSelectedBranch(branch.id)}
                type="button"
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero-panel">
          <div className="hero-panel-copy">
            <p className="eyebrow">Selected branch</p>
            <h1>{currentBranch.name}</h1>
            <p className="hero-text">{currentBranch.address}</p>
          </div>

          <aside className="hero-panel-aside">
            <p className="aside-label">Branch highlights</p>
            <ul className="highlight-list">
              {currentBranch.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <div className="contact-card">
              <p>{currentBranch.description}</p>
              <p>{currentBranch.postcode}</p>
              <p>{currentBranch.hours}</p>
              <p>{currentBranch.phone}</p>
              <p>{currentBranch.email}</p>
            </div>
          </aside>
        </section>

        <section className="content-grid">
          <section className="section-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Catalogue</p>
                <h2>{selectedBranch === 'west-street' ? 'Imported West Street products and prices.' : 'No imported product catalogue yet for this branch.'}</h2>
              </div>
              <p className="section-copy">
                {selectedBranch === 'west-street'
                  ? 'These items come directly from the West Street CSV and replace the earlier placeholder service data.'
                  : 'West Street has the imported product list. Watlington can be populated once its own source file is ready.'}
              </p>
            </div>

            {selectedBranch === 'west-street' ? (
              <div className="product-grid">
                {branchProducts.map((product) => (
                  <article className="product-card" key={`${product.title}-${product.price}`}>
                    <p className="product-category">{product.category}</p>
                    <h3>{product.title}</h3>
                    <strong>{money(product.price)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <article className="info-card">
                <p className="info-label">Catalogue status</p>
                <p>No imported products yet. Once Watlington is ready, its items can be added here.</p>
              </article>
            )}
          </section>

          <section className="section-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Contact</p>
                <h2>Branch details and opening information.</h2>
              </div>
            </div>

            <article className="info-card">
              <p className="info-label">Contact details</p>
              <p>{currentBranch.address}</p>
              <p>{currentBranch.postcode}</p>
              <p>{currentBranch.hours}</p>
              <p>{currentBranch.phone}</p>
              <p>{currentBranch.email}</p>
            </article>
          </section>
        </section>

        {currentBranch.id === 'west-street' && (
          <section className="section-card branch-products-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">West Street catalogue</p>
                <h2>Active products and prices imported from the West Street CSV.</h2>
              </div>
              <p className="section-copy">
                These items are now available for the West Street branch and can be expanded into the
                admin backend later.
              </p>
            </div>

            <div className="product-grid">
              {westStreetProducts.map((product) => (
                <article className="product-card" key={`${product.title}-${product.price}`}>
                  <p className="product-category">{product.category}</p>
                  <h3>{product.title}</h3>
                  <strong>{money(product.price)}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
