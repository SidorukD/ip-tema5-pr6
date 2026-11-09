const apiUrl = 'https://jsonplaceholder.typicode.com';

const selectElement = document.getElementById('select');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const contentElement = document.getElementById('content');
const authorElement = document.getElementById('author');
const photosElement = document.getElementById('photos');

let albumsArray = [];

async function loadAlbums() {
    loadingElement.textContent = 'Загрузка...';
    
    try {
        const response = await fetch(apiUrl + '/albums');
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        
        albumsArray = await response.json();
        
        let optionsHtml = '<option value="">-- Выберите альбом --</option>';
        
        for (let i = 0; i < albumsArray.length; i++) {
            optionsHtml += '<option value="' + albumsArray[i].id + '">' + albumsArray[i].title + '</option>';
        }
        
        selectElement.innerHTML = optionsHtml;
        
    } catch (err) {
        errorElement.textContent = err.message;
        selectElement.innerHTML = '<option value="">Ошибка</option>';
    } finally {
        loadingElement.textContent = '';
    }
}

selectElement.addEventListener('change', async function() {
    let selectedId = selectElement.value;
    
    authorElement.innerHTML = '';
    photosElement.innerHTML = '';
    errorElement.textContent = '';
    
    if (selectedId === '') {
        contentElement.style.display = 'none';
        return;
    }
    
    contentElement.style.display = 'block';
    loadingElement.textContent = 'Загрузка данных...';
    
    let currentAlbum = null;
    
    for (let i = 0; i < albumsArray.length; i++) {
        if (albumsArray[i].id == selectedId) {
            currentAlbum = albumsArray[i];
            break;
        }
    }
    
    try {
        const [userResponse, photosResponse] = await Promise.all([
            fetch(apiUrl + '/users/' + currentAlbum.userId),
            fetch(apiUrl + '/photos?albumId=' + currentAlbum.id)
        ]);
        
        if (!userResponse.ok || !photosResponse.ok) {
            throw new Error('Не удалось получить данные');
        }
        
        const user = await userResponse.json();
        const photos = await photosResponse.json();
        
        authorElement.innerHTML = '<h3>Автор альбома</h3>' +
            '<p><b>Имя:</b> ' + user.name + '</p>' +
            '<p><b>Username:</b> ' + user.username + '</p>' +
            '<p><b>Email:</b> ' + user.email + '</p>' +
            '<p><b>Фотографий:</b> ' + photos.length + '</p>';
            
        let photosHtml = '';
        
        for (let i = 0; i < photos.length; i++) {
            photosHtml += '<div class="card">' +
                '<a href="' + photos[i].url + '" target="_blank" rel="noopener noreferrer">' +
                    '<img src="' + photos[i].thumbnailUrl + '" alt="photo">' +
                '</a>' +
                '<p class="card-text" title="' + photos[i].title + '">' + photos[i].title + '</p>' +
            '</div>';
        }
        
        photosElement.innerHTML = photosHtml;
        
    } catch (err) {
        errorElement.textContent = err.message;
    } finally {
        loadingElement.textContent = '';
    }
});

loadAlbums();