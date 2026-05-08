// ===== AUTO THEME DETECTION =====
function setupAutoTheme() {
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }
}


// ===== PIXEL ART BACKGROUND =====
class PixelArtBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.animationId = null;
    this.stars = [];
    this.clouds = [];
    this.time = 0;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createStars();
    this.createClouds();
    this.animate();
    this.setupEventListeners();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars() {
    this.stars = [];
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() > 0.5 ? 2 : 3,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  createClouds() {
    this.clouds = [];
    const cloudCount = 5;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.canvas.height * 0.4),
        speed: 0.2 + Math.random() * 0.3,
        size: 30 + Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.3
      });
    }
  }

  drawPixelRect(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  drawStar(star) {
    const theme = document.documentElement.getAttribute('data-theme');
    const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
    const opacity = 0.5 + (twinkle * 0.5);

    const starColor = theme === 'dark'
      ? `rgba(96, 165, 250, ${opacity})`
      : `rgba(0, 102, 255, ${opacity})`;

    this.drawPixelRect(star.x, star.y, star.size, starColor);
    this.drawPixelRect(star.x - star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x + star.size, star.y, star.size, starColor);
    this.drawPixelRect(star.x, star.y - star.size, star.size, starColor);
    this.drawPixelRect(star.x, star.y + star.size, star.size, starColor);
  }

  drawCloud(cloud) {
    const theme = document.documentElement.getAttribute('data-theme');
    const cloudColor = theme === 'dark'
      ? `rgba(96, 165, 250, ${cloud.opacity})`
      : `rgba(0, 102, 255, ${cloud.opacity})`;

    const pixelSize = 4;
    const cloudPattern = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0]
    ];

    cloudPattern.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel === 1) {
          this.drawPixelRect(
            cloud.x + colIndex * pixelSize,
            cloud.y + rowIndex * pixelSize,
            pixelSize,
            cloudColor
          );
        }
      });
    });

    cloud.x -= cloud.speed;
    if (cloud.x < -cloud.size * 2) {
      cloud.x = this.canvas.width + cloud.size;
      cloud.y = Math.random() * (this.canvas.height * 0.4);
    }
  }

  drawPixelGrid() {
    const theme = document.documentElement.getAttribute('data-theme');
    const gridColor = theme === 'dark'
      ? 'rgba(96, 165, 250, 0.03)'
      : 'rgba(0, 102, 255, 0.03)';

    const gridSize = 20;
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPixelGrid();
    this.stars.forEach(star => this.drawStar(star));
    this.clouds.forEach(cloud => this.drawCloud(cloud));
    this.time += 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  setupEventListeners() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resizeCanvas();
        this.createStars();
        this.createClouds();
      }, 250);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      } else {
        if (!this.animationId) {
          this.animate();
        }
      }
    });
  }
}

// ===== SCROLL SPY NAVIGATION =====
class ScrollSpyNavigation {
  constructor() {
    this.navHeader = document.querySelector('.nav-header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('.section, .hero-section');
    this.init();
  }

  init() {
    this.setupScrollSpy();
    this.setupSmoothScroll();
    this.setupScrollHeader();
  }

  setupScrollSpy() {
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.updateActiveSection();
      }, 50);
    }, { passive: true });

    this.updateActiveSection();
  }

  updateActiveSection() {
    const scrollPosition = window.scrollY + 200;

    let currentSection = 'hero';

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });

    this.updateActiveLink(currentSection);
  }

  updateActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }

  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollHeader() {
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.navHeader.classList.add('scrolled');
      } else {
        this.navHeader.classList.remove('scrolled');
      }
      lastScrollY = window.scrollY;
    }, { passive: true });
  }
}

// ===== MOBILE MENU =====
class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.overlay = document.querySelector('.mobile-menu-overlay');
    this.closeBtn = document.querySelector('.mobile-menu-close');
    this.navLinks = document.querySelectorAll('.mobile-nav-link');
    this.init();
  }

  init() {
    if (!this.toggle || !this.overlay) return;

    this.toggle.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        this.close();

        setTimeout(() => {
          const target = document.querySelector(targetId);
          if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }, 300);
      });
    });
  }

  open() {
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ===== TYPED TEXT EFFECT =====
class TypedText {
  constructor(element, texts, speed = 100) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.init();
  }

  init() {
    setTimeout(() => this.type(), 1000);
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];

    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
      this.currentCharIndex++;
    }

    let typeSpeed = this.isDeleting ? this.speed / 2 : this.speed;

    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== DETAIL VIEW (FULL PAGE) - shared between projects and clickable timeline items =====
