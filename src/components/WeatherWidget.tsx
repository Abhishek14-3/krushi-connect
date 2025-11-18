import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from "lucide-react";
import { useState, useEffect } from "react";

export const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: 24,
    condition: "sunny",
    humidity: 65,
    wind: 12,
  });

  // Simulate weather changes for demo
  useEffect(() => {
    const conditions = ["sunny", "cloudy", "rainy", "snowy"];
    const interval = setInterval(() => {
      setWeather((prev) => ({
        ...prev,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-12 w-12 text-yellow-500 animate-spin-slow" />;
      case "cloudy":
        return <Cloud className="h-12 w-12 text-gray-400 animate-float" />;
      case "rainy":
        return <CloudRain className="h-12 w-12 text-blue-500 animate-bounce-slow" />;
      case "snowy":
        return <CloudSnow className="h-12 w-12 text-blue-300 animate-float" />;
      default:
        return <Cloud className="h-12 w-12 text-primary" />;
    }
  };

  const getWeatherText = () => {
    switch (weather.condition) {
      case "sunny":
        return "Clear & Sunny";
      case "cloudy":
        return "Partly Cloudy";
      case "rainy":
        return "Rainy";
      case "snowy":
        return "Snowy";
      default:
        return "Partly Cloudy";
    }
  };

  return (
    <Card className="border-border shadow-md bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          Today's Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-foreground">{weather.temp}°C</p>
            <p className="text-sm text-muted-foreground">{getWeatherText()}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            {getWeatherIcon()}
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <span className="inline-block w-20">Humidity:</span>
                <span className="font-medium">{weather.humidity}%</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-block w-20">Wind:</span>
                <span className="font-medium">{weather.wind} km/h</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
