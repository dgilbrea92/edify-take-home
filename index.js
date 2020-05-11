// main entry script

const addParkContent = parks => {

  const parksWindow = document.getElementById('park-content');

  parks.forEach((park, index) => {
    const newPark = document.createElement('div');
    newPark.setAttribute('id', `${index}`);
    newPark.setAttribute('innerHTML','NEW PARK');
    parksWindow.appendChild(newPark);
  })
}

const buildParkCard = park => {

  const parkCard = document.createElement('div');
  parkCard.setAttribute('class', 'park-card');
  parkCard.innerHTML = park.name;

  return parkCard;
}

const requestParksData = (stateCode) => {

  const loadingMessage = document.createTextNode('LOADING PARKS DATA, PLEASE WAIT');
  const parksWindow = document.getElementById('park-content');
  parksWindow.appendChild(loadingMessage);

  // display spinner or loading message until results load, then unmount spinner and mount displayed results
  fetch(`https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&api_key=j1WghsFUUeH4fyCRBXxdB2wLbKpIqoWhmLOI2onV`)
    .then(response => response.json())
    .then(data => {
      // if loading message exists, remove it
      parksWindow.removeChild(loadingMessage);
      // if existing park data exists, remove it
      data.data.forEach(park => {
        const card = buildParkCard(park);
        parksWindow.appendChild(card);
      })
    })
    .catch(err => console.log(err));
}

const handleSubmit = event => {

  event.preventDefault();
  const getFormValue = document.getElementById('state-input');

  requestParksData(getFormValue.value);
}

const buildSearchForm = () => {

  const searchForm = document.createElement('form');
  searchForm.setAttribute('id', 'search-form');
  searchForm.setAttribute('onsubmit', 'return handleSubmit(event)')

  const stateInput = document.createElement('input');
  stateInput.setAttribute('id', 'state-input');
  stateInput.setAttribute('placeholder', 'Search by state (2 letter code)');

  const submitButton = document.createElement('input');
  submitButton.setAttribute('type', 'submit');
  submitButton.setAttribute('value', 'Submit');

  searchForm.appendChild(stateInput);
  searchForm.appendChild(submitButton);

  return searchForm;
}

const buildHeader = () => {

  const headerBox = document.createElement('div');
  headerBox.setAttribute('id', 'header');
  headerBox.setAttribute('class', 'wrapper');

  const title = document.createElement('h1');
  title.innerHTML = 'Park Buddy';

  headerBox.appendChild(title);
  headerBox.appendChild(buildSearchForm());

  return headerBox;
}

const buildParkContent = () => {

  const parkContent = document.createElement('div');
  parkContent.setAttribute('id', 'park-content');
  parkContent.setAttribute('class', 'wrapper');

  return parkContent;
}

const root = document.getElementById('root');

root.appendChild(buildHeader());
root.appendChild(buildParkContent());
