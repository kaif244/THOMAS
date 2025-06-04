const API_KEY = "c024e61768fde1b26aa10ed633a43c51";
let units = "metric"; // default

window.onload = () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("locationInput").value = lastCity;
    getWeather();
  }
};

function toggleUnits() {
  units = document.getElementById("unitToggle").checked ? "imperial" : "metric";
  getWeather();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

async function getWeather() {
  const location = document.getElementById("locationInput").value.trim();
  const weatherDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecastResult");

  if (!location) {
    weatherDiv.innerHTML = "❗ Please enter a city name.";
    return;
  }

  localStorage.setItem("lastCity", location);

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=${units}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=${units}`;

  try {
    const currentRes = await fetch(currentUrl);
    const current = await currentRes.json();

    const icon = current.weather[0].icon;
    const temp = current.main.temp;
    const condition = current.weather[0].description;

    weatherDiv.innerHTML = `
      <h2>📍 ${current.name}, ${current.sys.country}</h2>
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png"/>
      <p><strong>${temp}° ${units === 'metric' ? 'C' : 'F'}</strong> - ${condition}</p>
    `;

    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    let dailyForecast = forecastData.list.filter((item, index) => item.dt_txt.includes("12:00:00")).slice(0, 3);

    forecastDiv.innerHTML = "<h3>📅 3-Day Forecast:</h3>";
    dailyForecast.forEach(day => {
      const date = new Date(day.dt_txt).toDateString();
      forecastDiv.innerHTML += `
        <div>
          <strong>${date}</strong><br/>
          <img class="weather-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"/>
          <p>${day.main.temp}° ${units === 'metric' ? 'C' : 'F'} - ${day.weather[0].description}</p>
        </div>
      `;
    });
  } catch (err) {
    weatherDiv.innerHTML = "⚠️ Error loading weather data.";
    forecastDiv.innerHTML = "";
  }
}

function useGeolocation() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;

    const response = await fetch(currentUrl);
    const data = await response.json();

    document.getElementById("locationInput").value = data.name;
    getWeather();
  }, () => {
    alert("Geolocation failed.");
  });
}

document.getElementById("micBtn").addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("locationInput").value = transcript;
    getWeather();
  };
});
