export function getBootstrapData() {
  return window.ecosferaData || {
    site: {
      name: 'Ecosfera',
      description: 'WordPress backend + React frontend',
      url: '/',
    },
    navigation: {
      primary: [],
      footer: [],
    },
    collections: {
      posts: [],
      projects: [],
      initiatives: [],
      art: [],
      artAudio: [],
      artVideos: [],
      artStories: [],
      pages: [],
    },
    current: {
      template: 'front-page',
      post: null,
    },
    rest: {
      bootstrap: '',
    },
  };
}

export async function fetchBootstrap(url) {
  if (!url) {
    return null;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Unable to fetch bootstrap data');
  }

  return response.json();
}
