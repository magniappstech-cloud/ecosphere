import { useEffect, useRef, useState } from 'react';

const AUDIO_VOLUME_STORAGE_KEY = 'ecosfera-audio-volume';

const FALLBACK_TRACKS = [
  {
    id: 1,
    title: 'Марш ответственности',
    artist: 'Лаборатория Экосферы',
    featuredImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80',
    duration: '3:42',
    audioFile: '',
  },
];

const FALLBACK_GALLERY = [
  {
    id: 1,
    title: 'Память о риске',
    featuredImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80',
  },
  {
    id: 2,
    title: 'Сигналы города',
    featuredImage: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&q=80',
  },
  {
    id: 3,
    title: 'Среда, которая бережет',
    featuredImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1400&q=80',
  },
  {
    id: 4,
    title: 'Производство без травм',
    featuredImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80',
  },
];

const FALLBACK_VIDEOS = [
  {
    id: 1,
    title: 'Кино о безопасности',
    author: 'Редакция Экосферы',
    meta: 'Добавьте видео в WordPress',
    excerpt: 'Здесь будет описание видеоматериала.',
    featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80',
    videoFile: '',
    videoUrl: '',
    embedHtml: '',
  },
];

const FALLBACK_STORIES = [
  {
    id: 1,
    title: 'История в кадре',
    excerpt: 'Создайте отдельную запись истории в админке.',
    featuredImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=80',
    url: '#',
    cardLabel: 'История',
  },
];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;

  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || '');
}

function getVideoSource(video) {
  if (video.videoFile) {
    return { type: 'file', src: video.videoFile, mime: video.videoMime || '' };
  }

  if (video.embedHtml) {
    return { type: 'embed', html: video.embedHtml };
  }

  if (video.videoUrl && isDirectVideoUrl(video.videoUrl)) {
    return { type: 'file', src: video.videoUrl, mime: '' };
  }

  if (video.videoUrl) {
    return { type: 'link', src: video.videoUrl };
  }

  return { type: 'empty' };
}

