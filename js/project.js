/* ============================================
   PROJECT — Vertical scroll project view
   Uses same spacing as home (--gap-base between items)
   ============================================ */

const ProjectView = (() => {
  const host = document.getElementById('project-host');
  const content = document.getElementById('project-content');

  let currentAudio = null;

  function show(project) {
    content.innerHTML = '';

    const hasContenido = project.contenido && project.contenido.length > 0;

    // Top padding — same as home
    const topPad = document.createElement('div');
    topPad.style.height = 'var(--scroll-pad)';
    content.appendChild(topPad);

    if (hasContenido) {
      renderContenido(project);
    } else {
      renderArchive(project);
    }

    // Ficha tecnica at the end
    renderFicha(project);

    host.classList.remove('project-host--hidden');
    host.style.display = '';
    host.scrollTop = 0;

    // Lazy load
    content.querySelectorAll('img[data-src]').forEach(img => {
      Utils.lazyLoad(img, host);
    });
  }

  function addSpacer(parent) {
    const spacer = document.createElement('div');
    spacer.style.height = 'var(--gap-base)';
    parent.appendChild(spacer);
  }

  function renderArchive(project) {
    const count = project.imgCountArchive || 0;
    for (let i = 1; i <= count; i++) {
      const item = document.createElement('div');
      item.className = 'project-item';

      const img = document.createElement('img');
      img.className = 'project-item__img';
      img.dataset.src = Utils.projectImagePath(project.slug, i);
      img.alt = project.nombre + ' ' + i;

      item.appendChild(img);
      content.appendChild(item);

      // Same spacing as home between photos
      if (i < count) addSpacer(content);
    }
  }

  function renderContenido(project) {
    project.contenido.forEach((item, idx) => {
      if (item.tipo === 'imagen') {
        const div = document.createElement('div');
        div.className = 'project-item';

        const img = document.createElement('img');
        img.className = 'project-item__img';
        img.dataset.src = Utils.projectImagePath(project.slug, item.src);
        img.alt = project.nombre;

        div.appendChild(img);
        content.appendChild(div);

      } else if (item.tipo === 'texto') {
        const div = document.createElement('div');
        div.className = 'project-item project-item--text';
        div.style.height = (item.height || 30) + 'dvh';

        const p = document.createElement('p');
        p.className = 'project-item__text';
        p.textContent = item.contenido;

        div.appendChild(p);
        content.appendChild(div);

      } else if (item.tipo === 'audio') {
        const div = document.createElement('div');
        div.className = 'project-item project-item--audio';
        div.style.height = (item.height || 40) + 'dvh';

        const player = createAudioPlayer(project.slug, item.src);
        div.appendChild(player);
        content.appendChild(div);
      }

      // Spacing between items — same as home
      if (idx < project.contenido.length - 1) addSpacer(content);
    });
  }

  function createAudioPlayer(slug, src) {
    const wrapper = document.createElement('div');
    wrapper.className = 'audio-player';

    const playBtn = document.createElement('button');
    playBtn.className = 'audio-player__btn';
    playBtn.textContent = '\u25B6 PLAY';

    const timeEl = document.createElement('span');
    timeEl.className = 'audio-player__time';
    timeEl.textContent = '0:00';

    const audio = new Audio();
    audio.src = Utils.BASE + '/_PROJECTS/' + slug + '/' + src;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        if (currentAudio && currentAudio !== audio) currentAudio.pause();
        audio.play();
        currentAudio = audio;
        playBtn.textContent = '\u275A\u275A PAUSE';
      } else {
        audio.pause();
        playBtn.textContent = '\u25B6 PLAY';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const m = Math.floor(audio.currentTime / 60);
      const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      timeEl.textContent = m + ':' + s;
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '\u25B6 PLAY';
    });

    wrapper.appendChild(playBtn);
    wrapper.appendChild(timeEl);
    return wrapper;
  }

  function renderFicha(project) {
    const ficha = document.createElement('div');
    ficha.className = 'ficha';

    const title = document.createElement('h2');
    title.className = 'ficha__title';
    title.textContent = project.nombre;
    ficha.appendChild(title);

    const fields = [
      { key: 'descripcion', label: 'Info' },
      { key: 'lugar', label: 'Location' },
      { key: 'fecha', label: 'Date' },
      { key: 'type', label: 'Type' }
    ];

    fields.forEach(f => {
      if (project[f.key]) {
        const row = document.createElement('div');
        row.className = 'ficha__row';
        const label = document.createElement('span');
        label.className = 'ficha__label';
        label.textContent = f.label + ' ';
        const value = document.createElement('span');
        value.className = 'ficha__value';
        value.textContent = project[f.key];
        row.appendChild(label);
        row.appendChild(value);
        ficha.appendChild(row);
      }
    });

    if (project.team && project.team.length) {
      const teamDiv = document.createElement('div');
      teamDiv.className = 'ficha__team';
      project.team.forEach(function(entry) {
        const line = document.createElement('div');
        line.textContent = entry[0];
        teamDiv.appendChild(line);
      });
      ficha.appendChild(teamDiv);
    }

    content.appendChild(ficha);
  }

  function hide() {
    host.classList.add('project-host--hidden');
    host.style.display = 'none';
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    content.innerHTML = '';
  }

  return { show, hide };
})();
