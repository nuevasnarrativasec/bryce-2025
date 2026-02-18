// Variables
let currentSection = 0;
const sections = document.querySelectorAll('.section');
const totalSections = sections.length;
let isAnimating = false;
let touchStartY = 0;

// Detectar si es mÃƒÆ’Ã‚Â³vil
const isMobile = () => window.innerWidth <= 768;

// Indicador de scroll mÃƒÆ’Ã‚Â³vil
const mobileScrollHint = document.getElementById('mobileScrollHint');

// Menu toggle
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const menuItems = document.querySelectorAll('.menu-item');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sideMenu.classList.toggle('active');
});

// Menu navigation
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const character = item.dataset.character;
        const targetSection = document.getElementById(`section-${character}`);
        const sectionIndex = parseInt(targetSection.dataset.section);
        
        hamburger.classList.remove('active');
        sideMenu.classList.remove('active');
        
        if (isMobile()) {
            navigateToSectionMobile(sectionIndex);
        } else {
            navigateToSection(sectionIndex);
        }
    });
});

// Miniature clicks (solo desktop)
const miniatures = document.querySelectorAll('.character-miniature');
miniatures.forEach(mini => {
    mini.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // En mÃƒÆ’Ã‚Â³vil no hacer nada, navegaciÃƒÆ’Ã‚Â³n solo por scroll
        if (isMobile()) return;
        
        const nextCharacter = mini.dataset.next;
        const targetSection = document.getElementById(`section-${nextCharacter}`);
        const sectionIndex = parseInt(targetSection.dataset.section);
        navigateToSection(sectionIndex, mini);
    });
});

// Wheel event (solo desktop)
window.addEventListener('wheel', (e) => {
    if (isMobile()) return;
    if (isAnimating) return;
    
    if (e.deltaY > 0 && currentSection < totalSections - 1) {
        const currentSectionEl = sections[currentSection];
        const targetIndex = currentSection + 1;
        const targetSectionId = sections[targetIndex].id.replace('section-', '');
        const miniature = currentSectionEl.querySelector(`[data-next="${targetSectionId}"]`);
        navigateToSection(targetIndex, miniature);
    } else if (e.deltaY < 0 && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
}, { passive: true });

// Touch events para desktop
window.addEventListener('touchstart', (e) => {
    if (isMobile()) return;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if (isMobile()) return;
    if (isAnimating) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSection < totalSections - 1) {
            const currentSectionEl = sections[currentSection];
            const targetIndex = currentSection + 1;
            const targetSectionId = sections[targetIndex].id.replace('section-', '');
            const miniature = currentSectionEl.querySelector(`[data-next="${targetSectionId}"]`);
            navigateToSection(targetIndex, miniature);
        } else if (diff < 0 && currentSection > 0) {
            navigateToSection(currentSection - 1);
        }
    }
}, { passive: true });

// Keyboard navigation
window.addEventListener('keydown', (e) => {
    if (isMobile()) return;
    if (isAnimating) return;
    
    if ((e.key === 'ArrowDown' || e.key === 'PageDown') && currentSection < totalSections - 1) {
        const currentSectionEl = sections[currentSection];
        const targetIndex = currentSection + 1;
        const targetSectionId = sections[targetIndex].id.replace('section-', '');
        const miniature = currentSectionEl.querySelector(`[data-next="${targetSectionId}"]`);
        navigateToSection(targetIndex, miniature);
    } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && currentSection > 0) {
        navigateToSection(currentSection - 1);
    }
});

// ========================================
// MÃƒÆ’Ã¢â‚¬Å“VIL - Setup estructura
// ========================================

function setupMobileStructure() {
    sections.forEach(section => {
        if (section.id === 'section-inicio') return;
        
        const characterRight = section.querySelector('.character-right');
        const circleInfo = section.querySelector('.character-info-box .circle-info');
        
        if (characterRight && circleInfo && !characterRight.querySelector('.circle-info')) {
            // Clonar cÃƒÆ’Ã‚Â­rculo y moverlo al contenedor derecho
            const circleClone = circleInfo.cloneNode(true);
            circleClone.classList.add('mobile-circle');
            
            // Insertar al inicio de character-right
            characterRight.insertBefore(circleClone, characterRight.firstChild);
        }
    });
}

// ========================================
// MÃƒÆ’Ã¢â‚¬Å“VIL - NavegaciÃƒÆ’Ã‚Â³n con scroll/touch
// ========================================

let lastScrollTop = 0;
let scrollDelta = 0;
let canNavigate = true;
let touchStartYMobile = 0;
let touchMoveAccumulator = 0;

