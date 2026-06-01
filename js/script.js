const board = document.getElementById('board');
const addListBtn = document.getElementById('addListBtn');

addListBtn.addEventListener('click', () => {
  const listName = prompt('Nombre de la lista:');
  if (!listName) return;

  const list = document.createElement('div');
  list.className = 'list';
  list.innerHTML = `
    <div class="list-header">
      <h2>${listName}</h2>
      <button class="deleteListBtn">✖</button>
    </div>
    <div class="cards"></div>
    <button class="addCardBtn">+ Añadir Tarjeta</button>
  `;
  board.appendChild(list);

  const addCardBtn = list.querySelector('.addCardBtn');
  const cardsContainer = list.querySelector('.cards');
  const deleteListBtn = list.querySelector('.deleteListBtn');

  // Añadir tarjetas
  addCardBtn.addEventListener('click', () => {
    const cardText = prompt('Contenido de la tarjeta:');
    if (!cardText) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span>${cardText}</span>
      <button class="deleteCardBtn">✔ Eliminar</button>
    `;
    cardsContainer.appendChild(card);

    const deleteBtn = card.querySelector('.deleteCardBtn');
    deleteBtn.addEventListener('click', () => {
      card.remove();
    });
  });

  // Eliminar lista completa
  deleteListBtn.addEventListener('click', () => {
    list.remove();
  });
});
