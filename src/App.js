import React, { useState } from "react";

function weatherCodeToText(code) {
  const map = new Map([
    [0, "Clear sky"], [1, "Mainly clear"], [2, "Partly cloudy"], [3, "Overcast"],
    [45, "Fog"], [48, "Depositing rime fog"], [51, "Drizzle: light"], [53, "Drizzle: moderate"],
    [55, "Drizzle: dense"], [56, "Freezing drizzle: light"], [57, "Freezing drizzle: dense"],
    [61, "Rain: slight"], [63, "Rain: moderate"], [65, "Rain: heavy"], [66, "Freezing rain: light"],
    [67, "Freezing rain: heavy"], [71, "Snowfall: slight"], [73, "Snowfall: moderate"],
    [75, "Snowfall: heavy"], [77, "Snow grains"], [80, "Rain showers: slight"],
    [81, "Rain showers: moderate"], [82, "Rain showers: violent"], [85, "Snow showers: slight"],
    [86, "Snow showers: heavy"], [95, "Thunderstorm"], [96, "Thunderstorm with slight hail"],
    [99, "Thunderstorm with heavy hail"]
  ]);
  return map.get(Number(code)) || `Code ${code}`;
}

const InlineStyles = () => (
  <style>{`
    :root { --radius: 14px; }
    .app-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:28px; box-sizing:border-box; background: linear-gradient(90deg,#bfdbfe,#60a5fa); font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
    .card { width:100%; max-width:680px; }
    .title { color: #fff; font-size:26px; font-weight:700; margin-bottom:18px; text-align:center; }
    .row { display:flex; gap:10px; margin-bottom:14px; }
    .input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid #d1d5db; font-size:14px; }
    .input:focus { outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.12); }
    .btn { padding:10px 14px; border-radius:10px; background:#2563eb; color:#fff; border:0; font-weight:600; cursor:pointer; }
    .btn[disabled] { opacity:.65; cursor:not-allowed; }
    .error { color:#ef4444; font-weight:600; margin-bottom:12px; }
    .result { background:#fff; border-radius:18px; padding:20px; box-shadow:0 8px 26px rgba(0,0,0,0.12); text-align:center; }
    .city { font-size:18px; font-weight:700; }
    .temp { font-size:28px; margin-top:6px; font-weight:800; }
    .meta { color:#374151; margin-top:8px; }
    .footer { margin-top:18px; text-align:center; color:rgba(255,255,255,0.95); font-size:13px; }
  `}</style>
);

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeather() {
    if (!city.trim()) {
      setError("Please enter a city name!");
      return;
    }
    setLoading(true); setError(""); setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      if (!geoRes.ok) throw new Error("Failed to fetch city data");
      const geoData = await geoRes.json();
      if (!geoData.results || !geoData.results.length) {
        setError("City not found. Try another name or check spelling.");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      if (!wRes.ok) throw new Error("Failed to fetch weather data");
      const wJson = await wRes.json();
      if (!wJson.current_weather) throw new Error("Weather data not available for this location");

      setWeather({
        city: name,
        country: country || "",
        temperature: wJson.current_weather.temperature,
        windspeed: wJson.current_weather.windspeed,
        weathercode: wJson.current_weather.weathercode,
      });
    } catch (e) {
      setError(e?.message || "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-wrap">
      <InlineStyles />
      <div className="card">
        <div className="title">🌤 Weather Now</div>

        <div className="row">
          <input
            className="input"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          <button className="btn" onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {weather && (
          <div className="result">
            <div className="city">{weather.city}{weather.country ? `, ${weather.country}` : ""}</div>
            <div className="temp">🌡 {weather.temperature} °C</div>
            <div className="meta">💨 Wind: {weather.windspeed} km/h</div>
            <div className="meta">⛅ {weatherCodeToText(weather.weathercode)} (code {weather.weathercode})</div>
          </div>
        )}

        <div className="footer">Candidate ID: <strong>Naukri0925</strong></div>
      </div>
    </div>
  );
}