class DetailView {
  constructor() {
    this.view = document.getElementById('projectView');
    this.viewContent = document.getElementById('projectViewContent');
    this.itemData = this.getItemData();
    this.savedScrollY = 0;
    this.init();
  }

  init() {
    if (!this.view) return;

    // Project cards: always clickable.
    // Timeline items: only those with data-clickable="true".
    const cards = document.querySelectorAll(
      '.project-card[data-item-id], .timeline-item[data-clickable="true"][data-item-id]'
    );

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.itemId;
        this.open(id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.view.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(itemId) {
    const item = this.itemData[itemId];
    if (!item) return;

    this.savedScrollY = window.scrollY;
    this.viewContent.innerHTML = this.generateViewContent(item);
    this.view.classList.add('active');
    this.view.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    const backBtn = this.view.querySelector('.project-view-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.close());
    }
  }

  close() {
    this.view.classList.remove('active');
    document.body.style.overflow = '';
    window.scrollTo(0, this.savedScrollY);
  }

  // Map a French type label to a CSS modifier for the sidebar pill
  typeToClass(type) {
    const t = type.toLowerCase();
    if (t.includes('personnel')) return 'personal';
    if (t.includes('académique') || t.includes('academique')) return 'academic';
    if (t.includes('formation') || t.includes('études') || t.includes('etudes') || t.includes('diplôme') || t.includes('diplome')) return 'academic';
    if (t.includes('stage')) return 'stage';
    if (t.includes('emploi')) return 'emploi';
    if (t.includes('recherche')) return 'recherche';
    return 'personal';
  }

  generateViewContent(item) {
    const typeClass = this.typeToClass(item.type);

    let sidebarBlocks = '';

    // Logo block: rendu uniquement si item.logo est défini (string ou objet {src, alt})
    if (item.logo) {
      const src = typeof item.logo === 'string' ? item.logo : item.logo.src;
      const alt = (typeof item.logo === 'object' && item.logo.alt) ? item.logo.alt : item.title;
      sidebarBlocks += `
        <div class="sidebar-block sidebar-block-logo">
          <div class="project-view-logo">
            <img src="${src}" alt="${alt}">
          </div>
        </div>
      `;
    }

    sidebarBlocks += `
      <div class="sidebar-block">
        <strong>Informations</strong>
        <div class="sidebar-info-row">
          <span class="sidebar-label">Date</span>
          <span class="sidebar-value">${item.date}</span>
        </div>
        <div class="sidebar-info-row">
          <span class="sidebar-label">Type</span>
          <span class="project-view-type ${typeClass}">${item.type}</span>
        </div>
      </div>
    `;

    if (item.tech && item.tech.length > 0) {
      sidebarBlocks += `
        <div class="sidebar-block">
          <strong>Technologies</strong>
          <div class="project-view-tech-logos">
            ${item.tech.map(t => `<img src="${t}" alt="Tech logo">`).join('')}
          </div>
        </div>
      `;
    }

    if (item.github || item.links) {
      let linksHtml = '';
      if (item.github) {
        linksHtml += `<a href="${item.github}" target="_blank" rel="noopener noreferrer">
          <img class="logo" src="img/logo/logo github.svg" alt="GitHub" style="display:inline;width:20px;height:20px;vertical-align:middle;margin-right:6px;">GitHub
        </a>`;
      }
      if (item.links) {
        item.links.forEach(link => {
          linksHtml += `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
        });
      }
      sidebarBlocks += `
        <div class="sidebar-block">
          <strong>Liens</strong>
          <div class="project-view-links">${linksHtml}</div>
        </div>
      `;
    }

    return `
      <button class="project-view-back" aria-label="Retour">&larr; Retour</button>

      <div class="project-view-hero">
        <h1>${item.title}</h1>
      </div>

      <div class="project-view-layout">
        <div class="project-view-main">
          ${item.content}
        </div>
        <aside class="project-view-sidebar">
          ${sidebarBlocks}
        </aside>
      </div>
    `;
  }

  getItemData() {
    return {
      // ===== Projets =====
      'ndi': {
        title: 'Nuit de l\'Info - 2 éditions',
        date: '2024 & 2025',
        type: 'Projet personnel',
        logo: 'img/logo-ppe/ndi.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>J'ai participé à deux reprises à la <strong>Nuit de l'Info</strong>, un événement national où des équipes d'étudiants doivent concevoir un site web complet en une seule nuit, sur un thème imposé, tout en relevant de nombreux défis.</p>

          <h4>Édition 2024 - Première participation</h4>
          <p>Ma première participation m'a permis de découvrir cet événement intense. J'ai appris à travailler <strong>sous contrainte de temps</strong>, à <strong>collaborer efficacement en équipe</strong> et à <strong>développer rapidement</strong> des solutions fonctionnelles. Cette expérience a renforcé mes compétences en développement web, en gestion de projet et en résolution de problèmes, tout en apprenant à gérer la fatigue.</p>

          <h4>Édition 2025 - Deuxième participation</h4>
          <p>Pour cette deuxième participation, j'ai constaté une <strong>nette progression</strong> tant sur le plan technique (avec une plus grande rapidité dans les phases de conception, de développement et de déploiement) que sur le plan humain.</p>

          <p>La gestion de notre équipe s'est déroulée de manière exemplaire : <strong>coordination efficace</strong>, <strong>répartition claire des tâches</strong> et <strong>communication fluide</strong>. Résultat : un projet <strong>finalisé en avance</strong>, sans le stress de la dernière minute.</p>

          <p>Durant cette édition, nous avons développé le <strong>site principal</strong>, une <strong>extension navigateur</strong> pour bloquer les éléments indésirables, et un <strong>site d'information</strong> sur les <a href="https://fr.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures" target="_blank" rel="noopener noreferrer">CVE</a>.</p>
        `,
        links: [
          { text: 'Site NDI 2025', url: 'https://ndi.0v41n.fr/' },
          { text: 'Site CVE', url: 'https://cve.0v41n.fr/' }
        ],
        github: 'https://github.com/Les-3-singes',
        tech: ['img/logo/logo html.png', 'img/logo/logo css.svg', 'img/logo/logo js.png']
      },
      'encheres': {
        title: 'J\'avenchère : Plateforme d\'enchères sécurisées',
        date: 'Semestre 4 (2025/2026)',
        type: 'Projet académique',
        logo: 'img/logo-ppe/javenchere.png',
        content: `
          <p><strong>J'avenchère</strong> est une application client-serveur Java d'<strong>enchères électroniques sécurisées à plis fermés</strong>, développée en équipe sur le semestre 4 du BUT Informatique (SAE de fin de 2ème année).</p>

          <p>Le projet repose sur le principe de <strong>Vickrey</strong> : les enchérisseurs soumettent leurs offres de manière confidentielle, sans connaissance des montants des autres, et le gagnant paie le montant de la <em>deuxième</em> offre la plus haute. Ce mécanisme incite chaque participant à proposer exactement ce qu'il est prêt à payer, plutôt qu'à adapter sa stratégie aux autres.</p>

          <h4>Cas d'utilisation</h4>
          <p>Quatre acteurs principaux : <strong>acheteur</strong>, <strong>vendeur</strong>, <strong>administrateur</strong> et <strong>serveur</strong>. Les acheteurs consultent les annonces et déposent leurs offres chiffrées, les vendeurs créent et gèrent leurs ventes, et l'administrateur supervise la plateforme et le mécanisme cryptographique.</p>

          <img src="img/img-projets/javenchere/image1.png" alt="Diagramme des cas d'utilisation" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <h4>Sécurité cryptographique</h4>
          <p>Le cœur du projet est cryptographique. Les montants des enchères sont chiffrés avec <strong>Damgård-Jurik</strong> (chiffrement asymétrique <em>linéairement homomorphe</em>, clés 2048 bits), permettant au serveur de manipuler les enchères chiffrées sans jamais avoir accès aux montants en clair.</p>

          <p>La clé privée de dépouillement est protégée par le <strong>Secret de Shamir</strong> : elle est découpée en plusieurs parts distribuées à des gardiens, et sa reconstruction exige la coopération d'un nombre minimal d'entre eux. Conséquence : <strong>aucun administrateur seul ne peut déchiffrer les enchères</strong>.</p>

          <p>Chaque enchère est <strong>signée RSA 4096 bits</strong> par l'acheteur pour garantir authenticité et non-répudiation. La messagerie privée entre acheteurs et vendeurs est chiffrée en <strong>AES-256-GCM</strong> (clé symétrique unique par conversation, IV aléatoire par message). Les communications réseau transitent sur un canal <strong>TLS</strong>.</p>

          <h4>Architecture client-serveur multi-threadée</h4>
          <p>Application Java 21. Le serveur écoute sur un port configurable et crée un thread dédié par client connecté pour gérer plusieurs utilisateurs simultanés sans blocage. Communications sérialisées en JSON sur TCP/TLS, plus de 25 actions distinctes exposées (authentification, ventes, enchères, messagerie, gestion cryptographique). L'ensemble est <strong>dockerisé</strong> pour faciliter le déploiement.</p>

          <img src="img/img-projets/javenchere/image13.png" alt="Diagramme d'architecture client-serveur" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <h4>Interface graphique JavaFX</h4>
          <p>L'interface a été développée en JavaFX avec un thème clair/sombre, l'intégration d'une carte pour localiser les annonces, des photos de produits et de profil, une messagerie sécurisée intégrée, et des notifications email à la clôture des ventes.</p>

          <img src="img/img-projets/javenchere/image10.png" alt="Interface de connexion" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <img src="img/img-projets/javenchere/image21.png" alt="Interface avec carte des annonces" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <h4>Démarche projet</h4>
          <p>Projet conduit en méthodologie <strong>Agile / SCRUM</strong> sur des sprints de 3 à 4 semaines, avec restitution au client à la fin de chaque itération. Code versionné sur GitLab avec branches par fonctionnalité, tests unitaires et d'intégration, application de design patterns (Factory, MVC) pour la maintenabilité.</p>

          <h4>Ce que j'en retiens</h4>
          <p>Une <strong>plongée concrète dans la cryptographie appliquée</strong> (chiffrement homomorphe, partage de secret, signatures), le <strong>travail en équipe en agile</strong>, et la conception d'une application Java structurée et testable. J'ai notamment <strong>éprouvé la robustesse</strong> du logiciel contre des attaques classiques : <strong>Man-in-the-Middle</strong>, <strong>injections SQL</strong>, tentatives de falsification d'enchères.</p>

          <p style="font-size: 0.9em; color: var(--text-light); margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            Projet réalisé en équipe avec Jordi Rocafort et Rayane Smaili. Encadré par M. Laguillaumie et Mme. Mazars Chapelon.
          </p>
        `,
        tech: ['img/logo/logo java.svg']
      },
      'villes3d': {
        title: 'Geospatial Vector Extrusion',
        date: 'Janvier 2026',
        type: 'Projet personnel',
        // logo: 'img/logo/geospatial.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Ce projet représente l'un de mes travaux les plus ambitieux. Passionné à la fois par l'informatique et la cartographie, j'ai voulu allier ces deux domaines en créant un outil capable de <strong>générer des visualisations 3D de données cartographiques</strong>.</p>

          <img src="img/img-projets/en_mode_cartographe.jpg" alt="En mode cartographe" style="width: 80%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">


          <p>L'idée est simple : entrer le nom d'une ville, un rayon, et le programme construit automatiquement une maquette 3D complète avec les bâtiments, les rues et le relief du terrain. Le tout est explorable librement.</p>

          <p>Ce programme a été développé en <strong>Python</strong> et m'a permis de me familiariser avec ce langage de programmation très célèbre mais que j'avais pourtant très rarement utilisé.</p>

          <h4>Les défis techniques</h4>
          <p>Le plus gros challenge a été l'<strong>optimisation des ressources</strong>. Même avec un ordinateur puissant, générer Paris et ses <strong>123 937 bâtiments</strong> demande énormément de calculs. J'ai donc implémenté un système de <a href="https://fr.wikipedia.org/wiki/Symmetric_multiprocessing" target="_blank">multiprocessing</a> qui exploite <strong>tous les cœurs du processeur</strong>, ainsi qu'une fusion rapide des <a href="https://support.esri.com/fr-fr/gis-dictionary/mesh" target="_blank">meshes</a> pour éviter les goulots d'étranglement.</p>
          <p>Il m'a également fallu mettre en place <a href="https://fr.wikipedia.org/wiki/Projection_conique_conforme_de_Lambert" target="_blank">la projection de Lambert</a>, une projection cartographique qui représente fidèlement les méridiens sur la France métropolitaine.</p>

          <h4>Projection de Lambert</h4>
          <img src="img/lambert.png" alt="Projection de Lambert" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">


          <h4>Ce que j'ai appris</h4>
          <p>Ce projet m'a permis de découvrir le <strong>traitement de données géospatiales</strong> (OpenStreetMap, données d'élévation SRTM), la <strong>visualisation 3D avec PyVista</strong>, et surtout l'<strong>optimisation de code Python</strong> pour des calculs intensifs.</p>

          <p>J'ai réalisé des rendus de plusieurs villes françaises :</p>

          <h4>Millau</h4>
          <img src="img/img-projets/Millau.png" alt="Rendu 3D de Millau" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <h4>Paris</h4>
          <p>La capitale dans son intégralité avec ses 123 937 bâtiments. Ce rendu m'a forcé à optimiser le code en raison de la puissance de calcul nécessaire.</p>
          <img src="img/img-projets/Paris.png" alt="Rendu 3D de Paris" style="width: 100%; border-radius: 8px; margin: 0.5rem 0 1.5rem;">

          <h4>Montpellier</h4>
          <p>Avec les bâtiments et les routes.</p>
          <img src="img/img-projets/Montpellier.png" alt="Rendu 3D de Montpellier" style="width: 100%; border-radius: 8px; margin: 0.5rem 0;">
        `,
        github: 'https://github.com/flothival/geospatial-vector-extrusion',
        tech: ['img/logo/logo python.png']
      },
      'meuh': {
        title: 'MEUH encoding',
        date: 'Mars 2025',
        type: 'Projet personnel',
        // logo: 'img/logo/meuh.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p><strong>MEUH encoding</strong> est un petit projet Java qui encode et décode du texte en utilisant un système binaire personnalisé inspiré du cri de la vache : « MEUH ». 🐄</p>

          <h4>Principe</h4>
          <p>Chaque caractère du texte d'entrée est converti en binaire sur 8 bits. Chaque bit est ensuite représenté par l'une des lettres <code>M</code>, <code>E</code>, <code>U</code>, <code>H</code> :</p>
          <ul>
            <li><strong>Majuscule</strong> = bit à <code>1</code></li>
            <li><strong>Minuscule</strong> = bit à <code>0</code></li>
          </ul>
          <p>Chaque octet devient ainsi une paire de séquences MEUH (4 bits + 4 bits, séparées par un espace pour la lisibilité).</p>

          <h4>Exemple</h4>
          <pre style="background: var(--glass-bg); padding: 1rem; border-radius: 8px; font-family: monospace; overflow-x: auto;">
'a'  →  ASCII 97  →  binaire 01100001

Mapping sur  M E U H   M E U H :
              0 1 1 0   0 0 0 1
              m E U h   m e u H

Résultat : mEUh meuH
          </pre>

          <h4>Décodage</h4>
          <p>Le processus inverse : chaque majuscule devient <code>1</code>, chaque minuscule devient <code>0</code>, et chaque groupe de 8 bits est reconverti en caractère ASCII.</p>

          <h4>Pourquoi MEUH ?</h4>
          <p>Pourquoi pas ? L'idée est née d'une envie de créer un encodage à la fois fonctionnel et un peu absurde. Il illustre comment des principes simples de cryptographie peuvent être appliqués pour générer des codes lisibles et réversibles, tout en gardant un esprit ludique. L'interface en ligne de commande facilite l'encodage et le décodage interactif.</p>

          <img src="img/img-projets/meuh/vache.gif" alt="Vache polonaise" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 1.5rem auto; display: block;">
        `,
        github: 'https://github.com/flothival/meuh-encoding',
        tech: ['img/logo/logo java.svg']
      },
      'pokemon': {
        title: 'Jeu de cartes Pokémon TCG',
        date: 'Avril 2025',
        type: 'Projet académique',
        // logo: 'img/logo/pokemon.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Lors de ma <strong>première année de BUT Informatique</strong>, j'ai réalisé une <strong>reproduction complète du jeu de cartes « Pokémon TCG »</strong>. Le projet comprenait le développement de l'intégralité du fonctionnement interne : la <strong>gestion des règles</strong>, la <strong>logique des combats</strong>, et le <strong>suivi des cartes</strong>.</p>

          <p>J'ai également conçu l'<strong>interface utilisateur (IHM) en Java</strong>, offrant une expérience interactive et visuelle fidèle au jeu original. Ce projet m'a permis de mettre en pratique la <strong>programmation orientée objet</strong>, la gestion des événements et l'interaction avec l'utilisateur via une interface graphique.</p>
        `,
        tech: ['img/logo/logo java.svg']
      },
      'cesar': {
        title: 'Chiffrement de Jules César',
        date: 'Octobre 2024',
        type: 'Projet personnel',
        // logo: 'img/logo/cesar.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Le <strong>chiffrement de Jules César</strong> est l'un des plus anciens systèmes de cryptographie connus, utilisé par Jules César lui-même pour transmettre des ordres militaires sous une forme inintelligible à ses ennemis. Cette implémentation Java reproduit ce chiffrement par substitution avec décalage modulaire.</p>

          <img src="img/img-projets/cesar/jules-cesar.jpg" alt="Jules César" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 0.5rem auto 1.5rem; display: block;">

          <h4>Principe</h4>
          <p>Chaque lettre du message clair est remplacée par celle située un certain nombre de positions plus loin dans l'alphabet, selon une <strong>clé numérique</strong> définie par l'utilisateur. Le décalage utilise un calcul modulaire (<code>mod 26</code>) pour rester dans l'alphabet, et préserve la casse (majuscules et minuscules sont traitées indépendamment). Les caractères non alphabétiques (espaces, ponctuation, chiffres) restent inchangés.</p>

          <img src="img/img-projets/cesar/caesar.png" alt="Schéma du décalage des lettres" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 0.5rem auto 1.5rem; display: block;">

          <h4>Exemple</h4>
          <p>Avec la clé <code>3</code>, "Bonjour" devient :</p>
          <pre style="background: var(--glass-bg); padding: 1rem; border-radius: 8px; font-family: monospace; overflow-x: auto;">
B → E    o → r    n → q    j → m    o → r    u → x    r → u

Bonjour  →  Erqmrxu
          </pre>

          <h4>Détails techniques</h4>
          <ul>
            <li>Java standard, aucune dépendance externe</li>
            <li>Saisie utilisateur via <code>Scanner</code></li>
            <li>Logique fondée sur les codes ASCII (A–Z : 65–90, a–z : 97–122)</li>
            <li>Mode interactif en ligne de commande : chiffrer ou déchiffrer au choix</li>
          </ul>

          <h4>Limites et apprentissages</h4>
          <p>Le chiffrement de César est <strong>trivial à casser de nos jours</strong> (seulement 25 clés possibles, cassables par force brute en quelques millisecondes), mais il constitue une <strong>porte d'entrée idéale vers la cryptographie moderne</strong>. Ce projet m'a permis de consolider mes bases en manipulation de chaînes, en arithmétique modulaire, et de découvrir concrètement les concepts de substitution et de clé.</p>
        `,
        github: 'https://github.com/flothival/chiffrement-jules-cesar',
        tech: ['img/logo/logo java.svg']
      },

      // ===== Items du parcours / expériences (cliquables) =====
      'but': {
        title: 'Bachelor Universitaire de Technologie (BUT) Informatique',
        date: '2024 – Aujourd\'hui',
        type: 'Formation',
        logo: 'img/logo-ppe/iut2.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Formation actuelle à l'<strong>IUT de Montpellier</strong>, parcours <strong>D.A.C.S</strong>
          (Déploiement d'Applications Communicantes et Sécurisées), au sein du Bachelor Universitaire de
          Technologie (BUT) Informatique.</p>

          <h4>Spécialisation</h4>
          <p>Le parcours D.A.C.S met l'accent sur les <strong>réseaux</strong>, la <strong>cybersécurité</strong>
          et le <strong>développement d'applications communicantes</strong>. Il s'inscrit dans une logique de
          montée en compétence progressive sur le bas niveau, l'infrastructure et la sécurisation des systèmes.</p>

          <h4>Domaines abordés</h4>
          <ul>
            <li>Programmation orientée objet (Java, Python, C)</li>
            <li>Bases de données relationnelles (MySQL, Oracle, PL/SQL)</li>
            <li>Développement web (HTML, CSS, JavaScript, PHP)</li>
            <li>Réseaux et administration système (Linux, Bash, Docker)</li>
            <li>Cybersécurité, cryptographie et sécurisation des communications</li>
            <li>Conduite de projet et travail en équipe</li>
          </ul>

          <h4>Projets réalisés</h4>
          <p>De nombreux projets académiques jalonnent la formation, dont la
          <strong>plateforme d'enchères communicantes et sécurisées</strong> ou encore la
          <strong>reproduction du jeu Pokémon TCG</strong> en Java. La majorité d'entre eux sont
          détaillés dans la section <em>Projets</em> du portfolio.</p>
        `
      },
      'bac': {
        title: 'Baccalauréat – Lycée Jean Mermoz',
        date: '2021 – 2024',
        type: 'Diplôme',
        logo: 'img/logo-ppe/mermoz.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Baccalauréat <strong>technologique</strong> obtenu avec mention <strong>bien</strong>
          au Lycée Jean Mermoz.</p>

          <h4>Filière</h4>
          <p>Le parcours technologique a permis la découverte de l'<strong>électronique</strong>
          et des <strong>principes fondamentaux de l'ingénierie</strong>, éveillant un attrait
          durable pour les systèmes techniques et leur fonctionnement : une appétence qui
          s'est ensuite prolongée naturellement vers l'informatique en BUT.</p>

          <h4>Ce que cette période m'a apporté</h4>
          <ul>
            <li>Bases solides en sciences et en raisonnement logique</li>
            <li>Premier contact avec l'électronique et les systèmes embarqués</li>
            <li>Méthode de travail et autonomie</li>
          </ul>
        `
      },
      'metropole': {
        title: 'Stage DevOps – Métropole de Montpellier',
        date: 'Avril – Juin 2026',
        type: 'Stage',
        logo: 'img/logo-ppe/metropole.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Stage de fin de deuxième année de BUT Informatique au sein de la <strong>Métropole de Montpellier</strong>, en tant que stagiaire DevOps.</p>

          <h4>Missions</h4>
          <p>Mise en pratique des concepts DevOps dans un environnement de collectivité territoriale : automatisation de tâches, intégration et déploiement continus (CI/CD), conteneurisation avec Docker, et participation à l'amélioration de l'infrastructure interne.</p>

          <p>Ce stage m'a permis de toucher concrètement aux problématiques d'industrialisation du déploiement logiciel, et de découvrir le quotidien d'une équipe d'infrastructure dans le secteur public.</p>

          <h4>Compétences mobilisées</h4>
          <ul>
            <li>Conteneurisation (Docker, Docker Compose)</li>
            <li>CI/CD et automatisation</li>
            <li>Administration système Linux</li>
            <li>Travail en équipe et conduite de projet</li>
          </ul>
        `
      },
      'proby': {
        title: 'Stage d\'observation – PROBY',
        date: 'Avril 2020',
        type: 'Stage',
        logo: 'img/logo-ppe/proby.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Premier contact concret avec le monde de l'informatique professionnelle, dans le cadre du stage d'observation de 3ème, effectué au sein du service informatique de l'entreprise <strong>PROBY</strong>.</p>

          <p>Cette immersion d'une semaine m'a permis de découvrir les coulisses d'un service IT en entreprise : la gestion du parc informatique, le support utilisateur, et plus largement le rôle central de l'informatique dans le fonctionnement d'une organisation.</p>

          <p>Une expérience courte mais marquante, qui a confirmé mon intérêt pour ce domaine et orienté la suite de mon parcours scolaire vers l'informatique.</p>
        `
      },
      'alternance2026': {
        title: 'Recherche d\'alternance',
        date: 'Septembre 2026',
        type: 'Recherche',
        // logo: 'img/logo/alternance.png',  // décommente et mets le chemin pour afficher le logo dans la sidebar
        content: `
          <p>Je suis actuellement à la recherche d'une <strong>alternance en informatique</strong> pour ma 3ème année de BUT Informatique, parcours <strong>D.A.C.S</strong> (Déploiement d'Applications Communicantes et Sécurisées), à partir de <strong>septembre 2026</strong>.</p>

          <h4>Domaines d'intérêt</h4>
          <ul>
            <li>DevOps, infrastructure et automatisation</li>
            <li>Réseaux et administration système</li>
            <li>Cybersécurité</li>
            <li>Développement bas niveau et systèmes embarqués</li>
          </ul>

          <h4>Rythme</h4>
          <p>Rythme d'alternance compatible avec le calendrier de l'IUT de Montpellier (à préciser selon l'entreprise). Disponible pour échanger sur les missions, le rythme et les modalités.</p>

          <h4>Profil</h4>
          <p>Curieux, autonome et motivé, avec une appétence forte pour le bas niveau, les réseaux et la sécurité. Mes projets personnels (visualisation 3D de données géospatiales, chiffrement, Nuit de l'Info) reflètent cette diversité d'intérêts et ma volonté constante d'apprendre.</p>

          <p>Pour discuter d'une opportunité, rendez-vous dans la section <strong>Contact</strong> du portfolio.</p>
        `
      }
    };
  }
}

// ===== TIMELINE FLIP (Études <-> Expériences) =====
class TimelineFlip {
  constructor() {
    this.card = document.getElementById('timelineFlipCard');
    this.btn = document.getElementById('timelineFlipBtn');
    this.labels = document.querySelectorAll('.track-label');
    this.flipped = false;

    if (!this.card || !this.btn) return;

    this.front = this.card.querySelector('.timeline-flip-front');
    this.back = this.card.querySelector('.timeline-flip-back');

    this.init();
  }

  init() {
    this.btn.addEventListener('click', () => this.toggle());

    this.labels.forEach(label => {
      label.addEventListener('click', () => {
        this.setView(label.dataset.track);
      });
    });

    // Initial height + on resize, recompute (content can wrap differently).
    requestAnimationFrame(() => this.updateHeight());
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.updateHeight(), 150);
    });
  }

  toggle() {
    this.flipped = !this.flipped;
    this.applyState();
  }

  setView(track) {
    const shouldFlip = track === 'experiences';
    if (this.flipped !== shouldFlip) {
      this.flipped = shouldFlip;
      this.applyState();
    }
  }

  applyState() {
    this.card.classList.toggle('flipped', this.flipped);
    this.btn.classList.toggle('flipped', this.flipped);

    this.labels.forEach(label => {
      const isParcours = label.dataset.track === 'parcours';
      const active = (isParcours && !this.flipped) || (!isParcours && this.flipped);
      label.classList.toggle('active', active);
    });

    this.updateHeight();
  }

  updateHeight() {
    if (!this.front || !this.back) return;
    // Each face is `width: 100%` (back is absolute). Measure the active face's content.
    const activeFace = this.flipped ? this.back : this.front;
    const h = activeFace.offsetHeight;
    if (h > 0) this.card.style.height = h + 'px';
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    this.init();
  }

  init() {
    this.setupObserver();
    this.markElementsForAnimation();
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, this.observerOptions);
  }

