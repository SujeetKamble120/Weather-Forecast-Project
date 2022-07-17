const API_KEY = config.OPEN_WEATHER_KEY;
const API_KEY_CITY = config.ACCUWEATHER_KEY;
const search = document.querySelector(".search");
const suggestions = document.querySelector(".suggestions");
const searchBar = document.querySelector(".search-bar");
const swiperWrapper = document.querySelectorAll(".swiper-wrapper");
const mapGlobal = document.getElementById("map");
const mapButton = document.querySelector(".map-button");
const backButton = document.querySelector(".back-button");
const windSpeed = document.querySelector(".wind-speed");
const ardrata = document.querySelectorAll(".humidity");
const dabaav = document.querySelector(".pressure");
const rainChance = document.querySelector(".rain-chance");
const feelsLike = document.querySelector(".feels-like");
const sun_set = document.querySelector(".sunset");
let preload = document.querySelector(".preload");
const tempFlex = document.querySelector(".temp-flex");
const errorPopup = document.querySelector(".error-popup");
const LATITUDE = 19.076;
const LONGITUDE = 72.8777;
// var clientHeight = document.querySelector(".display").clientHeight;
// document
//   .getElementById("map")
//   .setAttribute("style", `height:${clientHeight}px`);

mapButton.addEventListener("click", (e) => {
  backButton.classList.add("increase-z-index-button");
  mapGlobal.classList.add("display-map");
});

backButton.addEventListener("click", (e) => {
  mapGlobal.classList.remove("display-map");
  backButton.classList.remove("increase-z-index-button");
});

function generateMap(lat, lon) {
  let map = L.map("map", { zoomControl: false }).setView([lat, lon], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);
  let marker = L.marker([lat, lon]).addTo(map);

  function onMapClick(e) {
    if (marker !== null) {
      map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
    // console.log(e.latlng.lat);
    setTimeout(() => {
      backButton.classList.remove("increase-z-index-button");
      preload.classList.remove("preload-finish");
      let lon = e.latlng.lng;
      while (lon < -180) {
        lon += 360;
      }
      while (lon > 180) {
        lon -= 360;
      }
      fetchData(e.latlng.lat, lon);
      mapGlobal.classList.remove("display-map");
    }, 500);
  }
  map.on("click", onMapClick);
}

function drawTempGraph(tempArr) {
  let chartStatus = Chart.getChart("line_chart");
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
  Chart.defaults.font.size = 14;
  Chart.defaults.font.weight = 600;
  const ctx = document.getElementById("line_chart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Morning", "Afternoon", "Evening", "Night"],
      datasets: [
        {
          label: "Temperature",
          data: tempArr,
          lineTension: 0.4,
          radius: 6,
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            drawBorder: false,
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

async function getCity(latitude, longitude) {
  let url =
    "http://api.openweathermap.org/geo/1.0/reverse?lat=" +
    latitude +
    "&lon=" +
    longitude +
    "&limit=5&appid=" +
    API_KEY;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function extractLatLon(cityData) {
  let latitude = cityData[0].lat;
  let longitude = cityData[0].lon;
  fetch(
    "https://api.openweathermap.org/data/3.0/onecall?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&units=metric&exclude=minutely&appid=" +
      API_KEY
  )
    .then((res) => res.json())
    .then((data) => putWeatherData(data))
    .catch((err) => console.log(err));
}

async function searchCities(searchText) {
  url =
    "http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=" +
    API_KEY_CITY +
    "&q=" +
    searchText;
  if (searchText.length !== 0) {
    var citiesArr = [];
    search.classList.add("bottom-right-zero-br");
    searchBar.classList.add("bottom-left-zero-br");
    try {
      const res = await fetch(url);
      let cities = await res.json();
      suggestions.innerHTML = ``;
      suggestions.style.opacity = 0;
      for (let i = 0; i < cities.length; i++) {
        citiesArr.push(
          cities[i].LocalizedName +
            ", " +
            cities[i].AdministrativeArea.LocalizedName +
            ", " +
            cities[i].Country.LocalizedName +
            "| " +
            cities[i].Country.ID
        );
      }
      uniq = [...new Set(citiesArr)];
      showList(uniq);
    } catch (e) {
      showList(citiesArr);
    }
  } else {
    search.classList.remove("bottom-right-zero-br");
    searchBar.classList.remove("bottom-left-zero-br");
    suggestions.innerHTML = ``;
    suggestions.style.opacity = 0;
  }
}

function showList(cities) {
  if (cities.length > 0) {
    let countryCodes = [];
    let len = cities.length;
    for (let i = 0; i < len; i++) {
      let val = cities[i].substring(0, cities[i].indexOf("|"));
      countryCodes.push(cities[i].split("|")[1]);
      let autoComplete = document.createElement("li");
      autoComplete.setAttribute("class", "auto-complete");
      autoComplete.innerHTML = `${val}`;
      suggestions.appendChild(autoComplete);
    }
    const autoComplete = document.querySelectorAll(".auto-complete");
    len = autoComplete.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        autoComplete[i].addEventListener("click", (event) => {
          preload.classList.remove("preload-finish");
          search.classList.remove("bottom-right-zero-br");
          searchBar.classList.remove("bottom-left-zero-br");
          suggestions.innerHTML = ``;
          suggestions.style.opacity = 0;
          let innerHtml = event.path[0].innerHTML;
          let city = innerHtml.substring(0, innerHtml.indexOf(","));
          let countryCode = countryCodes[i];
          document.querySelector(".city-name").innerHTML = city;
          let url =
            "http://api.openweathermap.org/geo/1.0/direct?q=" +
            city +
            "," +
            countryCode +
            "&limit=5&appid=" +
            API_KEY;
          fetch(url)
            .then((res) => res.json())
            .then((data) => extractLatLon(data))
            .catch((err) => console.log(err));
        });
      }
    }
    suggestions.style.opacity = 1;
  }
}

search.addEventListener("input", () => searchCities(search.value));

const buttons = document.querySelectorAll("[data-slide-button]");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const offset = button.dataset.slideButton === "next" ? 1 : -1;
    const slides = button
      .closest("[data-carousel]")
      .querySelector("[data-slides]");

    const activeSlide = slides.querySelector("[data-active]");
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;
    if (newIndex < 0) newIndex = slides.children.length - 1;
    if (newIndex >= slides.children.length) newIndex = 0;
    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;
  });
});

