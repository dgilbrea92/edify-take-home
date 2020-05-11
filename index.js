// main entry script

const buildActivityFilter = activities => {

  const activityFilter = document.createElement('div');
  activityFilter.setAttribute('class', 'dropdown');

  const activityButton = document.createElement('button');
  activityButton.setAttribute('class', 'btn');
  activityButton.innerHTML = 'Filter by Activity';

  const activitySelect = document.createElement('select');
  activitySelect.id = 'activitySelect';
  activitySelect.setAttribute('class', 'dropdown-content');
  activitySelect.setAttribute('multiple', true);

  // build options and append to activity select
  activities.forEach(activity => {
    let item = document.createElement('option');
    item.innerHTML = activity.name;
    item.value = activity.name;
    activitySelect.appendChild(item);
  })

  activityFilter.append(activityButton, activitySelect);

  return activityFilter;
}

const buildParkCard = park => {

  const parkCard = document.createElement('div');
  parkCard.setAttribute('class', 'park-card text-center contrast-text');
  parkCard.style.backgroundImage = `url(${park.images[0].url})`;

  // add favorites icon
  const favoriteBtn = document.createElement('p');
  favoriteBtn.setAttribute('class', 'white-icon');
  favoriteBtn.innerHTML = '☆';
  favoriteBtn.onclick = e => {

    if (e.target.innerHTML == '☆') {
      e.target.innerHTML = '★';
    } else {
      e.target.innerHTML = '☆';
    }
  };

  // display name and location
  const parkName = document.createElement('h2');
  parkName.innerHTML = park.fullName;

  const parkLocation = document.createElement('p');
  parkLocation.innerHTML = (park.addresses[0].city + ', ' + park.addresses[0].stateCode);

  // display entrance fee
  // if entrance fee data exists, parse as int. else, set to 0.00
  let cost = park.entranceFees[0] ? parseInt(park.entranceFees[0].cost) : 0.00;
  // trim entrance fee data to 2 decimal places before appending to card
  const parkCost = document.createElement('p');
  parkCost.innerHTML = 'Entrance fee: $' + cost.toFixed(2);

  // display links to phone number and email address
  const parkPhone = document.createElement('a');
  parkPhone.setAttribute('href', 'tel:' + park.contacts.phoneNumbers[0].phoneNumber);
  parkPhone.innerHTML = 'Phone: ' + park.contacts.phoneNumbers[0].phoneNumber + '<br />';

  const parkEmail = document.createElement('a');
  parkEmail.setAttribute('href', 'mailto:' + park.contacts.emailAddresses[0].emailAddress);
  parkEmail.innerHTML = 'Email: ' + park.contacts.emailAddresses[0].emailAddress;

  const cornerArrow = document.createElement('p');
  cornerArrow.setAttribute('class', 'white-icon');
  cornerArrow.innerHTML = '↓';
  cornerArrow.onclick = e => {

    // if arrow points up, switch to down and expand contents
    if (e.target.innerHTML == '↑') {

      e.target.innerHTML = '↓';

      const activities = document.getElementById('activities');
      activities.parentNode.removeChild(activities);

      parkCard.setAttribute('class', 'park-card text-center contrast-text');

    } else {

      // if arrow points down, switch to up and close contents
      e.target.innerHTML = '↑';

      // add activities list
      const activities = document.createElement('ul');
      activities.id = 'activities';

      park.activities.forEach(activity => {
        let item = document.createElement('li');
        item.innerHTML = activity.name;
        activities.appendChild(item);
      })

      parkCard.setAttribute('class', 'park-card text-center contrast-text expanded');
      parkCard.append(activities);
    }


  };

  parkCard.append(favoriteBtn, parkName, parkLocation, parkCost, parkPhone, parkEmail, cornerArrow);
  return parkCard;
}

const requestParksData = (stateCode) => {

  const parksWindow = document.getElementById('park-content');

  // if existing park data exists, remove it
  while (parksWindow.firstChild) {
    parksWindow.removeChild(parksWindow.firstChild);
  }

  const loadingMessage = document.createElement('p');
  loadingMessage.innerHTML = ('Loading parks data, please wait...');
  loadingMessage.setAttribute('class','text-center contrast-text');
  parksWindow.appendChild(loadingMessage);

  // display loading message until results load, then unmount and display results
  fetch(`https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&api_key=j1WghsFUUeH4fyCRBXxdB2wLbKpIqoWhmLOI2onV`)
    .then(response => response.json())
    .then(data => {
      // remove loading message
      // parksWindow.removeChild(loadingMessage);
      loadingMessage.parentNode.removeChild(loadingMessage);
      // create a card for each park in the returned data array
      if (data.data.length < 1) {
        const noResultMsg = document.createElement('p');
        noResultMsg.setAttribute('class', 'text-center');
        noResultMsg.innerHTML = 'Sorry, there are no parks in that state (or it doesn\'t exist)';
        parksWindow.appendChild(noResultMsg);
      } else {
        data.data.forEach(park => {
          if (park.images[0]) {
            const card = buildParkCard(park);
            parksWindow.append(card);
          }
        })
      }
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
  submitButton.setAttribute('class', 'btn');
  submitButton.setAttribute('value', 'Submit');

  searchForm.append(stateInput, submitButton, buildActivityFilter([{ name: 'test1' }, { name: 'test2' }]));

  return searchForm;
}

const buildHeader = () => {

  const headerBox = document.createElement('div');
  headerBox.setAttribute('class', 'wrapper text-center');

  const title = document.createElement('h1');
  title.setAttribute('class', 'contrast-text')
  title.innerHTML = 'Park Finder';

  headerBox.append(title, buildSearchForm());

  return headerBox;
}

const buildParkContent = () => {

  const parkContent = document.createElement('div');
  parkContent.setAttribute('id', 'park-content');
  parkContent.setAttribute('class', 'wrapper grid');

  return parkContent;
}

const root = document.getElementById('root');

root.append(buildHeader(), buildParkContent());
