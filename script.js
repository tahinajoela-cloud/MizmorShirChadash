document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const toggleViewLink = document.getElementById('toggle-view');
    let allSongs = [];
    let authors = [];
    let currentSongs = []; 

    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx0LfEILechHBVKVEjuWA57E18yXF9xTXfcLPXCY75dGSZvNf2lLaiy6Rrgu9XW6FVkQ57cmE9ewCV/pub?output=csv';

    // 1. Zahana aloha raha efa misy data voatahiry (Offline First)[cite: 5]
    const cachedData = localStorage.getItem('songs_data');
    if (cachedData) {
        allSongs = JSON.parse(cachedData);
        authors = [...new Set(allSongs.map(song => song.author))];
        renderHomePage(allSongs);
    }

    // 2. Alaina ny angona vaovao avy amin'ny internet
    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    allSongs = results.data; 
                    localStorage.setItem('songs_data', JSON.stringify(allSongs)); // Tahirizina ho an'ny offline[cite: 5]
                    authors = [...new Set(allSongs.map(song => song.author))];
                    renderHomePage(allSongs);
                }
            });
        })
        .catch(err => {
            console.error("Offline mode: mampiasa ny data efa voatahiry.");
            if (!cachedData) {
                appContainer.innerHTML = '<p style="text-align:center; padding:20px;">Mila internet ianao amin'ny voalohany.</p>';
            }
        });

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
        if(toggleViewLink) toggleViewLink.textContent = "Mpamoron-kira";

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
            container.innerHTML = '<li style="text-align:center; color:#333; background:none; box-shadow:none;">Tsy misy hira hita.</li>';
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
        window.scrollTo(0,0);
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
        authors.sort().forEach(author => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="author-name">${author}</span>`;
            li.addEventListener('click', () => {
                const filtered = allSongs.filter(s => s.author === author);
                renderHomePage(filtered);
            });
            authorList.appendChild(li);
        });
        if(toggleViewLink) toggleViewLink.textContent = "Lohatenin-kira";
    }

    if(toggleViewLink) {
        toggleViewLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (toggleViewLink.textContent === "Mpamoron-kira") {
                renderAuthorPage();
            } else {
                renderHomePage(allSongs);
            }
        });
    }
});
