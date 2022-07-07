const API_KEY = "c2a90ddded8dd1a4defccdcea57f0f12";
const API_KEY_CITY = "	8Y9vv9zMEEzY8kTE8xnlQIsIJCkiXbHp";
var myName = "sujeet";

function drawTempGraph(tempArr) {
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

const buttons = document.querySelectorAll("[data-slide-button]");

console.log(buttons);

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

for (let i = 0; i < swiperLen; i++) {
  swipers[i].classList.add("swiper" + (i + 1));
  prevButtons[i].classList.add("swiper-button-prev" + (i + 1));
  nextButtons[i].classList.add("swiper-button-next" + (i + 1));
  new Swiper(".swiper" + (i + 1), {
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

function success(position) {
  const longitude = position.coords.longitude;
  const latitude = position.coords.latitude;
  async function getCity(lonLat) {
    const base =
      "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" +
      API_KEY_CITY;
    const query = "&q=" + lonLat;
    const response = await fetch(base + query);
    const data = await response.json();
    return data;
  }
  getCity(latitude + "," + longitude)
    .then((data) => {
      let { EnglishName } = data;
      document.querySelector(".city-name").innerHTML = EnglishName;
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
    .then((data) => putWeatherData(data));
}

function putWeatherData(data) {
  let { temp, feels_like, wind_speed, humidity, pressure, sunset } =
    data.current;
  let { pop } = data.hourly[0];
  let { description } = data.current.weather[0];
  let { morn, day, eve, night } = data.daily[0].temp;
  const tempFlex = document.querySelector(".temp-flex");
  tempFlex.innerHTML = `<p class="temperature-value">${Math.floor(
    temp
  )}&deg;</p>
  <p class="weather-status">${description}</p>`;
  const windSpeed = document.querySelector(".wind-speed");
  const ardrata = document.querySelectorAll(".humidity");
  const dabaav = document.querySelector(".pressure");
  const rainChance = document.querySelector(".rain-chance");
  const feelsLike = document.querySelector(".feels-like");

  // Converting sunset utc to 12 hr
  const sun_set = document.querySelector(".sunset");
  const sunsetDate = new Date(sunset * 1000);
  var hours = sunsetDate.getHours();
  var minutes = sunsetDate.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  sun_set.innerHTML = strTime;

  windSpeed.innerHTML = wind_speed + " km/h";
  ardrata[0].innerHTML = humidity + "%";
  ardrata[1].innerHTML = humidity + "%";
  dabaav.innerHTML = pressure + " hpa";
  rainChance.innerHTML = Math.floor(pop * 100) + " %";
  feelsLike.innerHTML = `${Math.floor(feels_like)} &deg;`;

  var tempArr = [
    Math.floor(morn),
    Math.floor(day),
    Math.floor(eve),
    Math.floor(night),
  ];
  drawTempGraph(tempArr);
}

console.log(myName);

function error(err) {
  console.log(err);
}

navigator.geolocation.getCurrentPosition(success, error);
