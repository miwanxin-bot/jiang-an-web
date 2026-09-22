(() => {
  const routes = {
    breakfast: {
      title: '过早',
      kicker: 'BREAKFAST · 早餐一条街',
      intro: '从清晨开始，用一条街读懂老汉口的“过早”。',
      pages: [4, 5]
    },
    coffee: {
      title: '咖啡街',
      kicker: 'COFFEE STREET',
      intro: '在街巷里寻找咖啡香，也看见历史建筑与当代生活的交叠。',
      pages: [6, 7]
    },
    oldshops: {
      title: '老字号',
      kicker: 'OLD SHOPS LANE',
      intro: '从熟悉的招牌与味道出发，沿街寻找老汉口留下来的城市记忆。',
      pages: [8, 9]
    },
    bread: {
      title: '面包街',
      kicker: 'BREAD STREET',
      intro: '沿街寻找烘焙香气，在一条街里收集不同口味与店铺。',
      pages: [10, 11]
    },
    night: {
      title: '宵夜街',
      kicker: 'SUPPER LANE · 夜市一条街',
      intro: '从暮色到深夜，沿着江岸街巷寻找热气腾腾的夜生活。',
      pages: [12, 13]
    },
    skyline: {
      title: '江岸之巅',
      kicker: 'JIANG’AN SKYLINE DINING',
      intro: '从街巷走向高处，在城市夜景中继续江岸的味觉旅程。',
      pages: [14]
    }
  };

  const mapView = document.getElementById('mapView');
  const detailView = document.getElementById('detailView');
  const detailTitle = document.getElementById('detailTitle');
  const detailKicker = document.getElementById('detailKicker');
  const detailIntro = document.getElementById('detailIntro');
  const pageStack = document.getElementById('pageStack');
  const backBtn = document.getElementById('backBtn');
  const endBackBtn = document.getElementById('endBackBtn');
  const menuBtn = document.getElementById('menuBtn');
  const routeMenu = document.getElementById('routeMenu');
  const zoomBtn = document.getElementById('zoomBtn');
  const mapCanvas = document.getElementById('mapCanvas');
  const mapScroller = document.getElementById('mapScroller');
  const imageViewer = document.getElementById('imageViewer');
  const viewerClose = document.getElementById('viewerClose');
  const viewerLabel = document.getElementById('viewerLabel');
  const viewerScroller = document.getElementById('viewerScroller');
  const viewerImage = document.getElementById('viewerImage');
  const zoomOut = document.getElementById('zoomOut');
  const zoomReset = document.getElementById('zoomReset');
  const zoomIn = document.getElementById('zoomIn');
  let viewerZoom = 1;

  function applyViewerZoom() {
    viewerImage.style.width = `${viewerZoom * 100}%`;
    zoomOut.disabled = viewerZoom <= 1;
    zoomIn.disabled = viewerZoom >= 3;
  }

  function openViewer(src, label, alt) {
    viewerZoom = 1;
    viewerImage.src = src;
    viewerImage.alt = alt;
    viewerLabel.textContent = label;
    imageViewer.hidden = false;
    document.body.classList.add('viewer-open');
    applyViewerZoom();
    viewerScroller.scrollTo({top: 0, left: 0});
    viewerClose.focus();
  }

  function closeViewer() {
    imageViewer.hidden = true;
    viewerImage.removeAttribute('src');
    document.body.classList.remove('viewer-open');
  }


  function routeButtons() {
    return document.querySelectorAll('[data-route]');
  }

  function setMenuState(open) {
    routeMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  function renderRoute(key, {scrollTop = true} = {}) {
    const route = routes[key];
    if (!route) return showMap();

    detailTitle.textContent = route.title;
    detailKicker.textContent = route.kicker;
    detailIntro.textContent = route.intro;
    document.title = `${route.title}｜老汉口 看江岸`;

    pageStack.replaceChildren();
    route.pages.forEach((page, index) => {
      const figure = document.createElement('figure');
      figure.className = 'page-card';

      const openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'page-open';
      openBtn.setAttribute('aria-label', `放大查看${route.title}第${index + 1}页`);

      const img = document.createElement('img');
      img.src = `assets/page-${page}.jpg`;
      img.alt = `${route.title}完整页面 ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      openBtn.appendChild(img);
      openBtn.addEventListener('click', () => openViewer(img.src, `${route.title} · ${index + 1} / ${route.pages.length}`, img.alt));

      const caption = document.createElement('figcaption');
      const pageNo = document.createElement('span');
      pageNo.textContent = `${index + 1} / ${route.pages.length}`;
      const tip = document.createElement('span');
      tip.className = 'open-tip';
      tip.textContent = '点击整页放大';
      caption.append(pageNo, tip);

      figure.append(openBtn, caption);
      pageStack.appendChild(figure);
    });

    mapView.hidden = true;
    detailView.hidden = false;
    setMenuState(false);
    routeMenu.querySelectorAll('[data-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.route === key);
    });
    if (scrollTop) window.scrollTo({top: 0, behavior: 'instant'});
  }

  function showMap() {
    detailView.hidden = true;
    mapView.hidden = false;
    document.title = '老汉口 看江岸｜江岸美食分布指南';
    setMenuState(false);
    window.scrollTo({top: 0, behavior: 'instant'});
  }

  function navigate(key) {
    if (!routes[key]) return;
    if (location.hash === `#${key}`) renderRoute(key);
    else location.hash = key;
  }

  routeButtons().forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  backBtn.addEventListener('click', () => {
    if (history.length > 1 && location.hash) history.back();
    else {
      location.hash = '';
      showMap();
    }
  });
  endBackBtn.addEventListener('click', () => {
    if (location.hash) location.hash = '';
    else showMap();
  });

  menuBtn.addEventListener('click', () => setMenuState(routeMenu.hidden));

  zoomBtn.addEventListener('click', () => {
    const isZoomed = mapCanvas.classList.toggle('zoomed');
    zoomBtn.textContent = isZoomed ? '缩小地图' : '放大地图';
    zoomBtn.setAttribute('aria-pressed', String(isZoomed));
    if (!isZoomed) mapScroller.scrollTo({left: 0, behavior: 'smooth'});
  });

  viewerClose.addEventListener('click', closeViewer);
  zoomOut.addEventListener('click', () => {
    viewerZoom = Math.max(1, +(viewerZoom - 0.5).toFixed(1));
    applyViewerZoom();
  });
  zoomReset.addEventListener('click', () => {
    viewerZoom = 1;
    applyViewerZoom();
    viewerScroller.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  });
  zoomIn.addEventListener('click', () => {
    viewerZoom = Math.min(3, +(viewerZoom + 0.5).toFixed(1));
    applyViewerZoom();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !imageViewer.hidden) closeViewer();
  });

  window.addEventListener('hashchange', () => {
    const key = location.hash.slice(1);
    if (routes[key]) renderRoute(key);
    else showMap();
  });

  const initial = location.hash.slice(1);
  if (routes[initial]) renderRoute(initial, {scrollTop: false});
  else showMap();
})();
