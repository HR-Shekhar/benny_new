import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, UnstructuredPowerPointLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore")

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
os.environ["HF_TOKEN"] = HF_TOKEN

embed = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    encode_kwargs={"normalize_embeddings": True}
)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)

def load_any_document(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return PyPDFLoader(path).load()
    elif ext in [".ppt", ".pptx"]:
        return UnstructuredPowerPointLoader(path).load()
    else:
        raise ValueError("Unsupported file type")

def docs_to_chunks(docs, chunk_size=800, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitter.split_documents(docs)

summary_prompt = PromptTemplate.from_template("""
You are an expert summarizer. Write a {summary_type} summary of the text:

{text}
""")


summarizer = summary_prompt | llm | StrOutputParser()


def summarize_file(path: str, summary_type="short"):
    docs = load_any_document(path)
    if not docs:
        raise ValueError("Could not extract text")

    if summary_type == "short":
        chunk_size = 400
    elif summary_type == "medium":
        chunk_size = 800
    else:
        chunk_size = 1500

    chunks = docs_to_chunks(docs, chunk_size=chunk_size)
    docs_clean = [Document(page_content=c.page_content) for c in chunks]

    vectorstore = FAISS.from_documents(docs_clean, embed)

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6}
    )

    retrieved_docs = retriever.invoke("summary") or docs_clean

    combined_text = "\n\n".join([d.page_content for d in retrieved_docs])

    summary = summarizer.invoke({
        "text": combined_text,
        "summary_type": summary_type
    })

    return summary