import data from "./data/got/got.js";
import { renderItems } from "./view.js";
import { filterDataFamily } from "./dataFunctions.js";
import { sortData } from "./dataFunctions.js";
import { filterDataLifeStatus } from "./dataFunctions.js";
import { showSurvivorsByHouse } from "./dataFunctions.js";

document.addEventListener("DOMContentLoaded", function () {
  // Variable para realizar un seguimiento del estado
  let isWelcomeShown = true;

  // Función para mostrar el contenido principal al hacer clic en el botón "Iniciar"
  document
    .querySelector("#starting-button")
    .addEventListener("click", function () {
      if (isWelcomeShown) {
        // Oculta la sección de bienvenida
        document.querySelector("#bienvenida").style.display = "none";
        isWelcomeShown = false; // Cambia el estado para evitar mostrar la bienvenida nuevamente
      }

      // Muestra la sección de contenido principal
      document.querySelector("#contenido").style.display = "block";
    });
});

const dataGot = data.got;
const root = document.querySelector("#root");
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector(".close");
const filterHousesSelect = document.getElementById("filterHouses");
const sortDataAlpha = document.querySelector("#sortData");
const resetFilterButton = document.querySelector("#resetFilter");
const filterLifeStatusSelect = document.getElementById("filterLifeStatus");
const resultDiv = document.getElementById("resultSurvivorsDiv");
const resultElement = document.getElementById("resultSurvivors");

// Variable para almacenar la última selección de filtro
let lastSelectedHouse = "Todos";

// Función para renderizar(mostrar) todos los personajes
const renderAllCharacters = () => {
  root.innerHTML = "";
  root.appendChild(renderItems(dataGot));
  setupModalEventListeners();
};

// Restablece la variable survivors al cargar la página
let survivors = 0;

// Función para filtrar y mostrar los personajes por familia (CASAS)
const updateCharactersByFamily = (family, selectedSortOrder) => {
  if (family === "") {
    renderAllCharacters();
  } else {
    const filteredData = filterDataFamily(dataGot, "family", family);
    const sortedData = sortData(filteredData, "fullName", selectedSortOrder);
    root.innerHTML = "";
    root.appendChild(renderItems(sortedData));
    setupModalEventListeners();

    // Llama a la función para mostrar los sobrevivientes
    survivors = showSurvivorsByHouse(sortedData);
    // Muestra el resultado en la interfaz
    resultElement.textContent = `En esta casa han sobrevivido ⪼${survivors}⪻ personajes.`;
    resultDiv.style.display = "block";
  }
};
// Función para filtrar por LifeStatus (Vivos o muertos)
filterLifeStatusSelect.addEventListener("change", function () {
  const selectedLifeStatus = filterLifeStatusSelect.value;
  const selectedSortOrder = sortDataAlpha.value;

  if (selectedLifeStatus === "") {
    renderAllCharacters();
  } else {
    const filteredData = filterDataLifeStatus(dataGot, selectedLifeStatus);
    const sortedData = sortData(filteredData, "fullName", selectedSortOrder);
    root.innerHTML = "";
    root.appendChild(renderItems(sortedData));
    setupModalEventListeners();
  }
});

// Llama a la función para renderizar todos los personajes al cargar la página
renderAllCharacters();

// Función para manejar el evento de cambio en el selector de CASAS
filterHousesSelect.addEventListener("change", function () {
  const selectedHouse = filterHousesSelect.value;
  const selectedSortOrder = sortDataAlpha.value;

  lastSelectedHouse = selectedHouse; // Actualiza la última selección de filtro

  if (selectedHouse === "Todos") {
    renderAllCharacters();
    survivors = 0; // Restablece la variable a cero
    resultElement.style.display = "none"; // Oculta el resultado en la interfaz
  } else {
    updateCharactersByFamily(selectedHouse, selectedSortOrder);
  }
});

// Función para mostrar el modal al hacer clic en las tarjetas de personajes
function setupModalEventListeners() {
  const liContainerAll = root.querySelectorAll(".container");

  liContainerAll.forEach((liContainer) => {
    liContainer.addEventListener("click", function () {
      //--> eliminado event dentro de parentesis, por test.
      modal.style.display = "block";
      const modalContent = document.querySelector(".modal-content");
      modalContent.innerHTML = "";

      const character = JSON.parse(localStorage.getItem("idCharacter"));

      const imageElement = document.createElement("img");
      imageElement.src = character.imageUrl;
      imageElement.classList.add("modal-image");
      modalContent.appendChild(imageElement);

      const personElement = document.createElement("div");
      personElement.setAttribute("itemscope", "");
      personElement.setAttribute("itemtype", "https://schema.org/Person");

      personElement.innerHTML = `
      <li itemprop="familyName">Nombre: <strong>${character.fullName}</strong></li><br>
      <li itemprop="memberOf">Familia: <strong>${character.family}</strong></li><br>
      <li itemprop="birthDate">Nacimiento: <strong>${character.born}</strong></li><br>
      <li itemprop="deathDate">Muerte: <strong>${character.death}</strong></li><br>
      <li itemprop="jobTitle">Título: <strong>"${character.title}"</strong></li><br>
    `;

      modalContent.appendChild(personElement);
    });
  });
}

// Función para ordenar los personajes
const sortCharacters = (data, sortOrder) => {
  const sortedData = [...data];
  if (sortOrder === "asc") {
    sortedData.sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else if (sortOrder === "desc") {
    sortedData.sort((a, b) => b.fullName.localeCompare(a.fullName));
  }
  return sortedData;
};

// Evento para manejar el cambio en la opción de ordenar alfabéticamente
sortDataAlpha.addEventListener("change", function () {
  const selectedSortOrder = sortDataAlpha.value;

  if (lastSelectedHouse === "Todos") {
    const sortedData = sortCharacters(dataGot, selectedSortOrder);
    root.innerHTML = "";
    root.appendChild(renderItems(sortedData));
    setupModalEventListeners();
  } else {
    updateCharactersByFamily(lastSelectedHouse, selectedSortOrder);
  }
});

// Evento para manejar el clic en el botón de reinicio
resetFilterButton.addEventListener("click", function () {
  filterHousesSelect.value = "";
  sortDataAlpha.value = "";
  lastSelectedHouse = "Todos"; // Restablece la última selección de filtro
  resultDiv.style.display = "none";

  renderAllCharacters();
});

// Cerrar el modal al hacer clic en el botón de cierre
closeModalBtn.addEventListener("click", function () {
  closeModalBtn.style.display = "none";
});

// Cerrar el modal si se hace clic en el fondo oscuro
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Agrega el evento para el selector de estado de vida
filterLifeStatusSelect.addEventListener("change", function () {
  const selectedLifeStatus = filterLifeStatusSelect.value;

  if (selectedLifeStatus === "") {
    renderAllCharacters();
  } else {
    const filteredData = filterDataLifeStatus(dataGot, selectedLifeStatus);
    root.innerHTML = "";
    root.appendChild(renderItems(filteredData));
    setupModalEventListeners();
  }
});