const swipers = document.querySelectorAll(".swiper-temporary");
const prevButtons = document.querySelectorAll(".temporary-next");
const nextButtons = document.querySelectorAll(".temporary-prev");

var swiperLen = swipers.length;
console.log("SwiperLen:", swiperLen);

for (let i = 0; i < swiperLen; i++) {
  swipers[i].classList.add("swiperk" + (i + 1));
  prevButtons[i].classList.add("swiper-button-prev" + (i + 1));
  nextButtons[i].classList.add("swiper-button-next" + (i + 1));
  new Swiper(".swiperk" + (i + 1), {
    slidesPerView: 3,
    spaceBetween: 20,
    slidesPerGroup: 3,
    //   centeredSlides: true,
    initialSlide: 1,
    loop: false,
    loopFillGroupWithBlank: false,

    // If we need pagination
    //   pagination: {
    //     el: ".swiper-pagination",
    //     clickable: true,
    //   },

    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next" + (i + 1),
      prevEl: ".swiper-button-prev" + (i + 1),
    },
  });
}

function format_time(s) {
  try {
    const dtFormat = new Intl.DateTimeFormat("en-US", {
      timeStyle: "medium",
      timeZone: "UTC",
    });
    let txt = dtFormat.format(new Date(s * 1e3));
    let withoutampm = txt.slice(0, -6);
    let ampm = txt.substring(txt.length - 2);
    return withoutampm + " " + ampm;
  } catch (e) {
    return "None";
  }
}

function format_date(utcTime) {
  const date = new Date(utcTime * 1000);
  let currDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(date);
  let week = currDate.substring(0, currDate.indexOf(",")).substring(0, 3);
  let withoutYear = currDate.slice(0, -4);
  let finalDate = withoutYear.substring(withoutYear.indexOf(",")).substring(2);
  let finalMonth = finalDate
    .substring(finalDate.indexOf(" "))
    .substring(1)
    .slice(0, -1);
  finalMonth = finalMonth.substring(0, 3);
  finalMonth = finalDate.slice(0, 2) + " " + finalMonth;
  return week + ", " + finalMonth;
}

function decodeHtml(html) {
  let txt = document.createElement("textarea");
  txt.innerHTML = html;

  return txt.value;
}

