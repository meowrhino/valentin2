/* ============================================
   PROJECT — Vertical scroll project view
   ============================================ */

const ProjectView = (() => {
  const host = document.getElementById('project-host');
  const content = document.getElementById('project-content');

  let currentAudio = null;

  function show(project) {
    content.innerHTML = '';

    const slug = project.slug;
    const hasContenido = project.contenido && project.contenido.length > 0;

    if (hasContenido) {
      renderContenido(project);
    } else {
      renderArchive(project);
    }

    // Ficha técnica at the end
    renderFicha(project);

    host.classList.remove('project-host--hidden');
    host.style.display = '';
    host.scrollTop = 0;

    // Lazy load all images
    content.querySelectorAll('img[data-src]').forEach(img => {
      Utils.lazyLoad(img, host);
    });
  }

  function renderArchive(project) {
    const count = project.imgCountArchive || 0;
    for (let i = 1; i <= count; i++) {
      const item = document.createElement('div');
      item.className = 'project-item';

      const img = document.createElement('img');
      img.className = 'project-item__img';
      img.dataset.src = Utils.projectImagePath(project.slug, i);
      img.alt = `${project.nombre} ${i}`;

      item.appendChild(img);
      content.appendChild(item);
    }
  }

  function renderContenido(project) {
    project.contenido.forEach(item => {
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
    });
  }

  function createAudioPlayer(slug, src) {
    const wrapper = document.createElement('div');
    wrapper.className = 'audio-player';

    const playBtn = document.createElement('button');
    playBtn.className = 'audio-player__btn';
    playBtn.textContent = '▶ PLAY';

    const timeEl = document.createElement('span');
    timeEl.className = 'audio-player__time';
    timeEl.textContent = '0:00';

    const audio = new Audio();
    audio.src = `${Utils.BASE}/_PROJECTS/${slug}/${src}`;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
        }
        audio.play();
        currentAudio = audio;
        playBtn.textContent = '❚❚ PAUSE';
      } else {
        audio.pause();
        playBtn.textContent = '▶ PLAY';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const m = Math.floor(audio.currentTime / 60);
      const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      timeEl.textContent = `${m}:${s}`;
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶ PLAY';
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

    if (project.descripcion) {
      const desc = document.createElement('div');
      desc.className = 'ficha__row';
      const label = document.createElement('span');
      label.className = 'ficha__label';
      label.textContent = 'Info ';
      const value = document.createElement('span');
      value.className = 'ficha__value';
      value.textContent = project.descripcion;
      desc.appendChild(label);
      desc.appendChild(value);
      ficha.appendChild(desc);
    }

    if (project.lugar) {
      const row = document.createElement('div');
      row.className = 'ficha__row';
      const label = document.createElement('span');
      label.className = 'ficha__label';
      label.textContent = 'Location ';
      const value = document.createElement('span');
      value.className = 'ficha__value';
      value.textContent = project.lugar;
      row.appendChild(label);
      row.appendChild(value);
      ficha.appendChild(row);
    }

    if (project.fecha) {
      const row = document.createElement('div');
      row.className = 'ficha__row';
      const label = document.createElement('span');
      label.className = 'ficha__label';
      label.textContent = 'Date ';
      const value = document.createElement('span');
      value.className = 'ficha__value';
      value.textContent = project.fecha;
      row.appendChild(label);
      row.appendChild(value);
      ficha.appendChild(row);
    }

    if (project.type) {
      const row = document.createElement('div');
      row.className = 'ficha__row';
      const label = document.createElement('span');
      label.className = 'ficha__label';
      label.textContent = 'Type ';
      const value = document.createElement('span');
      value.className = 'ficha__value';
      value.textContent = project.type;
      row.appendChild(label);
      row.appendChild(value);
      ficha.appendChild(row);
    }

    if (project.team && project.team.length) {
      const teamDiv = document.createElement('div');
      teamDiv.className = 'ficha__team';
      project.team.forEach(([name]) => {
        const line = document.createElement('div');
        line.textContent = name;
        teamDiv.appendChild(line);
      });
      ficha.appendChild(teamDiv);
    }

    content.appendChild(ficha);
  }

  function hide() {
    host.classList.add('project-host--hidden');
    host.style.display = 'none';
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    content.innerHTML = '';
  }

  return { show, hide };
})();
