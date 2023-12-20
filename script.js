const fetchProhibitedWords = async () => {
  try {
    const response = await fetch("prohibitedWords.json"); // Update the path accordingly
    const data = await response.json();
    return data.prohibitedWords;
  } catch (error) {
    console.error("Error fetching prohibited words:", error);
    return [];
  }
};

//input.addEventListener('input', function () {
input.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("submitbtnid").click();
  }
});

async function sendchat() {
  const prohibitedWords = await fetchProhibitedWords();
  const value = input.value.toLowerCase();
  let topic = "";

  const faqs = {
    "what's your name": "My name is Forge AI.",
    "what is your name": "My name is Forge AI.",
    "who created you": "I was created by SupremeWyn.",
    "what do you do":
      "I can answer questions and search for information on the web!",
    "how old are you":
      "I don't really have an age, since I'm just a computer program!",
    "are you a male":
      "I don't have a gender, since I'm just a computer program!",
    "are you a female":
      "I don't have a gender, since I'm just a computer program!",
    "do you have a gender":
      "I don't have a gender, since I'm just a computer program!",
  };

  if (value in faqs) {
    chat.textContent = faqs[value];
    return;
  }

  const lowercasedValue = value.toLowerCase();
  if (prohibitedWords.some((word) => lowercasedValue.includes(word))) {
    chat.textContent =
      "Sorry, I can't answer questions that violate our policy.";
    return;
  }

  // check for greetings
  if (
    value.startsWith("hi") ||
    value.startsWith("hello") ||
    value.startsWith("hey")
  ) {
    chat.textContent = "Hi there!";
    return;
  }

  if (value.includes("factor")) {
    const expressionToFactor = value.slice("factor ".length);
    processAlgebraicExpression(expressionToFactor, "factor");
    return;
  }

  if (value.includes("solve")) {
    const equationToSolve = value.slice("solve ".length);
    processAlgebraicExpression(equationToSolve, "solve");
    return;
  }

  function processAlgebraicExpression(expression, type) {
    const appId = "KAP79G-T5QG9P5J74";
    const encodedExpression = encodeURIComponent(expression);
    let apiUrl;

    if (type === "factor") {
      apiUrl = `https://cors-anywhere.herokuapp.com/https://api.wolframalpha.com/v2/result?i=factor+quadratic+${encodedExpression}%3F&appid=${appId}`;
    } else if (type === "solve") {
      apiUrl = `https://cors-anywhere.herokuapp.com/https://api.wolframalpha.com/v2/result?input=solve(${encodedExpression})&format=plaintext&output=JSON&appid=${appId}`;
    } else {
      return;
    }

    fetch(apiUrl)
      .then((response) => response.text())
      .then((data) => {
        // Extract the result from the Wolfram|Alpha API response
        let result =
          data.trim() ||
          `Unable to ${type === "factor" ? "factorize" : "solve"}`;

        // Format the result if it contains a fraction
        if (result.includes("/")) {
          const fractionParts = result.split("/");
          result = `x = ${fractionParts[0].trim()} / ${fractionParts[1].trim()}`;
        }

        chat.textContent = result;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent = `Error fetching ${
          type === "factor" ? "factorization" : "solution"
        }`;
      });
  }

  if (
    value.includes("*") ||
    value.includes("+") ||
    value.includes("-") ||
    value.includes("/")
  ) {
    const result = eval(value); // evaluate the expression using eval()
    chat.textContent = result.toString(); // display the result
    return;
  }

  if (
    value.includes("what is ") ||
    value.includes("whats ") ||
    value.includes("what's ") ||
    value.includes("whats the definition of") ||
    value.includes("explain ") ||
    value.includes("tell me about ")
  ) {
    // Extract the topic from the input
    const startIndex = Math.max(
      value.indexOf("what is "),
      value.indexOf("whats "),
      value.indexOf("what's "),
      value.indexOf("whats the definition of"),
      value.indexOf("explain "),
      value.indexOf("tell me about "),
    );
    topic = value
      .slice(startIndex)
      .replace(
        /(what is |whats |what's |whats the definition of |explain |tell me about )/i,
        "",
      );
  } else if (value.startsWith("who is ")) {
    topic = value.slice("who is ".length);
  } else if (value.startsWith("who's ")) {
    topic = value.slice("who's ".length);
  } else if (value.startsWith("whos ")) {
    topic = value.slice("whos ".length);
  } else if (value.startsWith("what's the definition of ")) {
    topic = value.slice("what's the definition of ".length);
  }

  // check for weather inquiry
  if (value.startsWith("temperature in ")) {
    const city = value.slice("remperature in ".length);
    // fetch weather information from OpenWeatherMap API
    // Fetch weather information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // extract the temperature from the weather API response
        const temperature = Math.round(data.main.temp); // Round the temperature

        // update the chat element with the weather information
        chat.innerHTML = `The current temperature in ${city} is ${temperature}&deg;C.`;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent = "Sorry, I couldn't fetch the weather information.";
      });
  }

  //weather forecast
  if (
    value.startsWith("weather forecast in ") ||
    value.startsWith("What's the weather forecast in ") ||
    value.startsWith("What is the weather forecast in ")
  ) {
    const city = value.slice("weather forecast in ".length);
    // fetch weather forecast information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // extract relevant forecast information from the weather API response
        const forecasts = data.list;

        // Display the forecast information for the next few hours
        let forecastText = `Weather forecast for ${city}:\n`;
        forecasts.slice(0, 5).forEach((forecast) => {
          const dateTime = forecast.dt_txt;
          const temperature = forecast.main.temp;
          const weatherDescription = forecast.weather[0].description;

          forecastText += `${dateTime}: ${temperature}°C with ${weatherDescription}\n`;
        });

        // update the chat element with the weather forecast information
        chat.textContent = forecastText;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent =
          "Sorry, I couldn't fetch the weather forecast information.";
      });
  }

  if (value.startsWith("weather in ")) {
    const city = value.slice("weather in ".length);

    // Fetch weather information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Extract relevant weather information
        const weatherDescription = data.weather[0].description;

        // Update the chat element with the weather information
        chat.textContent = `Current weather in ${city}: ${weatherDescription}`;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent = "Sorry, I couldn't fetch the weather information.";
      });

    return;
  }

  if (value.startsWith("wind in ")) {
    const city = value.slice("wind in ".length);

    // Fetch wind information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Extract relevant weather information
        const windDescription = data.wind.speed;

        // Update the chat element with the weather information
        chat.textContent = `Current wind speed in ${city}: ${windDescription} m/s`;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent =
          "Sorry, I couldn't fetch the wind speed information.";
      });

    return;
  }

  if (value.startsWith("wind speed in ")) {
    const city = value.slice("wind speed in ".length);

    // Fetch wind information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Extract relevant weather information
        const windDescription = data.wind.speed;

        // Update the chat element with the weather information
        chat.textContent = `Current wind speed in ${city}: ${windDescription} m/s`;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent =
          "Sorry, I couldn't fetch the wind speed information.";
      });

    return;
  }

  if (value.startsWith("humidity in ")) {
    const city = value.slice("humidity in ".length);

    // Fetch humidity information from OpenWeatherMap API
    const apiKey = "72f0b70bcb1607fe5d9082d6ecd4fd63"; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Extract relevant weather information
        const humidityDescription = data.main.humidity;

        // Update the chat element with the weather information
        chat.textContent = `Current humidity in ${city}: ${humidityDescription}%`;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent = "Sorry, I couldn't fetch the humidity information.";
      });

    return;
  }

  if (topic) {
    var sQuestion = input.value;
    // search for the topic on Wikipedia
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`)
      .then((response) => response.json())
      .then((data) => {
        // extract the definition from the Wikipedia API response
        const definition = data.extract;

        // update the chat element with the definition
        chat.textContent = definition;
        //chat.value += "Me: " + sQuestion;
      })
      .catch((error) => {
        console.error(error);
        chat.textContent = "Sorry, I couldn't find anything on that topic.";
      });
  } else if (
    !value.startsWith("hi") &&
    !value.startsWith("hello") &&
    !value.startsWith("hey")
  ) {
    chat.textContent = "";
  }

  setTimeout(function () {
    chat.textContent =
      "I'm not sure how to answer that. Ask me another question!";
  }, 10);
}
