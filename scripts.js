const API_KEY = 'G8KJyLByWoBhHwtTA31DXAdr63B1bosc';
const IP_ADDRESS = '27.73.88.180';

const getLocationKey = async function(search){
    const url = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${API_KEY}&q=${search}`
    const response = await fetch(url);
    return response.json();
}

const getFiveDailyForecasts = async function(location_key){
    const url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${location_key}?apikey=${API_KEY}&details=true`
    const response = await fetch(url)
    return response.json();
}

const generateUrl = (index) => {
    let url = "https://developer.accuweather.com/sites/default/files/01-s.png";
    if (+index < 10) url = `https://developer.accuweather.com/sites/default/files/0${index}-s.png`;
    if (+index >= 10) url = `https://developer.accuweather.com/sites/default/files/${index}-s.png`;
    return url;
}

const convertToCelsius = (min, max) => {
    let average = (min + max) / 2;
    if(max===0) average= min;
    return Math.round((average - 32)/1.8 , 0);
}

const convertToFah = (min, max) => {
    let average = (min + max) / 2;
    if(max===0) average = min;
    return Math.round((average * 1.8) + 32 , 0);

}


const convertDayName = (data) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(data);
    const dayName = days[d.getDay()];
    return dayName;
}

const convertMonthName = date => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date(date);
  return monthNames[d.getMonth()];
}
function app(search = "Hanoi") {
        getLocationKey(search).then(location=>{
            const cityData = location[0].LocalizedName;
            const countryData = location[0].Country.LocalizedName;
            const locationKey = location[0].Key;
            const locationText = document.querySelector('.location-text');
            locationText.textContent =`${cityData}, ${countryData}`
            getFiveDailyForecasts(locationKey).then(item=>{
                const forecastList = document.querySelector('.forecast-list');
                forecastList.innerHTML = "";
                for(let i=0;i<item.DailyForecasts.length;i++) {
                    const forecastItem = item.DailyForecasts[i];
                    if(i===0) {
                        const progressHumidity = document.querySelector('.progress-humidity');
                        progressHumidity.setAttribute('style', `width: ${forecastItem?.Day?.RainProbability}%`);
                        const progressSnow = document.querySelector('.progress-snow');
                        progressSnow.setAttribute('style', `width: ${forecastItem?.Day?.SnowProbability}%`);
                        const progressWind = document.querySelector('.progress-wind');
                        progressWind.setAttribute('style', `width: ${Math.round(forecastItem?.Day?.Wind?.Speed?.Value, 0)}%`);
                        const description = document.querySelector('.description-detail');
                        description.textContent = forecastItem?.Day?.LongPhrase;
                    }
                    const divElement = document.createElement('div');
                    divElement.classList.add('col-3');
                    divElement.classList.add('mb-3');
                    divElement.innerHTML = `
                    <div class="card third-bg-color">
                                    <h5 class="card-title text-center pt-2">${convertDayName(forecastItem?.Date)}</h5>
                                    <div class="text-center">
                                        <img src="${generateUrl(+forecastItem?.Day?.Icon)}" class="card-img-top mdIcon" alt="...">
                                    </div>
                                    <div class="card-body d-flex align-items-center justify-content-center">
                                        <span id="celsius" class="card-text temperature-item font-weight-bold lg-text mr-2">${convertToCelsius(+forecastItem?.Temperature?.Maximum?.Value, +forecastItem?.Temperature?.Minimum?.Value)}</span>
                                        <img src="./images/celsius.png" alt="" class="smallIcon">
                                    </div>
                    `
                    forecastList.appendChild(divElement);
                }
            })
        })
}

app();

const celsiusTab = document.querySelector('.celsius-tab');
const fahTab = document.querySelector('.fah-tab');

if (celsiusTab) {
    celsiusTab.addEventListener('click', () => {

        const temperatureList = document.querySelectorAll('.temperature-item');
        for(let i=0;i<temperatureList.length;i++) {
            if(temperatureList[i].getAttribute('id') !== 'celsius') {
                const value = convertToCelsius(+temperatureList[i].textContent, 0);
                temperatureList[i].textContent = value;
                fahTab.classList.remove('tab-active');
                celsiusTab.classList.add('tab-active')
                temperatureList[i].setAttribute('id', 'celsius');
            }
        }
    })
}
if (fahTab) {
    fahTab.addEventListener('click', () => {
        const temperatureList = document.querySelectorAll('.temperature-item');
        for(let i=0;i<temperatureList.length;i++) {
            if(temperatureList[i].getAttribute('id') !== 'fah') {
                const value = convertToFah(+temperatureList[i].textContent, 0);
                temperatureList[i].textContent = value;
                celsiusTab.classList.remove('tab-active');
                fahTab.classList.add('tab-active')
                temperatureList[i].setAttribute('id', 'fah');
            }
        }
    })
}

const searchBtn = document.querySelector('.btn-search');
if(searchBtn) {
    searchBtn.addEventListener('click', () => {
        const inputSearch =  document.querySelector('.input-search');
        const searchValue = inputSearch.value.trim();
        inputSearch.value = "";
        app(searchValue);
    })
}