function setupMobileScrollNavigation() {
    // Touch events para navegaciÃƒÆ’Ã‚Â³n
    document.addEventListener('touchstart', handleMobileTouchStart, { passive: true });
    document.addEventListener('touchmove', handleMobileTouchMove, { passive: false });
    document.addEventListener('touchend', handleMobileTouchEnd, { passive: true });
}

function handleMobileTouchStart(e) {
    if (!isMobile()) return;
    touchStartYMobile = e.touches[0].clientY;
    touchMoveAccumulator = 0;
}

function handleMobileTouchMove(e) {
    if (!isMobile() || isAnimating || !canNavigate) return;
    
    const currentSectionEl = sections[currentSection];
    const scrollTop = currentSectionEl.scrollTop;
    const scrollHeight = currentSectionEl.scrollHeight;
    const clientHeight = currentSectionEl.clientHeight;
    
    const touchY = e.touches[0].clientY;
    const diff = touchStartYMobile - touchY;
    
    // Scrolleando hacia abajo (diff positivo) y llegamos al final
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
    // Scrolleando hacia arriba (diff negativo) y estamos al inicio
    const atTop = scrollTop <= 5;
    
    if (atBottom && diff > 0 && currentSection < totalSections - 1) {
        // Prevenir scroll nativo cuando estamos en el lÃƒÆ’Ã‚Â­mite
        e.preventDefault();
        touchMoveAccumulator += Math.abs(diff - touchMoveAccumulator) * 0.3;
    } else if (atTop && diff < 0 && currentSection > 0) {
        // Prevenir scroll nativo cuando estamos en el lÃƒÆ’Ã‚Â­mite
        e.preventDefault();
        touchMoveAccumulator += Math.abs(diff - touchMoveAccumulator) * 0.3;
    }
}

function handleMobileTouchEnd(e) {
    if (!isMobile() || isAnimating || !canNavigate) return;
    
    const currentSectionEl = sections[currentSection];
    const scrollTop = currentSectionEl.scrollTop;
    const scrollHeight = currentSectionEl.scrollHeight;
    const clientHeight = currentSectionEl.clientHeight;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYMobile - touchEndY;
    
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
    const atTop = scrollTop <= 5;
    
    // Umbral de swipe
    const threshold = 50;
    
    if (atBottom && diff > threshold && currentSection < totalSections - 1) {
        canNavigate = false;
        navigateToSectionMobile(currentSection + 1, false);
        setTimeout(() => { canNavigate = true; }, 1000);
    } else if (atTop && diff < -threshold && currentSection > 0) {
        canNavigate = false;
        navigateToSectionMobile(currentSection - 1, true);
        setTimeout(() => { canNavigate = true; }, 1000);
    }
    
    touchMoveAccumulator = 0;
}

// ========================================
// MÃƒÆ’Ã¢â‚¬Å“VIL - Animaciones de scroll
// ========================================

let mobileObservers = [];

function initMobileScrollAnimations(section) {
    // Limpiar observers anteriores
    mobileObservers.forEach(obs => obs.disconnect());
    mobileObservers = [];
    
    // Limpiar scroll handler anterior si existe
    if (section._scrollHandler) {
        section.removeEventListener('scroll', section._scrollHandler);
        section._scrollHandler = null;
    }
    
    const circleInfo = section.querySelector('.character-right .circle-info');
    const textBox = section.querySelector('.character-text-box');
    
    // Mostrar indicador de scroll solo si NO es la secciÃƒÆ’Ã‚Â³n de inicio ni crÃƒÆ’Ã‚Â©ditos
    const isInicio = section.id === 'section-inicio';
    const isCreditos = section.id === 'section-creditos';
    if (mobileScrollHint && !isInicio && !isCreditos) {
        mobileScrollHint.classList.remove('hidden');
        mobileScrollHint.classList.add('visible');
    } else if (mobileScrollHint) {
        mobileScrollHint.classList.remove('visible');
        mobileScrollHint.classList.add('hidden');
    }
    
    // No inicializar observer inmediatamente, esperar a que el usuario haga scroll
    let observerInitialized = false;
    let hintHidden = false;
    
    const scrollHandler = () => {
        // Ocultar indicador de scroll cuando el usuario hace scroll
        if (!hintHidden && section.scrollTop > 20 && mobileScrollHint) {
            hintHidden = true;
            mobileScrollHint.classList.remove('visible');
            mobileScrollHint.classList.add('hidden');
        }
        
        if (!observerInitialized && section.scrollTop > 30) {
            observerInitialized = true;
            setupObserver();
        }
    };
    
    const setupObserver = () => {
        const observerOptions = {
            root: section,
            rootMargin: '-25% 0px -15% 0px',
            threshold: [0.1, 0.3, 0.5]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    entry.target.classList.add('mobile-visible');
                }
            });
        }, observerOptions);
        
        if (circleInfo) observer.observe(circleInfo);
        if (textBox) observer.observe(textBox);
        
        mobileObservers.push(observer);
    };
    
    // Escuchar scroll de la secciÃƒÆ’Ã‚Â³n
    section.addEventListener('scroll', scrollHandler, { passive: true });
    section._scrollHandler = scrollHandler;
}