  markElementsForAnimation() {
    const groups = ['.project-card', '.about-grid', '.contact-card'];

    groups.forEach(selector => {
      document.querySelectorAll(selector).forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        el.style.transitionDelay = `${index * 0.05}s`;
        this.observer.observe(el);
      });
    });
  }
}

// ===== INFINITE SKILLS CAROUSEL =====
class InfiniteCarousel {
  constructor(trackSelector) {
    this.track = document.querySelector(trackSelector);
    if (!this.track) return;

    // Sur téléphone (≤ 768px) on n'active pas le carrousel : la CSS affiche
    // une grille statique. Pas de duplication d'items, pas d'animation.
    if (window.matchMedia('(max-width: 768px)').matches) {
      return;
    }

    this.speed = 1; // vitesse défilement pc
    this.position = 0;
    this.isPaused = false;

    this.init();
  }

  init() {
    // Dupliquer les éléments pour créer l'effet infini
    const items = this.track.innerHTML;
    this.track.innerHTML = items + items;

    // Calculer la largeur d'un set complet
    this.track.style.animation = 'none';
    const children = this.track.children;
    const halfCount = children.length / 2;

    let totalWidth = 0;
    for (let i = 0; i < halfCount; i++) {
      totalWidth += children[i].offsetWidth;
      const style = window.getComputedStyle(children[i]);
      totalWidth += parseFloat(style.marginRight) || 0;
    }

    // Ajouter le gap
    const trackStyle = window.getComputedStyle(this.track);
    const gap = parseFloat(trackStyle.gap) || 0;
    this.resetPoint = totalWidth + (gap * halfCount);

    // Démarrer l'animation
    this.animate();

    // Ajuster la vitesse sur mobile
    if (window.innerWidth <= 768) {
      this.speed = 1.5; //vitesse défilement mobile
    }
  }

