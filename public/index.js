// *** MAIN ENTRY SCRIPT ***

// RENDER STATIC DOM ELEMENTS

// Build multi-select to filter park results by available activities
const activityFilter = document.createElement('div');
activityFilter.setAttribute('class', 'dropdown');

const activityButton = document.createElement('button');
activityButton.setAttribute('class', 'btn');
activityButton.innerHTML = 'Filter by Activity';

const activitySelect = document.createElement('select');
activitySelect.id = 'activitySelect';
activitySelect.setAttribute('class', 'dropdown-content');
activitySelect.setAttribute('multiple', true);

const activities = ["Biking","Boat Tour","Boating","Canoeing","Fishing","Food","Freshwater Fishing","Guided Tours","Kayaking","Museum Exhibits","Paddling","Picnicking","Road Biking","Shopping","Stand Up Paddleboarding","Wildlife Watching","Arts and Culture","Astronomy","ATV Off-Roading","Auto and ATV","Backcountry Camping","Backcountry Hiking","Birdwatching","Bookstore and Park Store","Camping","Car or Front Country Camping","Cultural Demonstrations","Front-Country Hiking","Gathering and Foraging","Group Camping","Hiking","Hunting","Hunting and Gathering","Junior Ranger Program","Mountain Biking","Park Film","RV Camping","Scenic Driving","Stargazing","Cross-Country Skiing","Dining","Horse Trekking","Skiing","Snowshoeing","Self-Guided Tours - Walking","Climbing","Horseback Riding","Whitewater Rafting","Bus/Shuttle Guided Tour","Canoe or Kayak Camping","Golfing","Historic Weapons Demonstration","Living History","Saltwater Fishing","Saltwater Swimming","Snorkeling","Surfing","Swimming","Citizen Science","Hands-On","Volunteer Vacation","Craft Demonstrations","Downhill Skiing","Gift Shop and Souvenirs","Live Music","Reenactments","Snow Play","SCUBA Diving","Caving","First Person Interpretation","Arts and Crafts","Self-Guided Tours - Auto","Mountain Climbing","Off-Trail Permitted Hiking","Rock Climbing","Theater","Dog Sledding","Fixed Wing Flying","Fly Fishing","Flying","Helicopter Flying","Ice Climbing","Snowmobiling","Compass and GPS","Geocaching","Freshwater Swimming","River Tubing","Tubing","Horse Camping (see also camping)","Horse Camping (see also Horse/Stock Use)","Motorized Boating"].sort();

// Build activity options and append to activity select
activities.forEach(activity => {
  let item = document.createElement('option');
  item.innerHTML = activity;
  item.value = activity;
  activitySelect.appendChild(item);
})

activityFilter.append(activityButton, activitySelect);

const getData = async (url) => {
  try {
    const response = await fetch(url);
    const json = await response.json();
    window.parkList = json;
    renderParkListToDisplay(json);
    // updateLoadingMessage(window.parkList);
  } catch (error) {
    console.log('ERROR: ', error);
  }
};

// Build button to display only parks that have been favorited
const favoritesFilter = document.createElement('button');
favoritesFilter.setAttribute('class', 'btn');
favoritesFilter.innerHTML = 'Show Favorites';
favoritesFilter.onclick = () => {
  updateLoadingMessage();
  getData('/api/parks/favorites');
}

// Build search form
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

searchForm.append(stateInput, submitButton, activityFilter);

// Build header wrapper and title elements
const headerBox = document.createElement('div');
headerBox.setAttribute('class', 'wrapper text-center');

const title = document.createElement('h1');
title.setAttribute('class', 'contrast-text')
title.innerHTML = 'Park Finder';

headerBox.append(title, searchForm, favoritesFilter);

// Build empty wrapper to hold dynamically generated park cards
const parkContent = document.createElement('div');
parkContent.setAttribute('id', 'park-content');
parkContent.setAttribute('class', 'wrapper grid');

const root = document.getElementById('root');

root.append(headerBox, parkContent);

// FUNCTIONS

// Request all favorites from cache on page load and store in global state


const getSelectedActivities = () => {
  const select = document.getElementById('activitySelect');
  return [...select.options].filter(option => option.selected).map(option => option.value);
}

const renderParkListToDisplay = async (list) => {
  const parksWindow = document.getElementById('park-content');
  // if existing park data exists, remove it
  while (parksWindow.firstChild) {
    parksWindow.removeChild(parksWindow.firstChild);
  }
  for (let park in list) {
    const activityList = await list[park].activities.map(item => item.name);
    console.log(activityList);
    if (activityList.includes(...getSelectedActivities()) || getSelectedActivities().length == 0) {
      // build cards
      const card = buildParkCard(list[park]);
      parksWindow.append(card);
    }
  }
}

