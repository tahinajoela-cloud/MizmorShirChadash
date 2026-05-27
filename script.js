document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const toggleViewLink = document.getElementById('toggle-view');
    let allSongs = [];
    let authors = [];
    let currentSongs = []; 

    // Ampidiro eto ny URL avy amin'ny Google Sheet (tsy misy "https:" indroa)
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx0LfEILechHBVKVEjuWA57E18yXF9xTXfcLPXCY75dGSZvNf2lLaiy6Rrgu9XW6FVkQ57cmE9ewCV/pub?output=csv';

    // Famakiana ny angona
    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    allSongs = results.data; 
                    // Fanamarihana: Ataovy azo antoka fa ny lohatenin'ny tsanganana ao amin'ny Sheet dia:
                    // title, author, key, text
                    authors = [...new Set(allSongs.map(song => song.author))];
                    renderHomePage(allSongs);
                }
            });
        })
        .catch(err => console.error("Misy olana tamin'ny fakana ny angona:", err));

    function renderHomePage(songsToRender) {
        currentSongs = songsToRender;
        appContainer.innerHTML = `
            <header>
                <h1>Mizmor Shir Chadash</h1>
                <input type="text" id="search-input" class="search-bar" placeholder="Mikaroka lohatenin-kira...">
            </header>
            <ul id="song-list" class="song-list"></ul>
        `;
        const searchInput = document.getElementById('search-input');
        const songList = document.getElementById('song-list');

        renderSongList(currentSongs, songList);
        toggleViewLink.textContent = "Mpamoron-kira";

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSongs = allSongs.filter(song =>
                song.title.toLowerCase().includes(searchTerm) ||
                (song.text && song.text.toLowerCase().includes(searchTerm))
            );
            renderSongList(filteredSongs, songList);
        });
    }

    function renderSongList(songs, container) {
        container.innerHTML = '';
        if (songs.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:white;">Tsy misy hira hita.</p>';
        } else {
            songs.forEach((song, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="song-title-list">${song.title}</span>`;
                li.addEventListener('click', () => renderSongDetails(song, index));
                container.appendChild(li);
            });
        }
    }

    function renderSongDetails(song, index) {
        appContainer.innerHTML = `
            <div class="song-details-container">
                <header class="sticky-header">
                    <div class="song-navigation">
                        <button id="prev-song" class="nav-button">Teo aloha</button>
                        <button id="back-to-list" class="nav-button">Hira rehetra</button>
                        <button id="next-song" class="nav-button">Manaraka</button>
                    </div>
                </header>
                <div class="song-details">
                    <h2>${song.title}</h2>
                    <p><strong>Mpamorona:</strong> ${song.author}</p>
                    <p><strong>Fanalahidy:</strong> ${song.key}</p>
                    <pre>${song.text}</pre>
                </div>
            </div>
        `;
        
        document.getElementById('prev-song').addEventListener('click', () => {
            const newIndex = (index - 1 + currentSongs.length) % currentSongs.length;
            renderSongDetails(currentSongs[newIndex], newIndex);
        });

        document.getElementById('next-song').addEventListener('click', () => {
            const newIndex = (index + 1) % currentSongs.length;
            renderSongDetails(currentSongs[newIndex], newIndex);
        });

        document.getElementById('back-to-list').addEventListener('click', () => {
            renderHomePage(currentSongs);
        });
    }

    function renderAuthorPage() {
        appContainer.innerHTML = `
            <header>
                <h1>Chalan Mizmor Shir</h1>
                <input type="text" id="search-input" class="search-bar" placeholder="Mikaroka anaran'ny mpamorona...">
            </header>
            <ul id="author-list" class="author-list"></ul>
        `;
        const authorList = document.getElementById('author-list');
        authors.forEach(author => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="author-name">${author}</span>`;
            li.addEventListener('click', () => {
                const filtered = allSongs.filter(s => s.author === author);
                renderHomePage(filtered);
            });
            authorList.appendChild(li);
        });
        toggleViewLink.textContent = "Lohatenin-kira";
    }

    toggleViewLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (toggleViewLink.textContent === "Mpamoron-kira") {
            renderAuthorPage();
        } else {
            renderHomePage(allSongs);
        }
    });
});