function returnInnerHtml(
  hourlyArr,
  i,
  description,
  weatherProperty,
  unit,
  offset,
  isWeekly,
  dailyArr
) {
  let hourlyOrDaily = [];
  let classNames = "";
  let tempVal = "";
  if (!isWeekly) {
    hourlyOrDaily = hourlyArr;
    classNames = "curr-time";
  } else {
    hourlyOrDaily = dailyArr;
    classNames = "curr-time daily-value";
  }
  if (isWeekly && weatherProperty === "temp") {
    tempVal = hourlyOrDaily[i][weatherProperty].day;
  } else tempVal = hourlyOrDaily[i][weatherProperty];
  return `<p class="${classNames}">${
    !isWeekly
      ? format_time(hourlyOrDaily[i].dt + offset)
      : format_date(hourlyOrDaily[i].dt + offset)
  }</p>
    <div class="middle">
      <img src="http://openweathermap.org/img/wn/${
        hourlyOrDaily[i].weather[0].icon
      }@2x.png" 
      class="temp-card-icon"
      />
    </div>
    <p class="value">${Math.floor(
      weatherProperty === "pop"
        ? hourlyOrDaily[i][weatherProperty] * 100
        : tempVal
    )} ${unit}</p>
    <div class="swiper-slide-overlay">
      <div class="description">${description}</div>
    </div>`;
}

function updateNodes(
  hourlyArr,
  weatherPropertyId,
  weatherProperty,
  entity,
  offset,
  dailyArr,
  isWeekly
) {
  let weatherPropertySlider = document.getElementById(weatherPropertyId);
  let unit = decodeHtml(entity);
  let i = 1;
  for (
    var child = weatherPropertySlider.firstChild;
    child !== null;
    child = child.nextSibling
  ) {
    let description = hourlyArr[i].weather[0].description;
    child.innerHTML = returnInnerHtml(
      hourlyArr,
      i,
      description,
      weatherProperty,
      unit,
      offset,
      isWeekly,
      dailyArr
    );
    i++;
  }
}

function createNodes(
  hourlyArr,
  weatherPropertyId,
  weatherProperty,
  entity,
  offset,
  dailyArr,
  isWeekly
) {
  let len = isWeekly ? dailyArr.length : hourlyArr.length / 2;
  let unit = decodeHtml(entity);
  for (let i = 1; i < len; i++) {
    let description = hourlyArr[i].weather[0].description;
    let weatherPropertySlider = document.getElementById(weatherPropertyId);
    let dynamicSwiperSlide = document.createElement("div");
    dynamicSwiperSlide.setAttribute("class", "swiper-slide");
    dynamicSwiperSlide.innerHTML = returnInnerHtml(
      hourlyArr,
      i,
      description,
      weatherProperty,
      unit,
      offset,
      isWeekly,
      dailyArr
    );
    weatherPropertySlider.appendChild(dynamicSwiperSlide);
  }
}

function removeOtherClasses(infoCard, except) {
  let classArr = infoCard.classList;
  let len = classArr.length;
  for (let i = 0; i < len; i++) {
    if (classArr[i] !== except && classArr[i] !== "info-card")
      infoCard.classList.remove(classArr[i]);
  }
  infoCard.classList.add(except);
}

function displayBackgroundImg(icon) {
  icon = icon.slice(0, -1);
  icon = icon + "d";
  const infoCard = document.querySelector(".info-card");
  switch (icon) {
    case "01d":
      removeOtherClasses(infoCard, "clear-sky");
      break;
    case "02d":
      removeOtherClasses(infoCard, "few-clouds");
      break;
    case "03d":
      removeOtherClasses(infoCard, "scattered-clouds");
      break;
    case "04d":
      removeOtherClasses(infoCard, "broken-clouds");
      break;
    case "09d":
      removeOtherClasses(infoCard, "shower-rain");
      break;
    case "10d":
      removeOtherClasses(infoCard, "shower-rain");
      break;
    case "11d":
      removeOtherClasses(infoCard, "thunderstorm");
      break;
    case "13d":
      removeOtherClasses(infoCard, "snow-fall");
      break;
    case "50d":
      removeOtherClasses(infoCard, "mist-and-fog");
      break;
    default:
      infoCard.classList.add(infoCard, "clear-sky");
      break;
  }
}

function success(position) {
  const longitude = position.coords.longitude;
  const latitude = position.coords.latitude;
  generateMap(latitude, longitude);
  fetchData(latitude, longitude);
}

