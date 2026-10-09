console.log('index.js successfully loaded');
const highlightButton = document.getElementById('highlight-button');

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    if (!content) return;

    content.textContent = 'Loading Bible...';

    fetch('/api/books')
        .then(res => res.json())
        .then(books => {
            content.textContent = '';  // clear "Loading..."

            books.forEach(book => {
                // --- Book section ---
                const bookSection = document.createElement('section');
                bookSection.className = 'book';
                bookSection.id = `book-${book.id}`;

                const bookHeading = document.createElement('h2');
                bookHeading.textContent = book.name;
                bookSection.appendChild(bookHeading);

                // chapters is an object: { "1": [ {number, text}, ... ], "2": [...] }
                const chapterNumbers = Object.keys(book.chapters)
                    .map(Number)
                    .sort((a, b) => a - b);

                chapterNumbers.forEach(chNum => {
                    const chapterSection = document.createElement('section');
                    chapterSection.className = 'chapter';
                    chapterSection.id = `book-${book.id}-chapter-${chNum}`;

                    const chapterHeading = document.createElement('h3');
                    chapterHeading.textContent = `Chapter ${chNum}`;
                    chapterSection.appendChild(chapterHeading);

                    const verses = book.chapters[chNum]; // array of { number, text }

                    verses.forEach(v => {
                        const verseP = document.createElement('p');
                        verseP.className = 'verse';

                        const verseNumberSpan = document.createElement('span');
                        verseNumberSpan.className = 'verse-number';
                        verseNumberSpan.textContent = v.number;

                        verseP.appendChild(verseNumberSpan);
                        verseP.appendChild(
                            document.createTextNode(' ' + v.text)
                        );

                        chapterSection.appendChild(verseP);
                    });

                    bookSection.appendChild(chapterSection);
                });

                content.appendChild(bookSection);
            });
        })
        .catch(err => {
            console.error('Failed to load Bible:', err);
            content.textContent = 'Error loading Bible.';
        });
});
document.addEventListener('mouseup', function () {
    const selection = window.getSelection();
    
    // Check if any text is selected
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        
        if (range.startContainer.parentNode.className === 'highlight') {
            // Remove highlight
            try {
                span.className = 'unhighlight';
                range.surroundContents(span);
            } catch (e) {
                console.error('Error removing highlight:', e);
            }
        } else {
            // Add highlight
            try {
                span.className = 'highlight';
                range.surroundContents(span);
            } catch (e) {
                console.error('Error adding highlight:', e);
            }
        }
    }
});

