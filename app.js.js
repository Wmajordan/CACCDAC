let animals = JSON.parse(localStorage.getItem('animals')) || [];

function saveAnimals() {
  localStorage.setItem('animals', JSON.stringify(animals));
}

function getVolunteerInitials() {
  const name = document.getElementById('volunteer-name').value.trim();
  return name ? name.split(' ').map(n => n[0]).toUpperCase().join('') : '';
}

function saveAnimal() {
  const id = document.getElementById('animal-id').value;
  const name = document.getElementById('animal-name').value;
  const type = document.getElementById('animal-type').value;
  const gender = document.getElementById('animal-gender').value;
  const kennelNumber = document.getElementById('kennel-number').value;
  const color = document.getElementById('animal-color').value;
  const intakeDate = document.getElementById('intake-date').value;
  const notes = document.getElementById('animal-notes').value;
  const mediaInput = document.getElementById('animal-media');
  const initials = getVolunteerInitials();
  const date = new Date().toLocaleDateString();

  if (!name || !kennelNumber || !intakeDate || !initials) {
    alert('Please complete all required fields and enter your name.');
    return;
  }

  const readFiles = (files) => Promise.all(
    Array.from(files).map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve({ src: e.target.result, type: file.type });
        reader.readAsDataURL(file);
      });
    })
  );

  readFiles(mediaInput.files).then(mediaItems => {
    if (id) {
      const animal = animals.find(animal => animal.id === parseInt(id));
      if (animal) {
        animal.name = name;
        animal.type = type;
        animal.gender = gender;
        animal.kennelNumber = kennelNumber;
        animal.color = color;
        animal.intakeDate = intakeDate;
        animal.notes = notes;
        animal.media = [...(animal.media || []), ...mediaItems];
        animal.actions.push({ action: 'Edit', performedBy: initials, date });
        alert(`${animal.type} named ${animal.name} updated.`);
      }
    } else {
      const newAnimal = {
        id: Date.now(),
        name,
        type,
        gender,
        kennelNumber,
        color,
        intakeDate,
        notes,
        media: mediaItems,
        actions: [{ action: 'Add', performedBy: initials, date }]
      };
      animals.push(newAnimal);
      alert(`${type} named ${name} added.`);
    }

    saveAnimals();
    resetForm();
    updateAnimalTable();
  });
}

function resetForm() {
  document.getElementById('animal-id').value = '';
  document.getElementById('animal-name').value = '';
  document.getElementById('kennel-number').value = '';
  document.getElementById('intake-date').value = '';
  document.getElementById('animal-notes').value = '';
  document.getElementById('animal-media').value = '';
}

function updateAnimalTable(filterType = 'All') {
  const tbody = document.querySelector('#animal-table tbody');
  tbody.innerHTML = '';

  animals
    .filter(a => filterType === 'All' || a.type === filterType)
    .forEach(animal => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${animal.name}</td>
        <td>${animal.type}</td>
        <td>${animal.gender}</td>
        <td>${animal.kennelNumber}</td>
        <td data-color="${animal.color}">${animal.color}</td>
        <td>${animal.intakeDate}</td>
        <td>${animal.notes}</td>
        <td>
          <button onclick="editAnimal(${animal.id})">Edit</button>
          <button onclick="removeAnimal(${animal.id})">Remove</button>
          <button onclick="holdAnimal(${animal.id})">Hold</button>
          <button onclick="showPhotos(${animal.id})">Photos/Videos</button>
        </td>
      `;
      tbody.appendChild(row);
    });
}

function editAnimal(id) {
  const animal = animals.find(a => a.id === id);
  if (animal) {
    document.getElementById('animal-id').value = animal.id;
    document.getElementById('animal-name').value = animal.name;
    document.getElementById('animal-type').value = animal.type;
    document.getElementById('animal-gender').value = animal.gender;
    document.getElementById('kennel-number').value = animal.kennelNumber;
    document.getElementById('animal-color').value = animal.color;
    document.getElementById('intake-date').value = animal.intakeDate;
    document.getElementById('animal-notes').value = animal.notes;
    alert(`Editing ${animal.type} named ${animal.name}. Save to update.`);
  }
}

function removeAnimal(id) {
  animals = animals.filter(animal => animal.id !== id);
  saveAnimals();
  updateAnimalTable();
  alert('Animal removed.');
}

function holdAnimal(id) {
  const initials = getVolunteerInitials();
  const date = new Date().toLocaleDateString();
  const animal = animals.find(a => a.id === id);
  if (animal) {
    animal.notes = 'Adoption Hold';
    animal.actions.push({ action: 'Hold', performedBy: initials, date });
    saveAnimals();
    updateAnimalTable();
    alert(`${animal.name} is on hold.`);
  }
}

function showPhotos(id) {
  const animal = animals.find(a => a.id === id);
  const container = document.getElementById('photo-container');
  container.innerHTML = '';

  if (animal.media && animal.media.length > 0) {
    animal.media.forEach(item => {
      if (item.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = item.src;
        container.appendChild(img);
      } else if (item.type.startsWith('video/')) {
        const vid = document.createElement('video');
        vid.src = item.src;
        vid.controls = true;
        vid.width = 300;
        container.appendChild(vid);
      }
    });
  } else {
    container.innerHTML = '<p>No media uploaded for this animal.</p>';
  }

  document.getElementById('photo-modal').classList.remove('hidden');
}

function closePhotoModal() {
  document.getElementById('photo-modal').classList.add('hidden');
}

window.addEventListener('click', function (event) {
  const modal = document.getElementById('photo-modal');
  if (event.target === modal) {
    closePhotoModal();
  }
});

// Initialize
updateAnimalTable();

