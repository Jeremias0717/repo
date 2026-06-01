let boards = JSON.parse(localStorage.getItem('trello-boards')) || [];
let currentEditingCard = null;
let currentBoardId = null;
let currentListId = null;

const DEFAULT_LISTS = [
    { id: 1, title: 'Pendientes', status: 'pendiente', cards: [] },
    { id: 2, title: 'En proceso', status: 'proceso', cards: [] },
    { id: 3, title: 'Completados', status: 'completado', cards: [] }
];

document.addEventListener('DOMContentLoaded', function() {
    const userName = localStorage.getItem('urbee-user-name');
    if (userName) {
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            headerTitle.textContent = `Tablero de ${userName}`;
        }
    }
    renderBoards();
    setupDragAndDrop();
});

function showAddBoardModal() {
    document.getElementById('addBoardModal').style.display = 'flex';
    document.getElementById('boardTitleInput').focus();
}

function hideAddBoardModal() {
    document.getElementById('addBoardModal').style.display = 'none';
    document.getElementById('boardTitleInput').value = '';
}

function createBoard() {
    const title = document.getElementById('boardTitleInput').value.trim();
    if (!title) return;

    // Clonamos profundamente los objetos de las listas por defecto para evitar que compartan
    // referencias de la propiedad 'cards' entre distintos tableros creados.
    const lists = DEFAULT_LISTS.map(list => ({
        ...list,
        cards: []
    }));

    const board = {
        id: Date.now(),
        title: title,
        lists: lists
    };

    boards.push(board);
    saveData();
    renderBoards();
    hideAddBoardModal();
}

function showEditCardModal(cardId, boardId, listId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    const list = board.lists.find(l => l.id === listId);
    if (!list) return;
    const card = list.cards.find(c => c.id === cardId);
    if (!card) return;

    currentEditingCard = card;
    currentBoardId = boardId;
    currentListId = listId;

    document.getElementById('cardTitleInput').value = card.title || '';
    document.getElementById('cardDescInput').value = card.description || '';
    document.getElementById('editCardModal').style.display = 'flex';
    document.getElementById('cardTitleInput').focus();
}

function hideEditCardModal() {
    document.getElementById('editCardModal').style.display = 'none';
    currentEditingCard = null;
}

function saveCard() {
    if (!currentEditingCard || !currentBoardId || !currentListId) return;

    currentEditingCard.title = document.getElementById('cardTitleInput').value.trim();
    currentEditingCard.description = document.getElementById('cardDescInput').value.trim();
    currentEditingCard.updatedAt = new Date().toISOString();

    saveData();
    renderBoard(currentBoardId);
    hideEditCardModal();
}

function deleteCard(cardId, boardId, listId) {
    if (confirm('¿Eliminar esta tarea?')) {
        const board = boards.find(b => b.id === boardId);
        if (board) {
            const list = board.lists.find(l => l.id === listId);
            if (list) {
                list.cards = list.cards.filter(c => c.id !== cardId);
                saveData();
                renderBoard(boardId);
            }
        }
    }
}

