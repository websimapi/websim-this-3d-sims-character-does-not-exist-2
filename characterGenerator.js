class CharacterGenerator {
  constructor() {}

  // Generate a character description using the LLM based on input parameters
  async generateCharacterDescription(params) {
    try {
      const { name, age, personality, occupation, interests, style } = params;
      
      const messages = [
        {
          role: "system",
          content: `You are a creative writer for a video game similar to The Sims. 
          Your task is to create detailed, engaging character descriptions for 3D Sims-like characters.
          Include personality traits, appearance details, clothing style, backstory, and aspirations.
          Make the character interesting and unique. Use vivid, specific details.
          The format should be descriptive prose paragraphs that can be used to visualize the character.
          Don't use bullet points or lists. Write in third person.`
        },
        {
          role: "user",
          content: `Create a detailed description for a Sims-like character with the following attributes:
          
          Name: ${name || 'Generate a unique name'}
          Age: ${age || 'Generate an appropriate age'}
          Personality: ${personality || 'Generate interesting personality traits'}
          Occupation: ${occupation || 'Generate a suitable occupation'}
          Interests: ${interests || 'Generate engaging interests and hobbies'}
          Style: ${style || 'Generate a distinctive style'}
          
          Write a rich, detailed description that captures who this character is, what they look like, their fashion sense, personal history, and aspirations. Include specific details about their appearance (hair, face, body type), clothing choices, and unique mannerisms. Make the character feel realistic and three-dimensional.`
        }
      ];

      const completion = await websim.chat.completions.create({
        messages: messages
      });

      return {
        description: completion.content,
        name: name || this.extractName(completion.content)
      };
    } catch (error) {
      console.error("Error generating character description:", error);
      throw error;
    }
  }

  // Extract a name from the generated description if none was provided
  extractName(description) {
    // Try to find a name at the beginning of the text
    const nameMatch = description.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) return nameMatch[1];

    // Fallback to a generic name with timestamp
    return `Sim Character ${new Date().toISOString().slice(0, 10)}`;
  }

  // Generate parameters for clothing and style based on the character description
  async generateClothingPrompt(description) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a fashion designer for a video game similar to The Sims. Your task is to create a detailed clothing and appearance description that can be used to generate an image.
          Focus only on the visual aspects - clothing, accessories, hairstyle, body type, facial features, etc.
          Be extremely detailed about colors, patterns, textures, and styling.
          Do not include personality traits or backstory details.`
        },
        {
          role: "user",
          content: `Based on this character description, create a detailed visual description that focuses exclusively on the character's appearance, clothing, and style. This will be used to generate an image.
          
          Character Description:
          ${description}
          
          Format your response as a detailed paragraph describing only the visual elements: clothing items, colors, patterns, accessories, hairstyle, body type, facial features, etc. Be extremely specific about fabrics, cuts, fits, and styles.`
        }
      ];

      const completion = await websim.chat.completions.create({
        messages: messages
      });

      return completion.content;
    } catch (error) {
      console.error("Error generating clothing prompt:", error);
      throw error;
    }
  }
}

