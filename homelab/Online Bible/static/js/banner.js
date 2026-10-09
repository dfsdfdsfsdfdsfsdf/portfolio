// banner.js
console.log('banner.js successfully loaded');

document.addEventListener('DOMContentLoaded', () => {
    const menuIcon   = document.getElementById('menu-icon');
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu   = document.getElementById('side-menu');
    const booksList  = document.getElementById('books-list');
    const content    = document.getElementById('content');

    // Slide-in menu open / close
    function openMenu() {
        if (!sideMenu) return;
        sideMenu.classList.add('open');
        if (menuIcon) {
            menuIcon.src = '/static/img/open-book.png';
        }
    }

    function closeMenu() {
        if (!sideMenu) return;
        sideMenu.classList.remove('open');
        if (menuIcon) {
            menuIcon.src = '/static/img/closed-book.png';
        }
    }

    if (menuToggle && sideMenu) {
        menuToggle.addEventListener('click', () => {
            if (sideMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Load books + chapters
    async function loadBooksAndChapters() {
        if (!booksList) return;

        booksList.textContent = 'Loading books...';

        try {
            const res = await fetch('/api/books');
            const books = await res.json();

            booksList.innerHTML = '';

            books.forEach(book => {
                // Wrapper for each book
                const bookContainer = document.createElement('div');
                bookContainer.className = 'book-item';

                // Book header button
                const bookHeader = document.createElement('button');
                bookHeader.className = 'book-header';
                bookHeader.textContent = book.name;
                bookHeader.dataset.bookId = book.id;

                // Chapter list (hidden by default)
                const chapterList = document.createElement('ul');
                chapterList.className = 'chapter-list';

                // book.chapters is an object: { "1": [...], "2": [...], ... }
                const chapterNumbers = Object.keys(book.chapters)
                    .map(Number)
                    .sort((a, b) => a - b);

                chapterNumbers.forEach(chNum => {
                    const li = document.createElement('li');
                    li.className = 'chapter-item';
                    li.textContent = `Chapter ${chNum}`;
                    li.dataset.bookId = book.id;
                    li.dataset.chapter = chNum;

                    // When a chapter is clicked, scroll the main content
                    li.addEventListener('click', () => {
                        const targetId = `book-${book.id}-chapter-${chNum}`;
                        const target = document.getElementById(targetId);

                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            console.warn('No content element with id', targetId);
                        }

                        // Optional: close the menu after selecting a chapter
                        closeMenu();
                    });

                    chapterList.appendChild(li);
                });

                // Toggle chapters open/closed when clicking the book name
                bookHeader.addEventListener('click', () => {
                    const isOpen = chapterList.classList.toggle('open');
                    if (isOpen) {
                        bookHeader.classList.add('open');
                    } else {
                        bookHeader.classList.remove('open');
                    }
                });

                bookContainer.appendChild(bookHeader);
                bookContainer.appendChild(chapterList);
                booksList.appendChild(bookContainer);
            });

        } catch (err) {
            console.error('Failed to load books/chapters:', err);
            booksList.textContent = 'Error loading books.';
        }
    }

    loadBooksAndChapters();
});

