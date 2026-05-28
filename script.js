document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx0LfEILechHBVKVEjuWA57E18yXF9xTXfcLPXCY75dGSZvNf2lLaiy6Rrgu9XW6FVkQ57cmE9ewCV/pub?output=csv';

    function loadData() {
        const cached = localStorage.getItem('songs_data');
        if (cached) {
            renderSongs(JSON.parse(cached));
        }
        
        // Miezaka mitady update na dia efa misy aza ny cache
        fetch(csvUrl)
            .then(r => r.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (res) => {
                        localStorage.setItem('songs_data', JSON.stringify(res.data));
                        renderSongs(res.data);
                    }
                });
            }).catch(() => console.log("Offline mode: mampiasa cache."));
    }

    function renderSongs(songs) {
        const list = document.getElementById('songs-list');
        if(!list) return;
        list.innerHTML = '';
        songs.forEach(s => {
            let div = document.createElement('div');
            div.textContent = s.title; // Hamarino tsara ny lohatenin'ny colone
            list.appendChild(div);
        });
    }

    loadData();
});