function fetchData(latitude, longitude) {
  getCity(latitude, longitude)
    .then((data) => {
      if (data.length === 0) {
        document.querySelector(".city-name").innerHTML = `<p>Lat:${
          Math.round(latitude * 100) / 100
        }</p>
        <p>Lon:${Math.round(longitude * 100) / 100}</p>`;
      } else {
        let { name } = data[0];
        document.querySelector(".city-name").innerHTML = name;
      }
    })
    .catch((err) => console.log(err));
  fetch(
    "https://api.openweathermap.org/data/3.0/onecall?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&units=metric&exclude=minutely&appid=" +
      API_KEY
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("Data after reverse Geocoding:");
      console.log(data);
      putWeatherData(data);
    })
    .catch((err) => console.log(err));
}

function putWeatherData(data) {
  let { temp, feels_like, wind_speed, humidity, pressure, sunset } =
    data.current;
  let { pop } = data.hourly[0];
  let { description } = data.current.weather[0];
  let { morn, day, eve, night } = data.daily[0].temp;
  const offset = data.timezone_offset;
  tempFlex.innerHTML = `<p class="temperature-value">${Math.floor(
    temp
  )}&deg;</p>
  <p class="weather-status">${description}</p>`;

  const strTime = format_time(sunset + offset) + " PM";
  sun_set.innerHTML = strTime.slice(0, -3);
  windSpeed.innerHTML = wind_speed + " m/s";
  ardrata[0].innerHTML = humidity + "%";
  ardrata[1].innerHTML = humidity + "%";
  dabaav.innerHTML = pressure + " hpa";
  rainChance.innerHTML = Math.floor(pop * 100) + " %";
  feelsLike.innerHTML = `${Math.floor(feels_like)} &deg;`;
  document.querySelector(".time").innerHTML = format_time(
    data.current.dt + offset
  );
  document.querySelector(".date").innerHTML = format_date(
    data.current.dt + offset
  );
  var tempArr = [
    Math.floor(morn),
    Math.floor(day),
    Math.floor(eve),
    Math.floor(night),
  ];
  drawTempGraph(tempArr);
  const icon = data.current.weather[0].icon;
  displayBackgroundImg(icon);
  const hourlyArr = data.hourly;
  const dailyArr = data.daily;
  let len = hourlyArr.length / 2;

  if (swiperWrapper[0].children.length === 0) {
    createNodes(
      hourlyArr,
      "temperature-slider",
      "temp",
      "&deg;",
      offset,
      dailyArr,
      false
    );
    createNodes(
      hourlyArr,
      "humidity-slider",
      "humidity",
      "&percnt;",
      offset,
      dailyArr,
      false
    );
    createNodes(
      hourlyArr,
      "rainChance-slider",
      "pop",
      "&percnt;",
      offset,
      dailyArr,
      false
    );
    createNodes(
      hourlyArr,
      "temperature-slider-weekly",
      "temp",
      "&deg;",
      offset,
      dailyArr,
      true
    );
    createNodes(
      hourlyArr,
      "humidity-slider-weekly",
      "humidity",
      "&percnt;",
      offset,
      dailyArr,
      true
    );
    createNodes(
      hourlyArr,
      "rainChance-slider-weekly",
      "pop",
      "&percnt;",
      offset,
      dailyArr,
      true
    );
  } else {
    updateNodes(
      hourlyArr,
      "temperature-slider",
      "temp",
      "&deg;",
      offset,
      dailyArr,
      false
    );
    updateNodes(
      hourlyArr,
      "humidity-slider",
      "humidity",
      "&percnt;",
      offset,
      dailyArr,
      false
    );
    updateNodes(
      hourlyArr,
      "rainChance-slider",
      "humidity",
      "&percnt;",
      offset,
      dailyArr,
      false
    );
    updateNodes(
      hourlyArr,
      "temperature-slider-weekly",
      "temp",
      "&deg;",
      offset,
      dailyArr,
      true
    );
    updateNodes(
      hourlyArr,
      "humidity-slider-weekly",
      "humidity",
      "&percnt;",
      offset,
      dailyArr,
      true
    );
    updateNodes(
      hourlyArr,
      "rainChance-slider-weekly",
      "pop",
      "&percnt;",
      offset,
      dailyArr,
      true
    );
  }

  preload.classList.add("preload-finish");
}

function error(err) {
  console.log(err);
}

navigator.geolocation.getCurrentPosition(success, error);
