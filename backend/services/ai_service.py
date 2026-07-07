from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def summarize_text(text, mode="detailed"):
    if mode == "short":
        mode_instruction = """
        Generate a very concise summary.
        OUTPUT FORMAT:
        Topic: <Main Topic>
        Summary:
        <Maximum 5 lines summarizing the entire content>
        Do not create subtopics.
        Do not create detailed explanations.
        """

    elif mode == "bullet":
        mode_instruction = """
        Generate notes only as bullet points.
        OUTPUT FORMAT:
        Topic: <Main Topic>
        • Important Point 1
        • Important Point 2
        • Important Point 3
        • Important Point 4
        • Important Point 5
        Do not create paragraphs.
        Do not create subtopics.
        Use bullet points only.
        """

    elif mode == "exam":
        mode_instruction = """
        Generate exam preparation notes.
        OUTPUT FORMAT:
        Topic: <Main Topic>
        Definition
        <Definition>
        Key Concepts
        • Concept 1
        • Concept 2
        • Concept 3
        Important Points
        • Point 1
        • Point 2
        • Point 3
        Conclusion
        <Short exam-oriented conclusion>
        Focus on scoring in exams.
        """

    else:
        mode_instruction = """
        Generate detailed academic study notes.
        OUTPUT FORMAT:
        Topic: <Main Topic>
        Subtopic: <Subtopic Name>
        <Detailed Explanation>
        Subtopic: <Subtopic Name>
        <Detailed Explanation>
        Subtopic: <Subtopic Name>
        <Detailed Explanation>
        Conclusion
        <Short Conclusion>
        Use multiple subtopics with detailed explanations.
        """

    prompt = f"""
        You are an expert academic note generator and content summarization assistant.
        Analyze the provided content carefully and generate well-structured study notes.

        SUMMARY MODE:
        {mode_instruction}

        STRICT INSTRUCTIONS:
        * Detect the main topic automatically.
        * Understand the content before summarizing.
        * Use clear academic language.
        * Expand important concepts briefly when necessary.
        * Preserve important educational, technical, and business information.
        * Correct obvious grammatical mistakes.
        * Do not mention OCR, transcript, extraction, AI analysis, or processing.
        * Do not use markdown symbols.
        * Do not use #, ##, ###, *, -, **, bullet points, numbering, or code blocks.
        * Maintain proper spacing between sections.
        * Make the notes clean, professional, and easy to read.
        * Generate only meaningful subtopics relevant to the content.
        * Every subtopic must start with "Subtopic:".
        * Conclusion must appear on its own line.
        * The conclusion paragraph must start on the next line.

        CONTENT:
        {text}

        """
    print(
        "MODE RECEIVED =",
        mode
    )

    print(
        mode_instruction
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0.2,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content