export function ArtPage({ data, openLightbox }) {
  const tracks = data?.collections?.artAudio?.length ? data.collections.artAudio : FALLBACK_TRACKS;
  const galleryItems = data?.collections?.art?.length ? data.collections.art : FALLBACK_GALLERY;
  const videos = data?.collections?.artVideos?.length ? data.collections.artVideos : FALLBACK_VIDEOS;
  const stories = data?.collections?.artStories?.length ? data.collections.artStories : FALLBACK_STORIES;

  const [trackIndex, setTrackIndex] = useState(0);
  const [galleryLimit, setGalleryLimit] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    if (typeof window === 'undefined') {
      return 0.8;
    }

    const savedVolume = window.localStorage.getItem(AUDIO_VOLUME_STORAGE_KEY);
    const parsedVolume = savedVolume === null ? Number.NaN : Number(savedVolume);

    if (Number.isFinite(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 1) {
      return parsedVolume;
    }

    return 0.8;
  });
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [shouldAutoplayNext, setShouldAutoplayNext] = useState(false);
  const [shouldAutoplaySelected, setShouldAutoplaySelected] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [shouldAutoplayNextVideo, setShouldAutoplayNextVideo] = useState(false);
  const [shouldAutoplaySelectedVideo, setShouldAutoplaySelectedVideo] = useState(false);

  const currentTrack = tracks[trackIndex] || tracks[0];
  const activeVideo = videos[activeVideoIndex] || videos[0];
  const currentTrackDuration = currentTrack?.duration || formatTime(audioDuration);
  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  useEffect(() => {
    if (trackIndex >= tracks.length) {
      setTrackIndex(0);
    }
  }, [trackIndex, tracks.length]);

  useEffect(() => {
    if (activeVideoIndex >= videos.length) {
      setActiveVideoIndex(0);
    }
  }, [activeVideoIndex, videos.length]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setCurrentTime(0);
      setShouldAutoplayNext(true);
      setTrackIndex((previous) => (previous + 1) % tracks.length);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack?.audioFile, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUDIO_VOLUME_STORAGE_KEY, String(volume));
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    setCurrentTime(0);
    setAudioDuration(0);
    setIsPlaying(false);

    if (!audio) {
      return;
    }

    audio.pause();
    audio.load();
  }, [trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || (!shouldAutoplayNext && !shouldAutoplaySelected) || !currentTrack?.audioFile) {
      return;
    }

    const playNextTrack = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      } finally {
        setShouldAutoplayNext(false);
        setShouldAutoplaySelected(false);
      }
    };

    playNextTrack();
  }, [currentTrack?.audioFile, shouldAutoplayNext, shouldAutoplaySelected]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !currentTrack?.audioFile) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const goToPrevTrack = () => {
    setShouldAutoplayNext(false);
    setShouldAutoplaySelected(true);
    setTrackIndex((previous) => (previous - 1 + tracks.length) % tracks.length);
  };

  const goToNextTrack = () => {
    setShouldAutoplayNext(false);
    setShouldAutoplaySelected(true);
    setTrackIndex((previous) => (previous + 1) % tracks.length);
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;

    if (!audio || !audioDuration) {
      return;
    }

    const nextTime = Number(event.target.value);

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };

  const handleTrackSelect = (index) => {
    setShouldAutoplayNext(false);
    setShouldAutoplaySelected(true);
    setTrackIndex(index);
  };

  const activeVideoSource = getVideoSource(activeVideo || {});

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.load();
  }, [activeVideoIndex]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || (!shouldAutoplayNextVideo && !shouldAutoplaySelectedVideo) || activeVideoSource.type !== 'file') {
      return;
    }

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        // Ignore autoplay errors from the browser.
      } finally {
        setShouldAutoplayNextVideo(false);
        setShouldAutoplaySelectedVideo(false);
      }
    };

    playVideo();
  }, [activeVideoIndex, activeVideoSource.type, shouldAutoplayNextVideo, shouldAutoplaySelectedVideo]);

  useEffect(() => {
    if (activeVideoSource.type === 'file') {
      return;
    }

    if (shouldAutoplayNextVideo || shouldAutoplaySelectedVideo) {
      setShouldAutoplayNextVideo(false);
      setShouldAutoplaySelectedVideo(false);
    }
  }, [activeVideoSource.type, shouldAutoplayNextVideo, shouldAutoplaySelectedVideo]);

  const handleVideoEnded = () => {
    setShouldAutoplayNextVideo(true);
    setActiveVideoIndex((previous) => (previous + 1) % videos.length);
  };

  const handleVideoSelect = (index) => {
    setShouldAutoplayNextVideo(false);
    setShouldAutoplaySelectedVideo(true);
    setActiveVideoIndex(index);
  };

  return (
    <div className="page-inner-pad">
      <section id="music-hero">
        <div className="container">
          <div className="sec-label both reveal" style={{ justifyContent: 'center', marginBottom: 'var(--sp-8)' }}>
            Аудиораздел
          </div>
          <h2
            className="sec-h2 reveal"
            style={{ textAlign: 'center', marginBottom: 'var(--sp-12)', fontSize: 'clamp(28px,4vw,52px)' }}
          >
            Аудиоролики
          </h2>
          <div className="music-layout">
            <div className={`player${isPlaying ? ' is-playing' : ''}`}>
              <div className="player__cover" aria-hidden="true">
                <img
                  src={currentTrack?.featuredImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80'}
                  alt=""
                />
                <div className="player__cover-overlay" />
                <div className="player__cover-info">
                  <div className="player__track-title">{currentTrack?.title || 'Аудиоролик'}</div>
                  <div className="player__track-artist">{currentTrack?.artist || 'Автор не указан'}</div>
                </div>
              </div>
              <audio ref={audioRef} preload="metadata">
                {currentTrack?.audioFile ? <source src={currentTrack.audioFile} type={currentTrack.audioMime || undefined} /> : null}
              </audio>
              <div className="player__progress">
                <div
                  className="player__progress-track"
                >
                  <span className="player__progress-fill" style={{ width: `${progressPercent}%` }} />
                  <input
                    className="player__range"
                    type="range"
                    min="0"
                    max={audioDuration || 0}
                    step="0.1"
                    value={Math.min(currentTime, audioDuration || 0)}
                    onChange={handleSeek}
                    aria-label="Промотка аудио"
                    disabled={!currentTrack?.audioFile || !audioDuration}
                    style={{
                      background: `linear-gradient(90deg, var(--c-green) 0%, var(--c-green) ${progressPercent}%, rgba(255,255,255,.08) ${progressPercent}%, rgba(255,255,255,.08) 100%)`,
                    }}
                  />
                </div>
                <div className="player__progress-times">
                  <span>{formatTime(currentTime)}</span>
                  <span>{currentTrackDuration || '0:00'}</span>
                </div>
              </div>
              <div className="player__controls" role="group" aria-label="Управление плеером">
                <button className="player__btn" type="button" onClick={goToPrevTrack} aria-label="Предыдущий трек">
                  ←
                </button>
                <button
                  className="player__btn player__btn--play"
                  type="button"
                  onClick={togglePlay}
                  disabled={!currentTrack?.audioFile}
                  aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                >
                  {isPlaying ? '||' : '▶'}
                </button>
                <button className="player__btn" type="button" onClick={goToNextTrack} aria-label="Следующий трек">
                  →
                </button>
                <a
                  className="player__btn player__btn--like"
                  href={currentTrack?.audioFile || '#'}
                  download
                  aria-disabled={!currentTrack?.audioFile}
                  onClick={(event) => {
                    if (!currentTrack?.audioFile) {
                      event.preventDefault();
                    }
                  }}
                >
                  ↓
                </a>
              </div>
              <div className="player__volume" aria-label="Громкость">
                <span className="player__volume-icon">🔊</span>
                <input
                  className="player__volume-range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Регулировка громкости"
                />
                <span className="player__volume-value">{Math.round(volume * 100)}%</span>
              </div>
            </div>
            <div className="track-list" role="listbox" aria-label="Список аудиороликов">
              <div className="track-list-h">Плейлист</div>
              <div className="track-scroll">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    type="button"
                    className={`track-row${index === trackIndex ? ' active' : ''}`}
                    onClick={() => handleTrackSelect(index)}
                  >
                    <span className="track-num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="track-cover">
                      <img
                        src={track.featuredImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&q=80'}
                        alt=""
                      />
                    </span>
                    <span className="track-info">
                      <span className="track-name">{track.title}</span>
                      <span className="track-artist">{track.artist || 'Автор не указан'}</span>
                    </span>
                    <span className="track-dur">{track.duration || 'аудио'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="art-gallery" className="sec">
        <div className="container">
          <div className="sec-label reveal">Фотогалерея</div>
          <h2 className="sec-h2 reveal">Фотографии</h2>
          <div className="gallery-grid reveal" role="list">
            {galleryItems.slice(0, galleryLimit).map((item) => (
              <button
                key={item.id}
                type="button"
                className="gallery-item"
                onClick={() => openLightbox(item.featuredImage)}
              >
                <img src={item.featuredImage} alt={item.title} />
                <span className="gallery-item-overlay">+</span>
              </button>
            ))}
          </div>
          {galleryLimit < galleryItems.length ? (
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-ghost" type="button" onClick={() => setGalleryLimit(galleryItems.length)}>
                Загрузить ещё
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section id="video-sec">
        <div className="container">
          <div className="sec-label reveal">Видеоплеер</div>
          <h2 className="sec-h2 reveal" style={{ marginBottom: 'var(--sp-8)' }}>
            Видеораздел
          </h2>
          <div className="video-layout">
            <div>
              <div className="video-player">
                {activeVideoSource.type === 'file' ? (
                  <video
                    ref={videoRef}
                    className="art-video-frame"
                    controls
                    preload="metadata"
                    poster={activeVideo?.featuredImage || undefined}
                    onEnded={handleVideoEnded}
                  >
                    <source src={activeVideoSource.src} type={activeVideoSource.mime || undefined} />
                  </video>
                ) : null}
                {activeVideoSource.type === 'embed' ? (
                  <div
                    className="art-video-embed"
                    dangerouslySetInnerHTML={{ __html: activeVideoSource.html }}
                  />
                ) : null}
                {activeVideoSource.type === 'link' ? (
                  <a className="art-video-link" href={activeVideoSource.src} target="_blank" rel="noreferrer">
                    <img
                      src={activeVideo?.featuredImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80'}
                      alt={activeVideo?.title || 'Видео'}
                    />
                    <span className="art-video-link__overlay">Открыть видео</span>
                  </a>
                ) : null}
                {activeVideoSource.type === 'empty' ? (
                  <>
                    <div className="video-player-bg" aria-hidden="true">
                      🎬
                    </div>
                    <div className="video-play-overlay">
                      <button className="video-play-btn" type="button" disabled>
                        ▶
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="video-meta">
                <div className="video-title">{activeVideo?.title || 'Видео'}</div>
                <div className="video-author">
                  {[activeVideo?.author, activeVideo?.meta].filter(Boolean).join(' · ') || 'Добавьте видео в WordPress'}
                </div>
                {activeVideo?.excerpt ? <p className="video-description">{activeVideo.excerpt}</p> : null}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--f-data)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--c-text-2)',
                  marginBottom: 'var(--sp-4)',
                }}
              >
                Рекомендуемые
              </div>
              <div className="video-sidebar">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    className={`video-rec${index === activeVideoIndex ? ' is-active' : ''}`}
                    onClick={() => handleVideoSelect(index)}
                  >
                    <div className="video-rec-thumb">
                      {video.featuredImage ? <img src={video.featuredImage} alt="" /> : '▶'}
                    </div>
                    <div>
                      <div className="video-rec-title">{video.title}</div>
                      <div className="video-rec-meta">{video.author || 'Автор не указан'}</div>
                      <div className="video-rec-meta">{video.meta || 'Видео'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cascade-gallery" aria-label="Истории">
        <div className="cgal-header container">
          <div className="sec-label reveal">Истории</div>
          <h2 className="sec-h2 reveal">Истории в картинках</h2>
          <p className="sec-sub reveal" style={{ maxWidth: '560px' }}>
            Каждая карточка ведёт в отдельную запись WordPress. Используйте этот блок как визуальную витрину историй,
            кейсов и материалов.
          </p>
        </div>
        <div className="container story-grid reveal">
          {stories.map((story, index) => (
            <a key={story.id} className="story-card" href={story.url}>
              <img src={story.featuredImage || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=80'} alt={story.title} />
              <span className="story-card__overlay" />
              <div className="story-card__meta">
                <span className="story-card__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="story-card__tag">{story.cardLabel || 'История'}</span>
              </div>
              <div className="story-card__content">
                <h3>{story.title}</h3>
                {story.excerpt ? <p>{story.excerpt}</p> : null}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
