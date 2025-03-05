class ImageGenerator {
  constructor() {}

  // Generate an image based on the character description
  async generateCharacterImage(clothingPrompt) {
    try {
      // Enhance the prompt for better Sims-like rendering
      const enhancedPrompt = await this.enhanceImagePrompt(clothingPrompt);
      
      // Generate the image using the AI
      const result = await websim.imageGen({
        prompt: enhancedPrompt,
        aspect_ratio: "1:1"
      });

      return result.url;
    } catch (error) {
      console.error("Error generating character image:", error);
      throw error;
    }
  }

  // Enhance the image prompt to get better Sims-like characters
  async enhanceImagePrompt(clothingPrompt) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are an expert at creating prompts for AI image generation. Your task is to craft the perfect prompt to generate a Sims-like 3D rendered character based on a description.
          The prompt should:
          1. Begin with "3D rendered Sims character, highly detailed,"
          2. Include specific details about the character's appearance, clothing, and pose
          3. Use terminology that will create a clean, 3D rendered look similar to The Sims video game
          4. Include technical terms like "octane render", "unreal engine", "high definition", "detailed textures"
          5. Specify the lighting and background (simple, neutral background preferred)
          6. Avoid mentioning animation, movement, or non-visual characteristics`
        },
        {
          role: "user",
          content: `Create an optimized image generation prompt for a Sims-like 3D character based on this description:
          
          ${clothingPrompt}
          
          Make the prompt focused and detailed enough to generate a high-quality, Sims-like 3D character image. The character should be full-body, with a neutral pose, and a simple background.`
        }
      ];

      const completion = await websim.chat.completions.create({
        messages: messages
      });

      return completion.content;
    } catch (error) {
      console.error("Error enhancing image prompt:", error);
      return `3D rendered Sims character, highly detailed, ${clothingPrompt}, octane render, unreal engine, neutral background, full body shot`;
    }
  }
}

