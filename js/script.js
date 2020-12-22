$(document).ready(function () {
    const searchForm = $("#searchForm");

    // ***************** ON PAGE LOAD

    // Display history onto the DOM
    var history = JSON.parse(localStorage.getItem("history"));
    if (history === null) {
        history = [];
    }
    for (let i = 0; i < history.length; i++) {
        let newBtn = $("<button>");
        newBtn.text(history[i].weather.name);
        newBtn.addClass("historyBtn");
        $(newBtn).appendTo("#history");
    }

    //display Last Searched Location
    var currentLocation = JSON.parse(localStorage.getItem("currentLocation"));
    if (currentLocation === null) {
        currentLocation = [];
    }
    if (currentLocation.length > 0) {
        var mainCard = $("#main-card");

        // uv index rating
        var uvIndex = currentLocation[0].uv.value;
        var uvIndexColor = "green";
        if (uvIndex > 2 && uvIndex < 8) {
            uvIndexColor = "orange";
        } else if (uvIndex >= 8) {
            uvIndexColor = "red";
        }
        $(mainCard).html(
            `
            <h1>${currentLocation[0].weather.name}</h1>
            <p><strong>Temperature:</strong> ${currentLocation[0].weather.main.temp}</p>
            <p><strong>Humidity:</strong> ${currentLocation[0].weather.main.humidity}</p>
            <p><strong>Wind Speed:</strong> ${currentLocation[0].weather.wind.speed}</p>
            <p><strong>UV Index:</strong> <span class="uvIndex ${uvIndexColor}">${currentLocation[0].uv.value}</span></p>
            
            `
        );
        // 5 day forecast
        for (let i = 0; i < 5; i++) {
            var miniCard = $("<div>");
            miniCard.addClass("miniCard");

            var iconUrl = `http://openweathermap.org/img/w/${currentLocation[0].forecast.list[i].weather[0].icon}.png`;

            var dateRaw = currentLocation[0].forecast.list[i].dt_txt.split("-");
            var year = dateRaw[0];
            var month = dateRaw[1];
            var day = dateRaw[2].split(" ");
            var day = day[0];
            var date = `${day}/${month}/${year}`;

            $(miniCard).html(
                `
                <h4>${date}</h4>
                <img src="${iconUrl}" alt="weatherIcon"></img>
                <p>Temp: ${currentLocation[0].forecast.list[i].main.temp}</p>
                <p>Humidity: ${currentLocation[0].forecast.list[i].main.humidity}</p>
                `
            );
            miniCard.appendTo("#miniCardLoc");
        }
    }

    // ******************* ON EVENT

    // get data from search form
    searchForm.on("submit", function (e) {
        e.preventDefault();
        searchLoc = $("#searchLoc").val();

        getWeatherInfo(searchLoc);
    });

    $(".historyBtn").click(function () {
        var loc = $(this).text();
        getWeatherInfo(loc);
    });

    // ******************* FUNCTIONS

    // call weather db
    async function getWeatherInfo(location) {
        openWeatherKey = "2ad06e62443437293b602122d47eafe8";

        var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherKey}`;
        console.log(weatherURL);

        const weatherInfo = await $.ajax({
            url: weatherURL,
            method: "GET",
        });

        var lat = weatherInfo.coord.lat;
        var lon = weatherInfo.coord.lon;

        var uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${openWeatherKey}`;

        const uvInfo = await $.ajax({
            url: uvQueryURL,
            method: "GET",
        });

        var forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&cnt=5&appid=${openWeatherKey}`;

        const forecastInfo = await $.ajax({
            url: forecastQueryURL,
            method: "GET",
        });

        console.log(forecastInfo);
        console.log(forecastQueryURL);

        var data = {
            weather: weatherInfo,
            uv: uvInfo,
            forecast: forecastInfo,
        };

        storeInfoToLocal(data);
    }

    function storeInfoToLocal(info) {
        // look through history for city
        var currentCity = info.weather.name;
        cityExists = false;
        for (let i = 0; i < history.length; i++) {
            var tempCity = history[i].weather.name;
            if (currentCity === tempCity) {
                cityExists = true;
                break;
            }
        }

        if (cityExists === false) {
            history.push(info);
            localStorage.setItem("history", JSON.stringify(history));
        }

        currentLocation = [info];
        localStorage.setItem(
            "currentLocation",
            JSON.stringify(currentLocation)
        );
        location.reload();
    }
});
