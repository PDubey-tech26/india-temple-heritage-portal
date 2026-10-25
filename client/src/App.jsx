

import React, { useEffect, useMemo, useState } from 'react';

import {

  Link,

  NavLink,

  Route,

  Routes,

  useParams,

} from 'react-router-dom';

import {

  ArrowDown,

  ArrowRight,

  Bookmark,

  Check,

  ChevronDown,

  Clock3,

  Compass,

  Flower2,

  Heart,

  MapPin,

  Menu,

  Search,

  ShieldCheck,

  Sun,

  X,

} from 'lucide-react'
import { temples as demoTemples, festivals } from "./data";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

const readSaved = () => {

  try {

    return JSON.parse(localStorage.getItem('savedTemples') || '[]');

  } catch {

    return [];

  }
}


function useTemples() {
  const [items, setItems] = useState(demoTemples);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`${API}/temples`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load temples");
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) return;

        const apiTemples = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.temples)
            ? payload.temples
            : [];

        const merged = demoTemples.map((demo) => {
          const apiTemple = apiTemples.find(
            (item) =>
              (item.slug && item.slug === demo.slug) ||
              (item.name &&
                item.name.trim().toLowerCase() ===
                  demo.name.trim().toLowerCase())
          );

          if (!apiTemple) return demo;

          return {
            ...demo,
            ...apiTemple,
            image:
              apiTemple.image ||
              apiTemple.image_url ||
              demo.image ||
              "",
          };
        });

        const extras = apiTemples.filter(
          (item) =>
            !demoTemples.some(
              (demo) =>
                (item.slug && item.slug === demo.slug) ||
                (item.name &&
                  item.name.trim().toLowerCase() ===
                    demo.name.trim().toLowerCase())
            )
        );

        setItems([
          ...merged,
          ...extras.map((item) => ({
            ...item,
            image: item.image || item.image_url || "",
          })),
        ]);
      })
      .catch((error) => {
        console.error("Temple loading failed:", error);
        if (active) setItems(demoTemples);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}

function Header() {

  const [open, setOpen] = useState(false);

  return (

    <header className="site-header">

      <div className="nav-wrap">

        <Link

          to="/"

          className="brand"

          onClick={() => setOpen(false)}

        >

          <span className="brand-mark">

            <Flower2 size={23} />

          </span>

          <span>

            <strong>Temple Heritage</strong>

            <small>INDIA · CULTURE · DEVOTION</small>

          </span>

        </Link>

        <button

          className="mobile-menu"

          aria-label={open ? 'Close navigation' : 'Open navigation'}

          onClick={() => setOpen(!open)}

        >

          {open ? <X /> : <Menu />}

        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>

          <NavLink to="/" end onClick={() => setOpen(false)}>

            Discover

          </NavLink>

          <a href="/#festivals" onClick={() => setOpen(false)}>

            Festivals

          </a>

          <a href="/#about" onClick={() => setOpen(false)}>

            Our purpose

          </a>

          <NavLink

            to="/saved"

            onClick={() => setOpen(false)}

            className="nav-saved"

          >

            <Bookmark size={15} /> Saved

          </NavLink>

          <NavLink to="/admin" onClick={() => setOpen(false)}>

            Admin

          </NavLink>

        </nav>

      </div>

    </header>

  );

}

function Footer() {

  return (

    <footer className="footer">

      <div className="footer-inner">

        <Link to="/" className="brand footer-brand">

          <span className="brand-mark">

            <Flower2 size={21} />

          </span>

          <span>

            <strong>Temple Heritage</strong>

            <small>KEEPING STORIES ALIVE</small>

          </span>

        </Link>

        <p>Made to help every journey begin with understanding.</p>

        <small>

          Informational portal · Confirm current details with official temple

          sources.

        </small>

      </div>

    </footer>

  );

}

function TempleCard({ temple }) {

  const [saved, setSaved] = useState(() =>

    readSaved().includes(temple.slug)

  );

  const toggle = (event) => {

    event.preventDefault();

    event.stopPropagation();

    const current = readSaved();

    const next = current.includes(temple.slug)

      ? current.filter((slug) => slug !== temple.slug)

      : [...current, temple.slug];

    localStorage.setItem('savedTemples', JSON.stringify(next));

    setSaved(next.includes(temple.slug));

    window.dispatchEvent(new Event('savedTemplesChanged'));

  };

  return (

    <article className="temple-card">

      <Link

        to={`/temple/${temple.slug}`}

        className="card-link"

      >

        <div className="card-image">

<img

  src={temple.image || temple.image_url || ""}

  alt={temple.name || "Temple"}

  loading="eager"

  onError={(e) => {

    console.log("Image failed:", e.currentTarget.src);

  }}

          />

          <span className="image-tag">

            {temple.category || 'Sacred place'}

          </span>

        </div>

        <div className="card-body">

          <div className="card-location">

            <MapPin size={14} />

            {temple.city}, {temple.state}

          </div>

          <h3>{temple.name}</h3>

          <p>{temple.description || 'Discover this sacred place and its heritage.'}</p>

          <span className="card-more">

            Explore temple <ArrowRight size={16} />

          </span>

        </div>

      </Link>

      <button

        className={`save-btn ${saved ? 'saved' : ''}`}

        onClick={toggle}

        aria-label={saved ? 'Remove saved temple' : 'Save temple'}

      >

        <Heart size={17} fill={saved ? 'currentColor' : 'none'} />

      </button>

    </article>

  );

}

function Home({ items, loading }) {

  const [query, setQuery] = useState('');

  const [state, setState] = useState('All regions');

  const [category, setCategory] = useState('All categories');

  const [sortBy, setSortBy] = useState('name');

  const states = useMemo(

    () => [

      'All regions',

      ...new Set(items.map((temple) => temple.state).filter(Boolean)),

    ].sort((a, b) =>

      a === 'All regions'

        ? -1

        : b === 'All regions'

          ? 1

          : a.localeCompare(b)

    ),

    [items]

  );

  const categories = useMemo(

    () => [

      'All categories',

      ...new Set(items.map((temple) => temple.category).filter(Boolean)),

    ],

    [items]

  );

  const filtered = useMemo(() => {

    const searchText = query.trim().toLowerCase();

    return items

      .filter((temple) => {

        const searchable = [

          temple.name,

          temple.city,

          temple.state,

          temple.deity,

          temple.category,

          temple.description,

        ]

          .filter(Boolean)

          .join(' ')

          .toLowerCase();

        return (

          searchable.includes(searchText) &&

          (state === 'All regions' || temple.state === state) &&

          (category === 'All categories' ||

            temple.category === category)

        );

      })

      .sort((a, b) =>

        sortBy === 'name'

          ? (a.name || '').localeCompare(b.name || '')

          : (a.state || '').localeCompare(b.state || '')

      );

  }, [items, query, state, category, sortBy]);

  const clearFilters = () => {

    setQuery('');

    setState('All regions');

    setCategory('All categories');

    setSortBy('name');

  };

  return (

    <>

      <section className="hero">

        <div className="hero-texture" />

        <div className="hero-inner">

          <div className="eyebrow light">

            <span />

            A JOURNEY THROUGH INDIA'S LIVING HERITAGE

          </div>

          <h1>

            Find the sacred.

            <br />

            <em>Feel the timeless.</em>

          </h1>

          <p>

            Explore the stories, traditions and places of devotion that

            have shaped India's spiritual landscape for generations.

          </p>

          <a className="hero-cta" href="#discover">

            Begin your journey <ArrowDown size={17} />

          </a>

          <div className="hero-note">

            <span className="note-line" />

            Discover with respect. Travel with meaning.

          </div>

        </div>

        <div className="hero-ornament" aria-hidden="true">

          <div className="ornament-ring">

            <Flower2 size={100} />

          </div>

          <span className="ornament-dot dot-one" />

          <span className="ornament-dot dot-two" />

        </div>

        <div className="hero-bottom">॥ सर्वे भवन्तु सुखिनः ॥</div>

      </section>

      <section className="intro-strip">

        <div>

          <span className="intro-icon"><Compass size={22} /></span>

          <div>

            <strong>Explore with context</strong>

            <p>Stories, traditions and heritage</p>

          </div>

        </div>

        <div>

          <span className="intro-icon"><Sun size={22} /></span>

          <div>

            <strong>Plan with care</strong>

            <p>Visitor guidance in one place</p>

          </div>

        </div>

        <div>

          <span className="intro-icon"><ShieldCheck size={22} /></span>

          <div>

            <strong>Respect every tradition</strong>

            <p>Always verify official updates</p>

          </div>

        </div>

      </section>

      <section className="section discover-section" id="discover">

        <div className="section-heading">

          <div>

            <div className="eyebrow">

              <span /> YOUR NEXT CHAPTER

            </div>

            <h2>Places that hold <em>stories.</em></h2>

            <p>

              From ancient stonework to living rituals, find a place that

              calls to you.

            </p>

          </div>

          <span className="section-index">01 / DISCOVER</span>

        </div>

        <div className="search-panel">

          <div className="search-input-wrap">

            <Search size={19} />

            <input

              value={query}

              onChange={(event) => setQuery(event.target.value)}

              placeholder="Search temple, city, deity..."

              aria-label="Search temples"

            />

          </div>

          <label className="region-select">

            <MapPin size={17} />

            <select

              value={state}

              onChange={(event) => setState(event.target.value)}

              aria-label="Filter by state"

            >

              {states.map((item) => (

                <option key={item} value={item}>{item}</option>

              ))}

            </select>

            <ChevronDown size={15} />

          </label>

          <label className="region-select">

            <Flower2 size={17} />

            <select

              value={category}

              onChange={(event) => setCategory(event.target.value)}

              aria-label="Filter by category"

            >

              {categories.map((item) => (

                <option key={item} value={item}>{item}</option>

              ))}

            </select>

            <ChevronDown size={15} />

          </label>

          <label className="region-select">

            <select

              value={sortBy}

              onChange={(event) => setSortBy(event.target.value)}

              aria-label="Sort temples"

            >

              <option value="name">Sort: Name</option>

              <option value="state">Sort: State</option>

            </select>

            <ChevronDown size={15} />

          </label>

        </div>

        <p className="results-count" aria-live="polite">

          {loading ? 'Loading temples...' : `${filtered.length} places to explore`}

        </p>

        {filtered.length > 0 ? (

          <div className="temple-grid">

            {filtered.map((temple) => (

              <TempleCard

                key={temple.slug || temple.id || temple.name}

                temple={temple}

              />

            ))}

          </div>

        ) : (

          <div className="empty-state">

            <Search size={30} />

            <h3>No temples found</h3>

            <p>Try another temple, deity, city, state or category.</p>

            <button className="text-button" onClick={clearFilters}>

              Clear filters

            </button>

          </div>

        )}

      </section>

      <section className="festival-section" id="festivals">

        <div className="festival-decor"><Flower2 size={100} /></div>

        <div className="festival-content">

          <div className="eyebrow light">

            <span /> THE YEAR IN DEVOTION

          </div>

          <h2>

            Every season has

            <br />

            <em>a sacred story.</em>

          </h2>

          <p>

            Festivals bring communities together through ritual, music,

            colour and remembrance. Dates vary each year—confirm locally

            before planning.

          </p>

          <div className="festival-list">

            {festivals.map((festival, index) => (

              <div className="festival-list">
  {festivals.map((festival, index) => (
    <div className="festival-row" key={festival.id ?? festival.name}>
      <span className="festival-num">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div>
        <strong>{festival.name}</strong>
        <small>{festival.description}</small>
      </div>

      <span className="festival-season">{festival.date}</span>
    </div>
  ))}
</div>
            ))}

          </div>

        </div>

      </section>

      <section className="about-section section" id="about">

        <div className="about-art">

          <div className="about-art-inner">

            <Flower2 size={76} />

            <span>श्रद्धा · संस्कृति · विरासत</span>

          </div>

        </div>

        <div className="about-copy">

          <div className="eyebrow"><span /> WHY THIS PORTAL</div>

          <h2>

            Heritage deserves

            <br />

            <em>a home.</em>

          </h2>

          <p>

            Temple information can be scattered across many sources. This

            portal brings discovery and visitor guidance into one thoughtful

            experience—so people can learn before they travel.

          </p>

          <div className="about-points">

            <div><Check size={17} /><span>Understand a temple's history and significance</span></div>

            <div><Check size={17} /><span>Prepare with visitor guidance and local context</span></div>

            <div><Check size={17} /><span>Respect traditions and verify current official notices</span></div>

          </div>

          <p className="disclaimer">

            This is an informational project, not an official temple

            authority. Timings, entry rules and event dates can change.

          </p>

        </div>

      </section>

    </>

  );
}

function TempleDetail({ items, loading }) {
  const { slug } = useParams();
  const temple = items.find((item) => item.slug === slug);

  const [saved, setSaved] = useState(() => readSaved().includes(slug));

  useEffect(() => {
    setSaved(readSaved().includes(slug));
  }, [slug]);

  const toggleSaved = () => {
    const current = readSaved();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];

    localStorage.setItem('savedTemples', JSON.stringify(next));
    setSaved(next.includes(slug));
    window.dispatchEvent(new Event('savedTemplesChanged'));
  };

  if (!temple && loading) {
    return (
      <main className="page-wrap">
        <p>Loading temple details...</p>
      </main>
    );
  }

  if (!temple) {
    return (
      <main className="page-wrap not-found">
        <h1>Temple not found</h1>
        <p>Try exploring the available temples.</p>
        <Link className="primary-button" to="/">
          Back to discover
        </Link>
      </main>
    );
  }

  const demo = demoTemples.find((item) => item.slug === temple.slug);
  const image = demo?.image || temple.image || temple.image_url || '';

  const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
  };

  const rituals = toList(temple.rituals);
  const guidance = toList(temple.visitorGuidance || temple.guidance);
  const festivalsList = toList(temple.festivals);
  const architecture = toList(temple.architecture);
  const facilities = toList(temple.facilities);
  const address = temple.address;
  const officialWebsite = temple.officialWebsite || temple.official_website;
  const source = temple.source;

  return (
    <main className="detail-page page-wrap">
      <div className="detail-hero">
        <img
          src={image}
          alt={temple.name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.style.display = 'none';
          }}
        />

        <div className="detail-overlay" />

        <div className="detail-hero-copy">
          <Link to="/" className="back-link">
            ← All temples
          </Link>

          <div className="eyebrow light">
            <span /> {temple.category || 'SACRED PLACE'}
          </div>

          <h1>{temple.name}</h1>

          <p>
            <MapPin size={17} />
            {temple.city}, {temple.state}
          </p>

          {temple.deity && (
            <p className="temple-deity">
              Presiding deity: {temple.deity}
            </p>
          )}

          <button className="hero-cta" onClick={toggleSaved}>
            {saved ? <Check size={17} /> : <Bookmark size={17} />}
            {saved ? 'Saved to your list' : 'Save this temple'}
          </button>
        </div>
      </div>

      <div className="detail-content">
        <section className="detail-info detail-main">
          <div className="eyebrow">
            <span /> THE STORY
          </div>

          <h2>
            A place of <em>meaning.</em>
          </h2>

          <p>
            {temple.history ||
              temple.description ||
              'Learn about this sacred place and its heritage.'}
          </p>

          <h3>About this sacred place</h3>
          <p>
            {temple.description ||
              'More information will be added soon.'}
          </p>

          {address && (
            <>
              <h3>Location and address</h3>
              <p>{address}</p>
            </>
          )}

          {architecture.length > 0 && (
            <>
              <h3>Architecture and heritage</h3>
              {architecture.map((item, index) => (
                <p key={`${index}-${item}`}>{item}</p>
              ))}
            </>
          )}

          <h3>Rituals and traditions</h3>
          {rituals.length > 0 ? (
            <ul className="detail-list">
              {rituals.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              Please check the temple's official information for current
              rituals and schedules.
            </p>
          )}

          <h3>Major festivals</h3>
          {festivalsList.length > 0 ? (
            <ul className="detail-list">
              {festivalsList.map((item, index) => (
                <li key={`${index}-${item}`}>
                  {typeof item === 'string'
                    ? item
                    : item.name || 'Festival'}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Festival schedules may vary. Check official announcements
              before planning your visit.
            </p>
          )}

          <h3>Visitor guidance</h3>
          {guidance.length > 0 ? (
            <ul className="detail-list">
              {guidance.map((item, index) => (
                <li key={`${index}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              Follow local instructions and verify visitor rules before
              travelling.
            </p>
          )}
        </section>

        <aside className="detail-sidebar visit-card">
          <div className="visit-card-title">
            <Clock3 size={19} />
            <h3>Plan your visit</h3>
          </div>

          <span className="visit-label">DARSHAN / VISITING HOURS</span>
          <p>
            {temple.timings ||
              'Please verify current timings through official sources.'}
          </p>

          <div className="visit-divider" />

          <span className="visit-label">BEST TIME TO VISIT</span>
          <p>
            {temple.bestTime ||
              'Check local weather, festival dates and official notices before travelling.'}
          </p>

          <div className="visit-divider" />

          <span className="visit-label">NEARBY FACILITIES</span>
          {facilities.length > 0 ? (
            <ul>
              {facilities.map((item, index) => (
                <li key={`${index}-${item}`}>
                  {typeof item === 'string'
                    ? item
                    : item.name || 'Facility'}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Check official tourism sources for nearby facilities and
              transport information.
            </p>
          )}

          {officialWebsite && (
            <>
              <div className="visit-divider" />
              <span className="visit-label">OFFICIAL WEBSITE</span>
              <p>
                <a
                  href={officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit official website ↗
                </a>
              </p>
            </>
          )}

          {source && (
            <>
              <div className="visit-divider" />
              <span className="visit-label">INFORMATION SOURCE</span>
              <p>
                {/^https?:\/\//i.test(source) ? (
                  <a href={source} target="_blank" rel="noreferrer">
                    Verify temple information ↗
                  </a>
                ) : (
                  source
                )}
              </p>
            </>
          )}

          <div className="official-note">
            <ShieldCheck size={17} />
            <span>
              Confirm timings, entry rules and event updates with official
              sources before you leave.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Saved({ items }) {

  const [savedSlugs, setSavedSlugs] = useState(readSaved);

  useEffect(() => {

    const refresh = () => setSavedSlugs(readSaved());

    window.addEventListener('savedTemplesChanged', refresh);

    window.addEventListener('storage', refresh);

    return () => {

      window.removeEventListener('savedTemplesChanged', refresh);

      window.removeEventListener('storage', refresh);

    };

  }, []);

  const savedTemples = items.filter((temple) =>

    savedSlugs.includes(temple.slug)

  );

  return (

    <main className="page-wrap saved-page">

      <div className="eyebrow"><span /> YOUR COLLECTION</div>

      <h1>Saved <em>places.</em></h1>

      <p>Keep the temples you want to learn about or visit close at hand.</p>

      {savedTemples.length ? (

        <div className="temple-grid">

          {savedTemples.map((temple) => (

            <TempleCard key={temple.slug || temple.id} temple={temple} />

          ))}

        </div>

      ) : (

        <div className="empty-state">

          <Bookmark size={32} />

          <h3>Your list is waiting</h3>

          <p>Save a temple with the heart icon to find it here.</p>

          <Link className="primary-button" to="/">Explore temples</Link>

        </div>

      )}

    </main>

  );

}


function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('adminRole');
    if (savedRole) return savedRole;
    try {
      const savedToken = localStorage.getItem('adminToken');
      if (!savedToken) return '';
      return JSON.parse(atob(savedToken.split('.')[1])).role || '';
    } catch {
      return '';
    }
  });

  const [templeName, setTempleName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [deity, setDeity] = useState('');
  const [category, setCategory] = useState('Heritage Temple');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState('');
  const [timings, setTimings] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [status, setStatus] = useState('pending');
  const [templeImage, setTempleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingTemple, setSavingTemple] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [temples, setTemples] = useState([]);
  const [loadingTemples, setLoadingTemples] = useState(false);

  const isAdmin = role === 'admin';

  const login = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      const userRole = data.user?.role || '';
      localStorage.setItem('adminToken', data.token);
      if (userRole) localStorage.setItem('adminRole', userRole);
      else localStorage.removeItem('adminRole');

      setRole(userRole);
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setError(`${err.message} — check that the API is running and an authorised admin account exists.`);
    }
  };

  const loadTemples = async (authToken = token) => {
    if (!authToken) return;
    setLoadingTemples(true);
    try {
      const response = await fetch(`${API}/admin/temples`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load temples');
      setTemples(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingTemples(false);
    }
  };

  useEffect(() => {
    if (token) loadTemples(token);
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setTempleName('');
    setCity('');
    setState('');
    setAddress('');
    setDeity('');
    setCategory('Heritage Temple');
    setDescription('');
    setHistory('');
    setTimings('');
    setBestTime('');
    setStatus('pending');
    setTempleImage(null);
    setImagePreview('');
    setImageUrl('');
  };

  const uploadTempleImage = async () => {
    if (!templeImage) throw new Error('Please select a temple image first.');

    const formData = new FormData();
    formData.append('image', templeImage);
    setUploadingImage(true);

    try {
      const response = await fetch(`${API}/admin/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Image upload failed');
      if (!data.url) throw new Error('Image upload response did not include an image URL.');
      setImageUrl(data.url);
      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const startEdit = (temple) => {
    setEditingId(temple.id);
    setTempleName(temple.name || '');
    setCity(temple.city || '');
    setState(temple.state || '');
    setAddress(temple.address || '');
    setDeity(temple.deity || '');
    setCategory(temple.category || 'Heritage Temple');
    setDescription(temple.description || '');
    setHistory(temple.history || '');
    setTimings(temple.timings || '');
    setBestTime(temple.bestTime || '');
    setStatus(temple.status || 'pending');
    setTempleImage(null);
    const currentImage = temple.image_url || temple.image || '';
    setImageUrl(currentImage);
    setImagePreview(currentImage);
    setMessage(`Editing ${temple.name}. Make your changes and save.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTemple = async (event) => {
    event.preventDefault();
    setMessage('');
    setSavingTemple(true);

    try {
      let finalImageUrl = imageUrl;
      if (templeImage) {
        finalImageUrl = await uploadTempleImage();
      }
      if (!editingId && !finalImageUrl) {
        throw new Error('Please select a temple image.');
      }

      const slug = templeName.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const payload = {
        name: templeName.trim(),
        slug,
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        deity: deity.trim(),
        category: category.trim() || 'Heritage Temple',
        description: description.trim(),
        history: history.trim(),
        timings: timings.trim() || 'Please confirm with the temple authority',
        bestTime: bestTime.trim(),
        status: isAdmin ? status : (editingId ? status : 'pending'),
        image_url: finalImageUrl,
      };

      const isEditing = editingId !== null;
      const response = await fetch(
        isEditing ? `${API}/admin/temples/${editingId}` : `${API}/admin/temples`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Could not ${isEditing ? 'update' : 'add'} temple`);

      setMessage(isEditing ? 'Temple updated successfully.' : 'Temple saved as pending review.');
      resetForm();
      await loadTemples();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSavingTemple(false);
    }
  };

  const deleteTemple = async (temple) => {
    if (!isAdmin) {
      setMessage('Only an admin account can delete temple records.');
      return;
    }
    const confirmed = window.confirm(`Delete "${temple.name}" permanently? This action cannot be undone.`);
    if (!confirmed) return;

    setMessage('');
    try {
      const response = await fetch(`${API}/admin/temples/${temple.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not delete temple');

      if (editingId === temple.id) resetForm();
      setMessage(`${temple.name} deleted.`);
      await loadTemples();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const updateStatus = async (temple, nextStatus) => {
    if (!isAdmin) {
      setMessage('Only an admin account can approve or reject temple records.');
      return;
    }
    setMessage('');
    try {
      const response = await fetch(`${API}/admin/temples/${temple.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Status update failed');
      setMessage(`${temple.name}: ${nextStatus}.`);
      await loadTemples();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setToken('');
    setRole('');
    setPassword('');
    setMessage('');
    setTemples([]);
    resetForm();
  };

  if (!token) {
    return (
      <main className="admin-page">
        <form className="admin-card" onSubmit={login}>
          <div className="eyebrow"><span /> CONTENT MANAGEMENT</div>
          <h1>Admin <em>sign in.</em></h1>
          <p>For authorised content editors.</p>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit">
            Sign in securely <ArrowRight size={16} />
          </button>
          <small>
            Admin accounts must be created through the server's secure setup process.
            Public users cannot self-register as admins.
          </small>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-card">
        <div className="eyebrow"><span /> CONTENT MANAGEMENT</div>
        <h1>Admin <em>workspace.</em></h1>
        <p>Add, edit and manage temple information.</p>
        <p><strong>Account role:</strong> {role || 'Not detected — sign out and sign in again if permissions are missing.'}</p>

        <form onSubmit={saveTemple}>
          <h2>{editingId !== null ? 'Edit temple' : 'Add a temple'}</h2>
          <label>
            Temple name
            <input value={templeName} onChange={(event) => setTempleName(event.target.value)} required />
          </label>

          <div className="form-two">
            <label>
              City
              <input value={city} onChange={(event) => setCity(event.target.value)} required />
            </label>
            <label>
              State
              <input value={state} onChange={(event) => setState(event.target.value)} required />
            </label>
          </div>

          <label>
            Full location / address
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Area, road, district or full address"
            />
          </label>

          <div className="form-two">
            <label>
              Main deity
              <input value={deity} onChange={(event) => setDeity(event.target.value)} placeholder="e.g. Lord Shiva" />
            </label>
            <label>
              Category
              <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Jyotirlinga" />
            </label>
          </div>

          <label>
            Description / what the temple is famous for
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Explain its importance and what visitors know it for." />
          </label>

          <label>
            History
            <textarea value={history} onChange={(event) => setHistory(event.target.value)} rows={4} placeholder="Historical background and important facts." />
          </label>

          <div className="form-two">
            <label>
              Darshan timings
              <input value={timings} onChange={(event) => setTimings(event.target.value)} placeholder="e.g. 5:00 AM – 9:00 PM" />
            </label>
            <label>
              Best time to visit
              <input value={bestTime} onChange={(event) => setBestTime(event.target.value)} placeholder="e.g. October–March" />
            </label>
          </div>

          {isAdmin && (
            <label>
              Publication status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          )}

          <label>
            Temple image {editingId !== null ? '(optional when keeping current image)' : ''}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required={editingId === null && !imageUrl}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setTempleImage(file);
                if (file) {
                  const preview = URL.createObjectURL(file);
                  setImagePreview(preview);
                  setImageUrl('');
                }
              }}
            />
          </label>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Temple preview"
              style={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'cover',
                borderRadius: 12,
                margin: '12px 0',
              }}
            />
          )}

          <button className="primary-button" type="submit" disabled={savingTemple || uploadingImage}>
            {uploadingImage ? 'Uploading image…' : savingTemple ? 'Saving…' : editingId !== null ? 'Save temple changes' : 'Create temple record'}
            <ArrowRight size={16} />
          </button>
          {editingId !== null && (
            <button className="text-button" type="button" onClick={resetForm}>
              Cancel editing
            </button>
          )}
        </form>

        {message && <p className="form-message" role="status">{message}</p>}

        <div style={{ marginTop: 28 }}>
          <h2>Temple records</h2>
          <button className="text-button" type="button" onClick={() => loadTemples()}>
            Refresh records
          </button>

          {loadingTemples && <p>Loading temples...</p>}
          {!loadingTemples && temples.length === 0 && <p>No temple records found.</p>}

          {temples.map((temple) => (
            <article
              key={temple.id}
              style={{ borderTop: '1px solid #e5d8ca', padding: '16px 0' }}
            >
              <h3>{temple.name}</h3>
              <p>{temple.city}, {temple.state}</p>
              {temple.address && <p><strong>Location:</strong> {temple.address}</p>}
              {temple.deity && <p><strong>Deity:</strong> {temple.deity}</p>}
              {temple.description && <p>{temple.description}</p>}
              <p>Status: <strong>{temple.status}</strong></p>

              <button className="text-button" type="button" onClick={() => startEdit(temple)}>
                Edit details
              </button>

              {isAdmin && temple.status !== 'approved' && (
                <button className="primary-button" type="button" onClick={() => updateStatus(temple, 'approved')}>
                  Approve
                </button>
              )}
              {isAdmin && temple.status !== 'rejected' && (
                <button className="text-button" type="button" onClick={() => updateStatus(temple, 'rejected')}>
                  Reject
                </button>
              )}
              {isAdmin && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => deleteTemple(temple)}
                  style={{ color: '#b42318' }}
                >
                  Delete temple
                </button>
              )}
            </article>
          ))}
        </div>

        <button className="text-button" type="button" onClick={logout}>
          Sign out
        </button>
      </section>
    </main>
  );
}

export default function App() {

  const { items, loading } = useTemples();

  return (

    <>

      <Header />

      <Routes>

        <Route

          path="/"

          element={<Home items={items} loading={loading} />}

        />

        <Route

          path="/temple/:slug"

          element={<TempleDetail items={items} loading={loading} />}

        />

        <Route path="/saved" element={<Saved items={items} />} />

        <Route path="/admin" element={<AdminLogin />} />

        <Route

          path="*"

          element={

            <main className="page-wrap not-found">

              <h1>Page not found</h1>

              <Link className="primary-button" to="/">

                Back home

              </Link>

            </main>

          }

        />

      </Routes>

      <Footer />

    </>

  );
}
