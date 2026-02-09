// Variables
        let currentSection = 0;
        const sections = document.querySelectorAll('.section');
        const totalSections = sections.length;
        let isAnimating = false;
        let touchStartY = 0;

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
                
                // Close menu
                hamburger.classList.remove('active');
                sideMenu.classList.remove('active');
                
                // Navigate with zoom effect
                navigateToSection(sectionIndex);
            });
        });

        // Miniature clicks
        const miniatures = document.querySelectorAll('.character-miniature');
        miniatures.forEach(mini => {
            mini.addEventListener('click', (e) => {
                e.stopPropagation();
                const nextCharacter = mini.dataset.next;
                const targetSection = document.getElementById(`section-${nextCharacter}`);
                const sectionIndex = parseInt(targetSection.dataset.section);
                navigateToSection(sectionIndex, mini);
            });
        });

        // Wheel event
        window.addEventListener('wheel', (e) => {
            if (isAnimating) return;
            
            if (e.deltaY > 0 && currentSection < totalSections - 1) {
                // Scroll down - buscar miniatura en la sección actual
                const currentSectionEl = sections[currentSection];
                const targetIndex = currentSection + 1;
                const targetSectionId = sections[targetIndex].id.replace('section-', '');
                const miniature = currentSectionEl.querySelector(`[data-next="${targetSectionId}"]`);
                navigateToSection(targetIndex, miniature);
            } else if (e.deltaY < 0 && currentSection > 0) {
                // Scroll up - no hay miniatura hacia atrás, usar animación genérica
                navigateToSection(currentSection - 1);
            }
        }, { passive: true });

        // Touch events for mobile
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (isAnimating) return;
            
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentSection < totalSections - 1) {
                    // Swipe up - buscar miniatura
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
            if (isAnimating) return;
            
            if ((e.key === 'ArrowDown' || e.key === 'PageDown') && currentSection < totalSections - 1) {
                // Navegar hacia abajo - buscar miniatura
                const currentSectionEl = sections[currentSection];
                const targetIndex = currentSection + 1;
                const targetSectionId = sections[targetIndex].id.replace('section-', '');
                const miniature = currentSectionEl.querySelector(`[data-next="${targetSectionId}"]`);
                navigateToSection(targetIndex, miniature);
            } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && currentSection > 0) {
                navigateToSection(currentSection - 1);
            }
        });

        function navigateToSection(targetIndex, miniatureElement = null) {
            if (isAnimating || targetIndex === currentSection) return;
            
            isAnimating = true;
            const currentSectionEl = sections[currentSection];
            const targetSectionEl = sections[targetIndex];
            const currentContent = currentSectionEl.querySelector('.section-content');
            const targetContent = targetSectionEl.querySelector('.section-content');
            
            // Si hay una miniatura, obtener su posición para el zoom
            if (miniatureElement) {
                const rect = miniatureElement.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const viewportCenterX = window.innerWidth / 2;
                const viewportCenterY = window.innerHeight / 2;
                
                // Calcular el desplazamiento necesario
                const translateX = viewportCenterX - centerX;
                const translateY = viewportCenterY - centerY;
                
                // Aplicar transformación al contenido actual
                currentContent.style.transformOrigin = `${centerX}px ${centerY}px`;
                currentContent.style.transform = `translate(${translateX}px, ${translateY}px) scale(3)`;
                currentContent.style.opacity = '0';
                currentContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                // Zoom genérico si no hay miniatura
                currentContent.classList.add('zooming-in');
            }
            
            setTimeout(() => {
                // Resetear transformaciones
                currentContent.style.transform = '';
                currentContent.style.transformOrigin = '';
                currentContent.style.opacity = '';
                currentContent.style.transition = '';
                
                // Ocultar sección actual
                currentSectionEl.style.display = 'none';
                currentContent.classList.remove('zooming-out', 'zooming-in');
                
                // Mostrar sección objetivo
                targetSectionEl.style.display = 'flex';
                targetContent.style.transform = 'scale(0.3)';
                targetContent.style.opacity = '0';
                
                setTimeout(() => {
                    // Zoom in a la sección objetivo
                    targetContent.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    targetContent.style.transform = 'scale(1)';
                    targetContent.style.opacity = '1';
                    
                    setTimeout(() => {
                        targetContent.style.transition = '';
                        
                        // Animar cajas de información
                        animateInfoBoxes(targetSectionEl);
                        
                        currentSection = targetIndex;
                        
                        // Actualizar indicador de scroll
                        updateScrollIndicator();
                        
                        setTimeout(() => {
                            isAnimating = false;
                        }, 500);
                    }, 600);
                }, 50);
            }, 600);
        }

        function animateInfoBoxes(section) {
            const infoBoxes = section.querySelectorAll('.character-info-box');
            const textBoxes = section.querySelectorAll('.character-text-box');
            
            setTimeout(() => {
                infoBoxes.forEach(box => {
                    box.classList.add('animate-up');
                });
            }, 300);
            
            setTimeout(() => {
                textBoxes.forEach(box => {
                    box.classList.add('animate-down');
                });
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

        // Initialize
        function init() {
            // Hide all sections except first
            sections.forEach((section, index) => {
                if (index !== 0) {
                    section.style.display = 'none';
                }
            });
            
            updateScrollIndicator();
        }

        init();