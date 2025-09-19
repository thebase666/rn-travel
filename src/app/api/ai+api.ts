import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { city, budget, people, startDate, endDate } = await request.json();

  if (!city || !people || !budget) {
    return Response.json({ error: "information required" }, { status: 404 });
  }

  const prompt = `You are an expert trip planner.

You are given a destination city, a budget, the number of people, and the start and end dates for a trip. Your task is to generate a detailed travel plan.

The details are as follows:
Destination City: ${city}
Budget: ${budget}
Number of people: ${people}
Start date: ${startDate}
End date: ${endDate}

Your plan should be tailored to the given budget and group size. Include daily activities, dining suggestions, and transportation recommendations.

Use react-native-markdown formatting with the following format:
### Trip Summary
### Budget Overview
### Daily Itinerary

`;

  console.log(prompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    console.log(response);
    console.log(response.choices[0].message.content);

    return Response.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching AI guidance:", error);
    return Response.json(
      { error: "Error fetching AI guidance" },
      { status: 500 }
    );
  }
}