function resetMobileAnimations(section) {
    const circleInfo = section.querySelector('.character-right .circle-info');
    const textBox = section.querySelector('.character-text-box');
    
    if (circleInfo) circleInfo.classList.remove('mobile-visible');
    if (textBox) textBox.classList.remove('mobile-visible');
}

// ========================================
// MÃƒÆ’Ã¢â‚¬Å“VIL - NavegaciÃƒÆ’Ã‚Â³n entre secciones
// ========================================

function navigateToSectionMobile(targetIndex, isGoingBack = false) {
    if (isAnimating || targetIndex === currentSection) return;
    if (targetIndex < 0 || targetIndex >= totalSections) return;
    
    isAnimating = true;
    const currentSectionEl = sections[currentSection];
    const targetSectionEl = sections[targetIndex];
    const currentContent = currentSectionEl.querySelector('.section-content');
    
    const goingForward = targetIndex > currentSection;
    
    // AnimaciÃƒÆ’Ã‚Â³n de salida
    currentContent.style.transformOrigin = 'center center';
    if (goingForward) {
        currentContent.style.transform = 'scale(2)';
    } else {
        currentContent.style.transform = 'scale(0.5)';
    }
    currentContent.style.opacity = '0';
    currentContent.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        // Reset secciÃƒÆ’Ã‚Â³n actual
        currentContent.style.transform = '';
        currentContent.style.transformOrigin = '';
        currentContent.style.opacity = '';
        currentContent.style.transition = '';
        
        currentSectionEl.classList.remove('mobile-active');
        currentSectionEl.scrollTop = 0;
        
        // Reset animaciones
        resetMobileAnimations(targetSectionEl);
        
        // Mostrar nueva secciÃƒÆ’Ã‚Â³n
        targetSectionEl.classList.add('mobile-active');
        targetSectionEl.scrollTop = 0;
        
        // AnimaciÃƒÆ’Ã‚Â³n de entrada
        const targetContent = targetSectionEl.querySelector('.section-content');
        targetContent.style.transform = goingForward ? 'scale(0.5)' : 'scale(2)';
        targetContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            targetContent.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            targetContent.style.transform = 'scale(1)';
            targetContent.style.opacity = '1';
            
            setTimeout(() => {
                targetContent.style.transition = '';
                currentSection = targetIndex;
                
                // Reset touch variables
                touchMoveAccumulator = 0;
                
                handleVideoPlayback(targetSectionEl, currentSectionEl);
                
                initMobileScrollAnimations(targetSectionEl);
                
                isAnimating = false;
            }, 500);
        });
    }, 500);
}

// ========================================
// DESKTOP - NavegaciÃƒÆ’Ã‚Â³n
// ========================================

