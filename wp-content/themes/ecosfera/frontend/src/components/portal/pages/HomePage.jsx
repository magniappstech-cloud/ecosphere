import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

const DONE_STATUSES = ['finish', 'done', 'completed', 'finished', 'завершен', 'завершён'];
const GEOCODE_CACHE_KEY = 'ecosfera-city-geocode-cache-v1';
const GEOCODE_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

function MetricCard({ value, label, icon, delay }) {
  return (
    <div className="metric reveal" style={{ transitionDelay: delay }}>
      <span className="metric-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="metric-val">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

function getProjectStatusMeta(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const isDone = DONE_STATUSES.includes(normalized);

  return {
    isDone,
    className: isDone ? 'done' : 'active',
    label: isDone ? 'Завершён' : 'В процессе',
  };
}

function getProjectCountry(project) {
  return project?.countryLabel || project?.countryName || project?.country || 'Россия';
}

function getProjectCityKey(project) {
  return `${String(project?.city || '').trim()}__${String(getProjectCountry(project)).trim()}`;
}

function readGeocodeCache() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(GEOCODE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGeocodeCache(cache) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore localStorage write failures
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function geocodeCity(city, country) {
  const query = `${city}, ${country}`;
  const url = new URL(GEOCODE_ENDPOINT);

  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'ru',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed for ${query}`);
  }

  const results = await response.json();
  const [first] = Array.isArray(results) ? results : [];

  if (!first?.lat || !first?.lon) {
    return null;
  }

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  };
}

function useGeocodedProjects(projects) {
  const [coordinates, setCoordinates] = useState(() => readGeocodeCache());
  const [isLoading, setIsLoading] = useState(false);

  const cityEntries = useMemo(() => {
    const unique = new Map();

    projects.forEach((project) => {
      const city = String(project?.city || '').trim();

      if (!city) {
        return;
      }

      const country = String(getProjectCountry(project)).trim();
      const key = getProjectCityKey(project);

      if (!unique.has(key)) {
        unique.set(key, { key, city, country });
      }
    });

    return Array.from(unique.values());
  }, [projects]);

  useEffect(() => {
    let cancelled = false;

    async function loadMissingCoordinates() {
      const cache = readGeocodeCache();
      const missing = cityEntries.filter(({ key }) => !cache[key]);

      setCoordinates(cache);

      if (!missing.length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const nextCache = { ...cache };

      for (const entry of missing) {
        if (cancelled) {
          return;
        }

        try {
          const result = await geocodeCity(entry.city, entry.country);

          if (result) {
            nextCache[entry.key] = result;
            writeGeocodeCache(nextCache);

            if (!cancelled) {
              setCoordinates({ ...nextCache });
            }
          }
        } catch {
          // one failed city should not block the rest
        }

        await delay(1100);
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    loadMissingCoordinates();

    return () => {
      cancelled = true;
    };
  }, [cityEntries]);

  const mapProjects = useMemo(() => {
    const groupedByCity = new Map();

    projects.forEach((project) => {
      const city = String(project?.city || '').trim();
      const url = String(project?.url || '').trim();
      const key = getProjectCityKey(project);
      const coords = coordinates[key];

      if (!city || !url || !coords) {
        return;
      }

      if (!groupedByCity.has(key)) {
        groupedByCity.set(key, {
          city,
          coords,
          projects: [],
        });
      }

      groupedByCity.get(key).projects.push(project);
    });

    const preparedProjects = [];

    groupedByCity.forEach(({ city, coords, projects: cityProjects }) => {
      const total = cityProjects.length;

      cityProjects.forEach((project, index) => {
        const statusMeta = getProjectStatusMeta(project.status);
        const spreadRadius = total > 1 ? 0.08 : 0;
        const angle = total > 1 ? (Math.PI * 2 * index) / total : 0;

        preparedProjects.push({
          ...project,
          city,
          lat: coords.lat + Math.sin(angle) * spreadRadius,
          lng: coords.lng + Math.cos(angle) * spreadRadius,
          statusMeta,
        });
      });
    });

    return preparedProjects.sort((a, b) => {
      const cityCompare = a.city.localeCompare(b.city, 'ru');
      return cityCompare || a.title.localeCompare(b.title, 'ru');
    });
  }, [coordinates, projects]);

  return {
    mapProjects,
    isLoading,
  };
}

function createMarkerIcon(project, isSelected) {
  return L.divIcon({
    className: 'map-project-marker__wrapper',
    html: `<span class="map-project-marker map-project-marker--${project.statusMeta.className}${isSelected ? ' is-selected' : ''}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createClusterIcon(cluster) {
  const projects = cluster.getAllChildMarkers().flatMap((marker) => marker.options.projects || []);
  const allDone = projects.length && projects.every((project) => project.statusMeta?.isDone);

  return L.divIcon({
    className: 'map-cluster-icon__wrapper',
    html: `
      <span class="map-cluster-icon map-cluster-icon--${allDone ? 'done' : 'active'}">
        ${projects.length}
      </span>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function renderClusterTooltip(projects) {
  return `
    <div class="map-tooltip map-tooltip--cluster">
      <div class="map-tooltip__title">Проекты в выбранной области</div>
      <ul class="map-tooltip__list">
        ${projects
      .map(
        (project) => `
              <li class="map-tooltip__item">
                <span class="map-tooltip__status map-tooltip__status--${project.statusMeta.className}"></span>
                <span class="map-tooltip__text">
                  <strong>${project.city}</strong>
                  <span class="map-tooltip__meta">${project.title} · ${project.statusMeta.label}</span>
                </span>
              </li>
            `
      )
      .join('')}
      </ul>
    </div>
  `;
}

function MapFocusController({ selectedProject }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    const nextZoom = Math.max(map.getZoom(), 6);
    map.flyTo([selectedProject.lat, selectedProject.lng], nextZoom, {
      animate: true,
      duration: 0.75,
    });
  }, [map, selectedProject]);

  return null;
}

function ProjectMap({ projects, selectedProjectId, onSelectProject }) {
  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;

  return (
    <div className="project-map-shell">
      <MapContainer
        center={[58.2, 82]}
        zoom={4}
        minZoom={3}
        maxZoom={11}
        zoomControl={false}
        scrollWheelZoom
        className="project-map"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocusController selectedProject={selectedProject} />

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          maxClusterRadius={42}
          iconCreateFunction={createClusterIcon}
          eventHandlers={{
            clustermouseover: (event) => {
              const projectsInCluster = event.layer.getAllChildMarkers().flatMap((marker) => marker.options.projects || []);

              event.layer.bindTooltip(renderClusterTooltip(projectsInCluster), {
                direction: 'top',
                offset: [0, -14],
                className: 'map-tooltip-container',
                opacity: 1,
              });

              event.layer.openTooltip();
            },
            clustermouseout: (event) => {
              event.layer.closeTooltip();
            },
          }}
        >
          {projects.map((project) => (
            <Marker
              key={project.id}
              position={[project.lat, project.lng]}
              icon={createMarkerIcon(project, selectedProjectId === project.id)}
              projects={[project]}
              eventHandlers={{
                click: () => {
                  onSelectProject(project.id);
                },
                mouseover: () => {
                  onSelectProject(project.id);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -14]} className="map-tooltip-container" opacity={1}>
                <div className="map-tooltip">
                  <div className="map-tooltip__item">
                    <span className={`map-tooltip__status map-tooltip__status--${project.statusMeta.className}`} />
                    <span className="map-tooltip__text">
                      <strong>{project.city}</strong>
                      <span className="map-tooltip__meta">{project.title} · {project.statusMeta.label}</span>
                    </span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

function ProjectSidebar({ projects, selectedProjectId, onSelectProject, isLoading, onOpenProjects }) {
  if (!projects.length) {
    return (
      <aside className="project-sidebar">
        <div className="project-sidebar__empty">
          <h3>Пока нет точек для отображения</h3>
          <p>{isLoading ? 'Получаем координаты городов из OpenStreetMap…' : 'Заполните поле city у проектов, и они появятся и на карте, и в боковом списке.'}</p>
        </div>
      </aside>
    );
  }

  const groupedProjects = projects.reduce((groups, project) => {
    const city = project.city || 'Без города';

    if (!groups.has(city)) {
      groups.set(city, []);
    }

    groups.get(city).push(project);
    return groups;
  }, new Map());

  return (
    <aside className="project-sidebar">
      <div className="project-sidebar__head">
        <div>
          <div className="project-sidebar__eyebrow">Список проектов</div>
          <h3 className="project-sidebar__title">Проекты на карте</h3>
        </div>
        <button className="project-sidebar__all" type="button" onClick={onOpenProjects}>
          Все проекты
        </button>
      </div>

      <div className="project-sidebar__list" role="list">
        {Array.from(groupedProjects.entries()).map(([city, cityProjects]) => (
          <section key={city} className="project-sidebar__group">
            <div className="project-sidebar__group-head">
              <h4 className="project-sidebar__group-title">{city}</h4>
              <span className="project-sidebar__group-count">
                {cityProjects.length} {cityProjects.length === 1 ? 'проект' : cityProjects.length < 5 ? 'проекта' : 'проектов'}
              </span>
            </div>

            <div className="project-sidebar__group-list">
              {cityProjects.map((project) => {
                const isSelected = selectedProjectId === project.id;

                return (
                  <article
                    key={project.id}
                    className={`project-sidebar__item${isSelected ? ' is-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => onSelectProject(project.id)}
                    onFocus={() => onSelectProject(project.id)}
                    onClick={() => onSelectProject(project.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectProject(project.id);
                      }
                    }}
                  >
                    <div className="project-sidebar__item-top">
                      <span className={`project-sidebar__status project-sidebar__status--${project.statusMeta.className}`} />
                      <span className="project-sidebar__label">{project.statusMeta.label}</span>
                    </div>
                    <h4 className="project-sidebar__name">{project.title}</h4>
                    {project.excerpt ? <p className="project-sidebar__excerpt">{project.excerpt}</p> : null}
                    <div className="project-sidebar__actions">
                      <a
                        className="project-sidebar__link"
                        href={project.url}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        Открыть проект
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function ProjectMapSection({ projects, changePage }) {
  const { mapProjects, isLoading } = useGeocodedProjects(projects);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    if (!mapProjects.length) {
      setSelectedProjectId(null);
      return;
    }

    const hasSelectedProject = mapProjects.some((project) => project.id === selectedProjectId);

    if (!hasSelectedProject) {
      setSelectedProjectId(mapProjects[0].id);
    }
  }, [mapProjects, selectedProjectId]);

  return (
    <div className="project-map-layout stagger-item" data-stagger="1">
      <ProjectSidebar
        projects={mapProjects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        isLoading={isLoading}
        onOpenProjects={() => changePage('projects')}
      />
      <div className="project-map-layout__main">
        <ProjectMap projects={mapProjects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} />
        <div className="project-map__caption">
          {mapProjects.length ? (
            <>
              <span>{mapProjects.length} проектов на карте</span>
            </>
          ) : (
            <>
              <span>Пока нет проектов с валидным городом</span>
              <span>{isLoading ? 'Получаем координаты из OpenStreetMap…' : 'Карта и список строятся только по реальным проектам, у которых заполнено поле city.'}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomePage({ data, changePage }) {
  const projects = data?.collections?.projects || [];
  const posts = data?.collections?.posts || [];
  const pages = data?.collections?.pages || [];
  const stats = data?.stats || {};
  const participantsCount = stats.participants || 0;
  const projectsCount = stats.projects || 0;
  const countriesCount = stats.countries || 0;

  const metrics = [
    {
      label: 'Участников',
      value: participantsCount.toLocaleString('ru-RU'),
      delay: '0s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Проектов',
      value: projectsCount,
      delay: '.1s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: 'Документов',
      value: posts.length,
      delay: '.2s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: 'Стран',
      value: countriesCount,
      delay: '.3s',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ];

  const leaders = (pages.length ? pages : posts).slice(0, 4);

  return (
    <>
      <section id="hero" aria-label="Главный экран">
        <div className="hero__bg" id="hero-bg" aria-hidden="true" />
        <div className="hero__content">
          <div className="hero__label">Портал культуры безопасности</div>
          <h1 className="hero__title">
            Культура безопасности
            <br />
            <em>нового уровня</em>
          </h1>
          <p className="hero__sub">Объединяем экспертов, проекты и знания, создаём пространство, где безопасность становится частью жизни каждого.</p>
          <div className="hero__actions">
            <a className="btn-primary" href="#metrics">
              Начать
            </a>
            <button className="btn-secondary" type="button" onClick={() => changePage('projects')}>
              Подробнее
            </button>
          </div>
          <nav className="hero__nav" aria-label="Разделы платформы">
            {[
              [
                'art',
                'Искусство',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="art-icon">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>,
              ],
              [
                'projects',
                'Проекты',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="projects-icon">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>,
              ],
              [
                'news',
                'Новости',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="news-icon">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
                  <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
                  <path d="M4 22a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                </svg>,
              ],
              [
                'initiative',
                'Инициатива',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="initiative-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>,
              ],
              [
                'register',
                'Регистрация',
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" key="register-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>,
              ],
            ].map(([pageId, label, icon]) => (
              <button key={pageId} className="hero-nav-item" type="button" onClick={() => changePage(pageId)}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section id="slogan" className="stagger-section">
        <div className="sec-label both stagger-item">Миссия платформы</div>
        <h1 className="slogan-h1 stagger-item">
          Безопасность —
          <br />
          это <em>культура</em> будущего
        </h1>
        <p className="slogan-h2 stagger-item">Наука. Практика. Творчество.</p>
        <p className="slogan-body stagger-item">Объединяем экспертов, энтузиастов и лидеров вместе, создаём пространство, где знания о безопасности становятся частью жизни каждого.</p>
        <div className="slogan-btns stagger-item">
          <a className="btn btn-primary btn-lg" href="#metrics">
            Исследовать платформу →
          </a>
          <button className="btn btn-ghost btn-lg" type="button" onClick={() => changePage('initiative')}>
            Предложить инициативу
          </button>
        </div>
      </section>

      <section id="metrics">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section id="radar" className="sec stagger-section">
        <div className="container">
          <div className="radar-layout">
            <div>
              <div className="sec-label stagger-item">География проектов</div>
              <h2 className="sec-h2 stagger-item">Интерактивная карта проектов</h2>
              <p className="sec-sub stagger-item">
                Карта строится автоматически по реальным проектам. Список справа теперь сгруппирован по городам: если в одном городе несколько проектов, их удобнее просматривать в одном
                блоке.
              </p>
              <button className="btn-primary stagger-item" type="button" onClick={() => changePage('projects')}>
                Все проекты →
              </button>
              <div className="map-legend stagger-item">
                <span className="map-legend__item map-legend__item--done">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" fill="var(--c-green)" />
                  </svg>
                  Завершён
                </span>
                <span className="map-legend__item map-legend__item--active">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="4" fill="var(--c-coral)" />
                  </svg>
                  В процессе
                </span>
              </div>
            </div>
            <ProjectMapSection projects={projects} changePage={changePage} />
          </div>
        </div>
      </section>

      <section id="leaders" className="stagger-section">
        <div className="container" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="sec-label stagger-item">Сообщество</div>
          <h2 className="sec-h2 stagger-item">Лидеры платформы</h2>
        </div>
        <div className="leaders-outer stagger-item" style={{ padding: '0 var(--sp-8)' }}>
          <div className="leaders-track" id="ltck">
            {leaders.map((item) => (
              <article key={item.id} className="leader-card">
                <div className="leader-card__avatar">{item.title.slice(0, 1)}</div>
                <div className="leader-card__name">{item.title}</div>
                <div className="leader-card__role">{item.excerpt}</div>
              </article>
            ))}
          </div>
        </div>
        <div className="leader-dots" role="tablist" aria-label="Навигация по лидерам">
          {leaders.map((item) => (
            <span key={item.id} className="leader-dot" aria-hidden="true" />
          ))}
        </div>
      </section>
    </>
  );
}
