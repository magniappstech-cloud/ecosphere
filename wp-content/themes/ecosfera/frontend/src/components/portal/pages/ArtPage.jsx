import { useState } from 'react';
import { galleryItems, tracks, videos } from '@/data/portalData';

export function ArtPage({ openLightbox }) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [galleryLimit, setGalleryLimit] = useState(4);
  const currentTrack = tracks[trackIndex];

  return (
    <div className="page-inner-pad">
      <section id="music-hero">
        <div className="container">
          <div className="sec-label both reveal" style={{ justifyContent: 'center', marginBottom: 'var(--sp-8)' }}>Музыкальный раздел</div>
          <h2 className="sec-h2 reveal" style={{ textAlign: 'center', marginBottom: 'var(--sp-12)', fontSize: 'clamp(28px,4vw,52px)' }}>Музыка безопасности</h2>
          <div className="music-layout">
            <div className="player">
              <div className="player__cover" aria-hidden="true">
                <img src={currentTrack.cover} alt="" />
                <div className="player__cover-overlay" />
                <div className="player__cover-info">
                  <div className="player__track-title">{currentTrack.title}</div>
                  <div className="player__track-artist">{currentTrack.artist}</div>
                </div>
              </div>
              <div className="player__progress">
                <div className="player__progress-track">
                  <div className="player__progress-fill" style={{ width: `${((trackIndex + 1) / tracks.length) * 100}%` }} />
                </div>
                <div className="player__progress-times">
                  <span>0:{trackIndex + 1}0</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>
              <div className="player__controls" role="group" aria-label="Управление плеером">
                <button className="player__btn" type="button" onClick={() => setTrackIndex((trackIndex - 1 + tracks.length) % tracks.length)}>←</button>
                <button className="player__btn player__btn--play" type="button">▶</button>
                <button className="player__btn" type="button" onClick={() => setTrackIndex((trackIndex + 1) % tracks.length)}>→</button>
                <button className="player__btn player__btn--like" type="button">♡</button>
              </div>
            </div>
            <div className="track-list" role="listbox" aria-label="Список треков">
              <div className="track-list-h">Плейлист — новые → популярные → хронология</div>
              <div className="track-scroll">
                {tracks.map((track, index) => (
                  <button key={track.id} type="button" className={`track-row${index === trackIndex ? ' active' : ''}`} onClick={() => setTrackIndex(index)}>
                    <span className="track-num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="track-cover"><img src={track.cover} alt="" /></span>
                    <span className="track-info">
                      <span className="track-name">{track.title}</span>
                      <span className="track-artist">{track.artist}</span>
                    </span>
                    <span className="track-dur">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="art-gallery" className="sec">
        <div className="container">
          <div className="sec-label reveal">Арт-галерея</div>
          <h2 className="sec-h2 reveal">Безопасность в образах</h2>
          <div className="gallery-grid reveal" role="list">
            {galleryItems.slice(0, galleryLimit).map((item) => (
              <button key={item.id} type="button" className="gallery-item" onClick={() => openLightbox(item.image)}>
                <img src={item.image} alt={item.title} />
                <span className="gallery-item-overlay">+</span>
              </button>
            ))}
          </div>
          {galleryLimit < galleryItems.length ? (
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setGalleryLimit(galleryItems.length)}>Загрузить ещё</button>
            </div>
          ) : null}
        </div>
      </section>

      <section id="video-sec">
        <div className="container">
          <div className="sec-label reveal">Видеораздел</div>
          <h2 className="sec-h2 reveal" style={{ marginBottom: 'var(--sp-8)' }}>Кино о безопасности</h2>
          <div className="video-layout">
            <div>
              <div className="video-player">
                <div className="video-player-bg" aria-hidden="true">🎬</div>
                <div className="video-play-overlay"><button className="video-play-btn" type="button">▶</button></div>
              </div>
              <div className="video-meta">
                <div className="video-title">{videos[0].title}</div>
                <div className="video-author">{videos[0].author} · {videos[0].meta}</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-data)', fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--c-text-2)', marginBottom: 'var(--sp-4)' }}>Рекомендуемые</div>
              <div className="video-sidebar">
                {videos.slice(1).map((video) => (
                  <article key={video.id} className="video-rec">
                    <div className="video-rec-thumb">▶</div>
                    <div>
                      <div className="video-rec-title">{video.title}</div>
                      <div className="video-rec-meta">{video.author}</div>
                      <div className="video-rec-meta">{video.meta}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cascade-gallery" aria-label="Каскадная фото-галерея">
        <div className="cgal-header container">
          <div className="sec-label reveal">Фото-опыт</div>
          <h2 className="sec-h2 reveal">Истории в кадре</h2>
          <p className="sec-sub reveal" style={{ maxWidth: '480px' }}>Листайте влево или вправо — каждая карточка открывает историю. Потяните или нажмите стрелку.</p>
        </div>
        <div className="cgal-stage">
          <div className="swiper cgal-swiper">
            <div className="swiper-wrapper">
              {galleryItems.map((item, index) => (
                <div key={item.id} className="swiper-slide cgal-slide">
                  <img src={item.image} alt={item.title} />
                  <div className="cgal-slide__meta">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{item.title}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
