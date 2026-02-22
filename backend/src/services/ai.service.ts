import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const isAIAvailable = apiKey.length > 0;

let model: any = null;

if (isAIAvailable) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export const aiService = {
  async generateJobTitle(keywords: string): Promise<string[]> {
    if (!isAIAvailable || !model) {
      return [
        `${keywords} Specialist`,
        `Senior ${keywords} Developer`,
        `${keywords} Project Expert`,
      ];
    }

    try {
      const prompt = `Generate 3 professional job titles for a freelance project based on these keywords: "${keywords}".
      Return only the titles, one per line, without numbering or additional text.
      Make them clear, professional, and specific.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const titles = text
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 3);

      return titles;
    } catch (error) {
      console.error('Error generating job titles:', error);
      return [
        `${keywords} Specialist`,
        `Senior ${keywords} Developer`,
        `${keywords} Project Expert`,
      ];
    }
  },

  async generateJobDescription(title: string, additionalContext?: string): Promise<string[]> {
    if (!isAIAvailable || !model) {
      return [
        `Looking for an experienced professional to work on: ${title}. The ideal candidate should have relevant experience and deliver high-quality results within the agreed timeline.`,
        `We need a skilled freelancer for ${title}. This project requires attention to detail, strong communication skills, and proven expertise in the relevant domain.`,
        `Seeking a talented professional for ${title}. The project involves delivering comprehensive solutions that meet our quality standards and business requirements.`,
      ];
    }

    try {
      const contextPart = additionalContext ? `Additional context: ${additionalContext}` : '';
      const prompt = `Generate 3 professional job descriptions for this freelance project: "${title}". ${contextPart}

      Each description should:
      - Be 2-3 sentences long
      - Clearly describe the project scope
      - Include key deliverables
      - Be professional and clear

      Return only the descriptions, separated by "---", without numbering or labels.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const descriptions = text
        .split('---')
        .map((desc: string) => desc.trim())
        .filter((desc: string) => desc)
        .slice(0, 3);

      return descriptions;
    } catch (error) {
      console.error('Error generating job descriptions:', error);
      return [
        `Looking for an experienced professional to work on: ${title}. The ideal candidate should have relevant experience and deliver high-quality results within the agreed timeline.`,
        `We need a skilled freelancer for ${title}. This project requires attention to detail, strong communication skills, and proven expertise in the relevant domain.`,
        `Seeking a talented professional for ${title}. The project involves delivering comprehensive solutions that meet our quality standards and business requirements.`,
      ];
    }
  },

  async improveText(text: string, type: 'title' | 'description'): Promise<string> {
    if (!isAIAvailable || !model) {
      // Basic text improvement without AI
      if (type === 'title') {
        // Capitalize words and clean up
        return text.trim().replace(/\b\w/g, c => c.toUpperCase());
      } else {
        // Add professional framing to description
        const cleaned = text.trim();
        const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        const withPeriod = capitalized.endsWith('.') ? capitalized : capitalized + '.';
        return `${withPeriod} The ideal candidate should have proven expertise in this area, strong communication skills, and the ability to deliver high-quality results within the agreed timeline.`;
      }
    }

    try {
      let prompt = '';

      if (type === 'title') {
        prompt = `Improve this job title to make it more professional and clear: "${text}"
        Return only the improved title, without any additional text or explanation.`;
      } else {
        prompt = `Improve this job description to make it more professional, clear, and comprehensive: "${text}"

        Make it:
        - Clear and specific
        - Professional
        - Include key deliverables
        - Be 2-4 sentences long

        Return only the improved description, without any additional text or explanation.`;
      }

      const result = await model.generateContent(prompt);
      const response = result.response;
      const improvedText = response.text();

      return improvedText.trim();
    } catch (error) {
      console.error('Error improving text:', error);
      // Return basic improvement on error rather than unchanged text
      if (type === 'title') {
        return text.trim().replace(/\b\w/g, c => c.toUpperCase());
      }
      const cleaned = text.trim();
      const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      const withPeriod = capitalized.endsWith('.') ? capitalized : capitalized + '.';
      return `${withPeriod} The ideal candidate should have proven expertise in this area, strong communication skills, and the ability to deliver high-quality results within the agreed timeline.`;
    }
  },

  async generateMilestones(jobDescription: string, numberOfMilestones: number = 3): Promise<string[]> {
    if (!isAIAvailable || !model) {
      const fallback = [
        'Project setup and initial requirements gathering',
        'Core development and implementation phase',
        'Testing, review, and final delivery',
        'Documentation and knowledge transfer',
        'Post-launch support and bug fixes',
      ];
      return fallback.slice(0, numberOfMilestones);
    }

    try {
      const prompt = `Based on this job description: "${jobDescription}"

      Generate ${numberOfMilestones} project milestones that break down the work into logical phases.

      Each milestone should:
      - Be a clear, actionable deliverable
      - Be 1 sentence long
      - Represent a logical phase of the project

      Return only the milestone descriptions, one per line, without numbering.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const milestones = text
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, numberOfMilestones);

      return milestones;
    } catch (error) {
      console.error('Error generating milestones:', error);
      const fallback = [
        'Project setup and initial requirements gathering',
        'Core development and implementation phase',
        'Testing, review, and final delivery',
        'Documentation and knowledge transfer',
        'Post-launch support and bug fixes',
      ];
      return fallback.slice(0, numberOfMilestones);
    }
  },

  async generateSkillQuiz(skillName: string): Promise<Array<{ q: string; options: string[]; correct: number }>> {
    if (!isAIAvailable || !model) {
      return [];
    }

    try {
      const prompt = `Generate 5 multiple-choice quiz questions to test someone's knowledge of "${skillName}".

Each question should:
- Be a real, practical question that tests actual skill knowledge
- Have exactly 4 options
- Have exactly 1 correct answer
- Range from intermediate to advanced difficulty
- Be different each time (randomize topics within the skill)

Return ONLY valid JSON array, no markdown, no code fences. Format:
[{"q":"question text","options":["A","B","C","D"],"correct":0}]

Where "correct" is the 0-based index of the correct option. Randomize which index is correct — don't always put the answer first.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      const questions = JSON.parse(cleaned);

      if (!Array.isArray(questions) || questions.length < 5) {
        return [];
      }

      // Validate structure
      for (const q of questions) {
        if (!q.q || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
          return [];
        }
      }

      return questions.slice(0, 5);
    } catch (error) {
      console.error('Error generating skill quiz:', error);
      return [];
    }
  },

  async generateReviewSuggestions(rating: number, jobType: string): Promise<string[]> {
    if (!isAIAvailable || !model) {
      if (rating >= 4) {
        return [
          `Excellent ${jobType} work! Delivered on time with great attention to detail. Highly recommended.`,
          `Great experience working together on this ${jobType} project. Professional and skilled.`,
          `Outstanding quality of work. Would definitely hire again for future ${jobType} projects.`,
        ];
      } else if (rating >= 3) {
        return [
          `Good ${jobType} work overall. Met the basic requirements with acceptable quality.`,
          `Decent experience. The ${jobType} deliverables were satisfactory with some room for improvement.`,
          `Reasonable work on this ${jobType} project. Communication could be improved.`,
        ];
      } else {
        return [
          `The ${jobType} work did not fully meet expectations. Some deliverables needed significant revisions.`,
          `Below average experience. The ${jobType} project had issues with timeline and quality.`,
          `Needs improvement in ${jobType} delivery. The work required multiple rounds of revision.`,
        ];
      }
    }

    try {
      const prompt = `Generate 3 professional review templates for a ${rating}-star rating on a freelance ${jobType} job.

      Make them:
      - Professional and constructive
      - Appropriate for the rating (${rating}/5 stars)
      - 1-2 sentences each
      - Specific to ${jobType} work

      Return only the review suggestions, one per line, without numbering.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const suggestions = text
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 3);

      return suggestions;
    } catch (error) {
      console.error('Error generating review suggestions:', error);
      return [
        `Good ${jobType} work. Professional and reliable.`,
        `Satisfactory experience on this ${jobType} project.`,
        `The ${jobType} deliverables met expectations.`,
      ];
    }
  }
};
