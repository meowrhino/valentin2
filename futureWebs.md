# Comparativa: Vanilla JS vs GSAP vs anime.js

## Para animaciones tipo PowerPoint (wipes, bounces, barridos)

---

## 1. JS Vainilla Puro (enfoque actual)

### Herramientas
- `clip-path: inset()` animado con CSS transitions para wipes
- `cubic-bezier()` custom para bounces (ej: `cubic-bezier(0.34, 1.56, 0.64, 1)`)
- `@keyframes` para animaciones complejas
- `Web Animations API` (element.animate()) para control programatico
- `requestAnimationFrame` para spring physics manual

### Rendimiento: 9/10
- Zero overhead de libreria (0KB)
- CSS animations corren en compositor thread (GPU)
- clip-path es GPU-accelerated en navegadores modernos
- Sin garbage collection de objetos de animacion

### Estetica: 7/10
- Bounces con cubic-bezier son "close enough" pero no son true spring physics
- Wipes con clip-path se ven profesionales
- Staggers (como el 8x8 grid) requieren setTimeout manual
- Curvas elastic/bounce requieren multiples keyframes para ser convincentes

### Complejidad: Alta
- Spring physics requiere implementar Hooke's law manualmente
- Coordinar animaciones secuenciales requiere Promises/callbacks
- No hay timeline nativo - hay que orquestar manualmente
- Debugging de timing es mas dificil

### Lo que puede hacer bien
- Wipes (clip-path: inset(0 100% 0 0) -> inset(0 0 0 0))
- Fades (opacity transitions)
- Slides (transform: translateX/Y)
- Staggers simples (setTimeout en loop)
- El 8x8 grid actual ya lo hace

### Lo que cuesta mas
- Bounce/boing con overshoot natural
- Spring damping realista
- Coordinar 5+ animaciones en secuencia
- Interrumpir y revertir mid-animation

---

## 2. GSAP (GreenSock Animation Platform)

### Peso: ~30KB (core) | ~50KB con plugins comunes
### CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`

### Herramientas
- `gsap.to()`, `gsap.from()`, `gsap.fromTo()` - animacion de cualquier propiedad
- `gsap.timeline()` - secuencias complejas triviales
- Easings: `bounce.out`, `elastic.out(1, 0.3)`, `back.out(1.7)`, `power4.inOut`
- `ScrollTrigger` plugin - animaciones vinculadas al scroll
- `stagger` nativo - el 8x8 grid seria 3 lineas de codigo
- `clip-path`, `drawSVG`, morphing nativos

### Rendimiento: 10/10
- Motor optimizado que batchea DOM reads/writes
- Usa requestAnimationFrame internamente
- Lazy rendering - solo anima lo que cambia
- Maneja will-change automaticamente
- Benchmark: consistentemente la libreria de animacion mas rapida en la web

### Estetica: 10/10
- Spring physics reales con `elastic.out(amplitude, period)`
- Bounce perfecto con `bounce.out` - rebote fisicamente correcto
- `back.out(overshoot)` - el "boing" que quieres, parametrizable
- Curvas custom con `CustomEase` plugin
- Stagger con `from: "center"`, `from: "edges"`, `from: "random"`

### Complejidad: Baja
```javascript
// Wipe de izq a derecha
gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)", duration: 0.6 });

// Bounce/boing menu
gsap.from(menu, { y: "100vh", duration: 0.8, ease: "back.out(1.7)" });

// 8x8 grid stagger
gsap.to(".grid-cell", { opacity: 1, stagger: { each: 0.02, from: "random" }, duration: 0.15 });

// Color wipe desde centro
gsap.fromTo(overlay, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(100% at 50% 50%)", duration: 0.5 });
```

### Beneficios para este proyecto
- Marquees: ScrollTrigger podria vincular velocidad del marquee al scroll
- Transicion 8x8: se simplifica a 5 lineas (vs ~60 lineas actuales)
- Menu boing: trivial con `ease: "elastic.out(1, 0.5)"`
- Wipes de motivos: clip-path animado trivial
- Color transitions: timeline coordinada con stagger

### Desventajas
- Dependencia externa (rompe el "flex vanilla")
- 30KB extra de JS
- Licencia: gratis para uso no-comercial, pago para empresas con >$150K revenue
- Overkill si solo necesitas 2-3 animaciones simples

---

## 3. anime.js

### Peso: ~17KB
### CDN: `https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js`

### Herramientas
- `anime()` - API unica para todo
- `anime.timeline()` - secuencias
- Easings: `easeOutElastic`, `easeOutBounce`, `spring(mass, stiffness, damping, velocity)`
- Stagger: `anime.stagger(100, {from: 'center'})`
- Targets: CSS selectors, DOM nodes, objetos JS

### Rendimiento: 8/10
- Mas ligera que GSAP pero menos optimizada
- No batchea DOM reads/writes tan agresivamente
- Buena para <50 animaciones simultaneas
- Puede dropear frames en animaciones muy complejas (100+ elementos)

### Estetica: 8/10
- `spring()` easing es bueno pero menos configurable que GSAP
- Bounce y elastic disponibles
- Stagger desde centro/bordes
- Sin morphing SVG ni drawSVG

### Complejidad: Media
```javascript
// Wipe
anime({ targets: el, clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'], duration: 600, easing: 'easeInOutQuad' });

// Bounce menu
anime({ targets: menu, translateY: ['100vh', 0], duration: 800, easing: 'easeOutElastic(1, .6)' });

// Stagger grid
anime({ targets: '.grid-cell', opacity: 1, delay: anime.stagger(20, {from: 'random'}), duration: 150 });
```

### Desventajas
- Menos mantenida que GSAP (ultimo release hace >2 anos)
- Comunidad mas pequena
- Sin ScrollTrigger equivalente
- Performance inferior a GSAP en animaciones pesadas

---

## Tabla Comparativa

| Criterio | Vanilla JS | GSAP | anime.js |
|----------|-----------|------|----------|
| **Peso** | 0KB | ~30KB | ~17KB |
| **Rendimiento** | 9/10 | 10/10 | 8/10 |
| **Estetica bounce/spring** | 7/10 | 10/10 | 8/10 |
| **Wipes/clips** | 8/10 | 10/10 | 8/10 |
| **Complejidad de uso** | Alta | Baja | Media |
| **Stagger (8x8 grid)** | Manual | Nativo | Nativo |
| **Timeline/secuencias** | Manual | Nativo | Nativo |
| **ScrollTrigger** | Manual | Plugin | No tiene |
| **Dependencia** | Ninguna | CDN/npm | CDN/npm |
| **Mantenimiento** | N/A | Activo | Inactivo |
| **Licencia** | N/A | Gratis (<$150K) | MIT |
| **Flex factor** | 10/10 | 6/10 | 7/10 |

---

## Recomendacion

**Para este proyecto:** Vanilla JS es viable para todo lo que necesitamos. Los wipes con `clip-path` + CSS transitions son GPU-accelerated y se ven profesionales. El bounce/boing se puede lograr con `cubic-bezier(0.34, 1.56, 0.64, 1)` que tiene overshoot natural.

**Si en el futuro** las animaciones se vuelven mas complejas (scroll-linked, morphing, timelines de 10+ pasos), GSAP seria la upgrade natural. Es la herramienta standard de la industria y su rendimiento justifica los 30KB.

**anime.js** no la recomiendo — menos mantenida, menos potente que GSAP, y no aporta suficiente sobre vanilla para justificar la dependencia.