  animate() {
    if (!this.isPaused) {
      this.position -= this.speed;

      if (Math.abs(this.position) >= this.resetPoint) {
        this.position = 0;
      }

      this.track.style.transform = `translateX(${this.position}px)`;
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ===== SCROLL TO TOP BUTTON =====
class ScrollToTop {
  constructor() {
    this.btn = document.getElementById('scrollToTop');
    if (!this.btn) return;

    this.threshold = 300;
    this.projectView = document.getElementById('projectView');

    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    if (this.projectView) {
      this.projectView.addEventListener('scroll', () => this.update(), { passive: true });
    }
    this.btn.addEventListener('click', () => this.scrollToTop());
    this.update();
  }

  isViewActive() {
    return this.projectView && this.projectView.classList.contains('active');
  }

  currentScroll() {
    return this.isViewActive() ? this.projectView.scrollTop : window.scrollY;
  }

  scrollToTop() {
    if (this.isViewActive()) {
      this.projectView.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  update() {
    this.btn.classList.toggle('visible', this.currentScroll() > this.threshold);
  }
}

// ===== UTILITY FUNCTIONS =====
function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  }

  setupAutoTheme();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    new PixelArtBackground('particle-canvas');
    new ScrollAnimationManager();
    new InfiniteCarousel('.skills-track');
  }

  new ScrollSpyNavigation();
  new MobileMenu();
  new DetailView();
  new TimelineFlip();
  new ScrollToTop();

  const typedTextElement = document.getElementById('typed-text');
  if (typedTextElement) {
    new TypedText(typedTextElement, [
      'Étudiant en deuxième année de BUT Informatique',
      'Spécialisé en Réseaux & Cybersécurité',
    ], 50);
  }
});

// ===== CONTACT MODALS =====
function openContactModal(type) {
  const modalId = type + 'Modal';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeContactModal(type) {
  const modalId = type + 'Modal';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Copié !';
    button.style.background = 'var(--color-primary)';
    button.style.color = 'var(--text-inverse)';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }).catch(err => {
    console.error('Erreur lors de la copie:', err);
  });
}

// Fermer les modales contact avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['email', 'location', 'linkedin'].forEach(type => {
      closeContactModal(type);
    });
  }
});