function navigateToSection(targetIndex, miniatureElement = null) {
    if (isAnimating || targetIndex === currentSection) return;
    
    isAnimating = true;
    const currentSectionEl = sections[currentSection];
    const targetSectionEl = sections[targetIndex];
    const currentContent = currentSectionEl.querySelector('.section-content');
    const targetContent = targetSectionEl.querySelector('.section-content');
    
    const isGoingForward = targetIndex > currentSection;
    
    resetAnimations(currentSectionEl);
    
    if (isGoingForward) {
        if (miniatureElement) {
            const rect = miniatureElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            
            const translateX = viewportCenterX - centerX;
            const translateY = viewportCenterY - centerY;
            
            currentContent.style.transformOrigin = `${centerX}px ${centerY}px`;
            currentContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(3)`;
            currentContent.style.opacity = '0';
            currentContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            currentContent.classList.add('zooming-in');
        }
    } else {
        currentContent.style.transformOrigin = 'center center';
        currentContent.style.transform = 'scale(0.3)';
        currentContent.style.opacity = '0';
        currentContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    setTimeout(() => {
        currentContent.style.transform = '';
        currentContent.style.transformOrigin = '';
        currentContent.style.opacity = '';
        currentContent.style.transition = '';
        
        currentSectionEl.style.display = 'none';
        currentContent.classList.remove('zooming-out', 'zooming-in');
        
        resetAnimations(targetSectionEl);
        
        targetSectionEl.style.display = 'flex';
        
        if (isGoingForward) {
            targetContent.style.transform = 'scale(0.3)';
            targetContent.style.opacity = '0';
        } else {
            const currentSectionId = currentSectionEl.id.replace('section-', '');
            const miniInTarget = targetSectionEl.querySelector(`[data-next="${currentSectionId}"]`);
            
            if (miniInTarget) {
                const rect = miniInTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                targetContent.style.transformOrigin = `${centerX}px ${centerY}px`;
            } else {
                targetContent.style.transformOrigin = 'center center';
            }
            
            targetContent.style.transform = 'scale(3)';
            targetContent.style.opacity = '0';
        }
        
        setTimeout(() => {
            targetContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            targetContent.style.transform = 'scale(1)';
            targetContent.style.opacity = '1';
            
            setTimeout(() => {
                targetContent.style.transition = '';
                targetContent.style.transformOrigin = '';
                
                animateInfoBoxes(targetSectionEl);
                
                handleVideoPlayback(targetSectionEl, currentSectionEl);
                
                currentSection = targetIndex;
                
                updateScrollIndicator();
                
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }, 600);
        }, 50);
    }, 600);
}

function resetAnimations(section) {
    const infoBoxes = section.querySelectorAll('.character-info-box');
    const textBoxes = section.querySelectorAll('.character-text-box');
    
    infoBoxes.forEach(box => box.classList.remove('animate-up'));
    textBoxes.forEach(box => box.classList.remove('animate-down'));
}

function animateInfoBoxes(section) {
    const infoBoxes = section.querySelectorAll('.character-info-box');
    const textBoxes = section.querySelectorAll('.character-text-box');
    
    setTimeout(() => {
        infoBoxes.forEach(box => box.classList.add('animate-up'));
    }, 300);
    
    setTimeout(() => {
        textBoxes.forEach(box => box.classList.add('animate-down'));
    }, 500);
}

function updateScrollIndicator() {
    const indicator = document.getElementById('scrollIndicator');
    if (currentSection === totalSections - 1) {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
    }
}

// ========================================
// VIDEO - Reproducción automática
// ========================================

function handleVideoPlayback(enteringSection, leavingSection) {
    // Pausar y reiniciar video de la sección que se abandona
    if (leavingSection) {
        const leavingVideo = leavingSection.querySelector('video');
        if (leavingVideo) {
            leavingVideo.pause();
            leavingVideo.currentTime = 0;
        }
    }
    // Reproducir video de la sección que se activa
    if (enteringSection) {
        const enteringVideo = enteringSection.querySelector('video');
        if (enteringVideo) {
            enteringVideo.currentTime = 0;
            enteringVideo.play().catch(() => {
                // Autoplay bloqueado por el navegador: intentar de nuevo con interacción
                enteringSection.addEventListener('click', () => enteringVideo.play(), { once: true });
            });
        }
    }
}

// ========================================
// INICIALIZACIÃƒÆ’Ã¢â‚¬Å“N
// ========================================

function initMobile() {
    document.body.classList.add('mobile-mode');
    
    // Setup estructura mÃƒÆ’Ã‚Â³vil
    setupMobileStructure();
    
    sections.forEach((section, index) => {
        section.style.display = '';
        section.scrollTop = 0;
        
        if (index === currentSection) {
            section.classList.add('mobile-active');
        } else {
            section.classList.remove('mobile-active');
        }
    });
    
    // Setup navegaciÃƒÆ’Ã‚Â³n y animaciones
    setupMobileScrollNavigation();
    initMobileScrollAnimations(sections[currentSection]);
}

function initDesktop() {
    document.body.classList.remove('mobile-mode');
    
    sections.forEach((section, index) => {
        section.classList.remove('mobile-active');
        section.style.display = index !== currentSection ? 'none' : 'flex';
    });
    
    updateScrollIndicator();
}

function init() {
    if (isMobile()) {
        initMobile();
    } else {
        initDesktop();
    }
}

// Resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const wasMobile = document.body.classList.contains('mobile-mode');
        const nowMobile = isMobile();
        
        if (wasMobile !== nowMobile) {
            if (nowMobile) {
                initMobile();
            } else {
                initDesktop();
            }
        }
    }, 250);
});

init();