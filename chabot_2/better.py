import os
import re
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpointEmbeddings 
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq

# =========================
# Load environment variables
# =========================
load_dotenv()
HF_KEY = os.getenv("HUGGINGFACE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =========================
# Model configuration
# =========================
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL_NAME = "openai/gpt-oss-20b"

# =========================
# Load embeddings
# =========================
def get_embeddings():
    return HuggingFaceEndpointEmbeddings(
        huggingfacehub_api_token=HF_KEY,
        model=EMBEDDING_MODEL
    )

# =========================
# Load LLM
# =========================
def get_llm():
    return ChatGroq(
        model=LLM_MODEL_NAME,
        temperature=0.2,
        api_key=GROQ_API_KEY
    )

# =========================
# Load FAISS vector DB
# =========================
def load_vector_db(path="vector_db", embeddings=None):
    if embeddings is None:
        embeddings = get_embeddings()
    return FAISS.load_local(
        path,
        embeddings,
        allow_dangerous_deserialization=True
    )

# =========================
# BennyAssistant Class
# =========================
class BennyAssistant:
    def __init__(self, llm, vector_db):
        self.llm = llm
        self.db = vector_db
        self.history = []
        self.user_name = None   # ✅ SESSION MEMORY

    # ✅ Extract name from user input
    def extract_name(self, text):
        match = re.search(r"(my name is|i am|i'm)\s+([A-Za-z ]+)", text, re.IGNORECASE)
        if match:
            self.user_name = match.group(2).strip()

    # ✅ Build Prompt
    def build_prompt(self, question: str) -> str:
        history_text = "\n".join(
            f"{'User' if turn['role']=='user' else 'Benny'}: {turn['content']}"
            for turn in self.history
        )

        docs = self.db.similarity_search(question, k=5)
        context_text = "\n\n---\n\n".join(d.page_content for d in docs)

        prompt = f"""
You are Benny, an AI assistant for Bennett University.

Important rules:
- NEVER introduce yourself again
- NEVER say: "According to the context" or "Based on the provided context"
- Give only the direct answer

You may use ONLY:
1. Context
2. Conversation history
3. User Profile (if provided)

User Profile:
Name: {self.user_name if self.user_name else "Unknown"}

you should rememebr Conversation history:
{history_text}

Context:
{context_text}

User's new question:
{question}

Instructions:
- If the user's name is in the User Profile, use it when asked.
- If the answer is not in the Context or User Profile, say exactly: "dont know"
- Answer in 2–4 short sentences only
- If unsure, suggest visiting the official website
"""
        return prompt

    # ✅ Ask function
    def ask(self, question: str) -> str:
        self.extract_name(question)

        self.history.append({"role": "user", "content": question})

        prompt = self.build_prompt(question)
        response = self.llm.invoke(prompt)
        answer = response.content

        self.history.append({"role": "assistant", "content": answer})
        return answer


# =========================
# CLI Loop
# =========================
if __name__ == "__main__":
    embeddings = get_embeddings()
    vector_db = load_vector_db(embeddings=embeddings)
    llm = get_llm()
    assistant = BennyAssistant(llm, vector_db)

    print("✅ Benny Assistant is ready! Type 'exit' or 'quit' to stop.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ("exit", "quit"):
            break

        print("\nThinking...")
        answer = assistant.ask(user_input)
        print("\nBenny:\n" + answer + "\n")