const filterParksListByActivity = async (data) => {
  const parksWindow = document.getElementById('park-content');
  // create a card for each park in the returned data array
  for (let park in data) {
    // reduce activities to only list of string names, then check if list includes all filter activities
    const activityList = await data[park].activities.map(item => item.name);
    console.log(activityList);
    if (activityList.includes(...getSelectedActivities()) || getSelectedActivities().length == 0) {
      // build cards
      const card = buildParkCard(data[park]);
      parksWindow.append(card);
    }
  }
}

const buildParkCard = park => {

  const parkCard = document.createElement('div');
  parkCard.setAttribute('class', 'park-card text-center contrast-text');
  parkCard.style.backgroundImage = `url(${park.imageUrl})`;
  parkCard.id = park.fullName;

  // add favorites icon
  const favoriteBtn = document.createElement('p');
  favoriteBtn.setAttribute('class', 'white-icon');
  // add star based on favorite status
  favoriteBtn.innerHTML = park.favorite ? '★' : '☆';
  favoriteBtn.onclick = e => {
    e.preventDefault();
    if (e.target.innerHTML == '☆') {
      e.target.innerHTML = '★';
      // put request to update favorite status
      const parkName = e.target.parentNode.childNodes[1].innerHTML;
      const url = '/api/parks/favorites';

      const updateFavorite = async (url) => {
        try {
          const response = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'stateCode': window.stateInput,
              'fullName': `${parkName}`,
              'favorite': true
            })
          });
        } catch (error) {
          console.log(error);
        }
      };

      updateFavorite(url);

    } else {
      e.target.innerHTML = '☆';
      // put request to update favorite status
      const parkName = e.target.parentNode.childNodes[1].innerHTML;
      const url = '/api/parks/favorites';
      const updateFavorite = async (url) => {
        try {
          const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              'stateCode': window.stateInput,
              'fullName': `${parkName}`,
              'favorite': false,
              parkName, parkLocation, parkCost, parkPhone, parkEmail,
            })
          });
        } catch (error) {
          console.log(error);
        }
      }
      updateFavorite(url);
    };
  }

  // display name and location
  const parkName = document.createElement('h2');
  parkName.innerHTML = park.fullName;

  const parkLocation = document.createElement('p');
  parkLocation.innerHTML = (park.city + ', ' + park.stateCode);

  // display entrance fee
  // if entrance fee data exists, parse as int. else, set to 0.00
  let cost = park.entranceFee ? parseInt(park.entranceFee) : 0.00;
  // trim entrance fee data to 2 decimal places before appending to card
  const parkCost = document.createElement('p');
  parkCost.innerHTML = 'Entrance fee: $' + cost.toFixed(2);

  // display links to phone number and email address
  const parkPhone = document.createElement('a');
  parkPhone.setAttribute('href', 'tel:' + park.parkPhone);
  parkPhone.innerHTML = 'Phone: ' + park.parkPhone + '<br />';

  const parkEmail = document.createElement('a');
  parkEmail.setAttribute('href', 'mailto:' + park.parkEmail);
  parkEmail.innerHTML = 'Email: ' + park.parkEmail;

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
      });
      parkCard.setAttribute('class', 'park-card text-center contrast-text expanded');
      parkCard.append(activities);
    }
  };
  parkCard.append(favoriteBtn, parkName, parkLocation, parkCost, parkPhone, parkEmail, cornerArrow);
  return parkCard;
}

const updateLoadingMessage = (content) => {
  // build loading message
  let loadingMessage;
  if (!document.getElementById('loadingMessage')) {
    loadingMessage = document.createElement('p');
    loadingMessage.id = 'loadingMessage';
    loadingMessage.innerHTML = ('Loading parks data, please wait...');
    loadingMessage.setAttribute('class','text-center contrast-text');
  } else {
    loadingMessage = document.getElementById('loadingMessage');
  }

  const parksWindow = document.getElementById('park-content');
  // if existing park data exists, remove it
  while (parksWindow.firstChild) {
    parksWindow.removeChild(parksWindow.firstChild);
  }

  parksWindow.appendChild(loadingMessage);
}

// const requestParksData = (stateCode) => {
//   // add loading message
//   updateLoadingMessage();
//   // build get request with state and filter data
//   getData(`/api/parks/${stateCode}`);
// }

const handleSubmit = event => {
  event.preventDefault();
  const formValue = document.getElementById('state-input').value;
  window.stateInput = formValue;
  updateLoadingMessage();
  getData(`/api/parks/${formValue}`);
}
