import { FunctionDeclaration, Type } from '@google/genai';

export const getWeatherFunctionDeclaration: FunctionDeclaration = {
  name: 'get_weather_forecast',
  description: 'Get the current weather forecast for a specified location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The city name for which to get the weather, e.g., "Riyadh".',
      },
    },
    required: ['location'],
  },
};