function renderBoards() {
    const container = document.getElementById('boardsContainer');
    if (boards.length === 0) {
        container.innerHTML = `
            <div style="padding: 60px 40px; text-align: center; color: #6b778c; background: white; border-radius: 12px; width: 100%;">
                <h3>¡Crea tu primer proyecto!</h3>
                <p>Se generarán automáticamente las columnas: Pendientes → En proceso → Completados</p>
                <button class="add-board-btn" onclick="showAddBoardModal()" style="margin-top: 24px; padding: 16px 32px; font-size: 16px;">
                    + Crear mi primer proyecto
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = boards.map(board => `
        <div class="board" data-board-id="${board.id}">
            <div class="board-header">
                <div>
                    <div class="board-title">${board.title}</div>
                    <div class="board-stats">
                        ${board.lists.map(list =>
        `<span>${list.title} <strong>(${list.cards.length})</strong></span>`
    ).join(' | ')}
                    </div>
                </div>
                <button class="delete-board" onclick="deleteBoard(${board.id})">Eliminar</button>
            </div>
            <div class="lists-container">
                ${board.lists.map(list => renderList(list, board.id)).join('')}
            </div>
        </div>
    `).join('');

    setupDragAndDrop();
}

function renderList(list, boardId) {
    return `
        <div class="list" data-list-id="${list.id}" data-board-id="${boardId}">
            <div class="list-header list-status">
                <span class="status-icon status-${list.status}"></span>
                ${list.title}
                <span style="margin-left: auto; font-weight: 500; color: #6b778c;">
                    ${list.cards.length}
                </span>
            </div>
            <div class="cards-container" data-list-id="${list.id}">
                ${list.cards.map(card => renderCard(card, boardId, list.id, list.status)).join('')}
                <button class="add-card-btn" onclick="showAddCardModal(${boardId}, ${list.id})">
                    + Añadir nueva tarea
                </button>
            </div>
        </div>
    `;
}

function renderCard(card, boardId, listId, status) {
    return `
        <div class="card status-${status}" 
             data-card-id="${card.id}" 
             data-board-id="${boardId}" 
             data-list-id="${listId}"
             draggable="true"
             ondblclick="showEditCardModal(${card.id}, ${boardId}, ${listId})">
            <button class="delete-card" onclick="deleteCard(${card.id}, ${boardId}, ${listId}); event.stopPropagation();">×</button>
            <div class="card-title">${card.title}</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            <div class="card-date">
                ${new Date(card.updatedAt).toLocaleDateString('es-ES')}
            </div>
        </div>
    `;
}

function renderBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (board) {
        const boardElement = document.querySelector(`[data-board-id="${boardId}"]`);
        if (boardElement) {
            boardElement.querySelector('.lists-container').innerHTML =
                board.lists.map(list => renderList(list, boardId)).join('');
            setupDragAndDrop();
        }
    }
}

function deleteBoard(boardId) {
    if (confirm('¿Eliminar este proyecto completo?')) {
        boards = boards.filter(b => b.id !== boardId);
        saveData();
        renderBoards();
    }
}

function showAddCardModal(boardId, listId) {
    const title = prompt('Nombre de la nueva tarea:');
    if (title) {
        const board = boards.find(b => b.id === boardId);
        if (board) {
            const list = board.lists.find(l => l.id === listId);
            if (list) {
                list.cards.unshift({
                    id: Date.now(),
                    title: title.trim(),
                    description: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                saveData();
                renderBoard(boardId);
            }
        }
    }
}

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    const dropZones = document.querySelectorAll('.cards-container');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = e.target;
    e.target.style.opacity = '0.7';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    document.querySelectorAll('.cards-container').forEach(zone => {
        zone.classList.remove('drag-over');
    });
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.cards-container').classList.add('drag-over');
}

function handleDragLeave(e) {
    const zone = e.target.closest('.cards-container');
    if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.cards-container');
    dropZone.classList.remove('drag-over');

    if (draggedCard && dropZone) {
        const draggedBoardId = parseInt(draggedCard.dataset.boardId);
        const draggedListId = parseInt(draggedCard.dataset.listId);
        const dropBoardId = parseInt(dropZone.dataset.boardId || dropZone.closest('.list').dataset.boardId);
        const dropListId = parseInt(dropZone.dataset.listId || dropZone.closest('.list').dataset.listId);

        if (draggedBoardId !== dropBoardId || draggedListId !== dropListId) {
            moveCard(draggedCard.dataset.cardId, draggedBoardId, draggedListId, dropBoardId, dropListId);
        }
    }
}

function moveCard(cardId, fromBoardId, fromListId, toBoardId, toListId) {
    const fromBoard = boards.find(b => b.id === fromBoardId);
    const toBoard = boards.find(b => b.id === toBoardId);

    if (fromBoard && toBoard) {
        const fromList = fromBoard.lists.find(l => l.id === fromListId);
        const toList = toBoard.lists.find(l => l.id === toListId);

        if (fromList && toList) {
            const cardIndex = fromList.cards.findIndex(c => c.id == cardId);
            if (cardIndex !== -1) {
                const [movedCard] = fromList.cards.splice(cardIndex, 1);
                toList.cards.push(movedCard);
                movedCard.updatedAt = new Date().toISOString();
                saveData();
                renderBoard(fromBoardId);
                renderBoard(toBoardId);
            }
        }
    }
}

function saveData() {
    localStorage.setItem('trello-boards', JSON.stringify(boards));
}

window.onclick = function (event) {
    const modals = document.querySelectorAll('.input-modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        hideAddBoardModal();
        hideEditCardModal();
    }
});
