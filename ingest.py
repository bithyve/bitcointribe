from langchain.chains import RetrievalQAWithSourcesChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import UnstructuredURLLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from urls import urls
from dotenv import load_dotenv
import os


def create_vectorstore(url, OPENAI_API_KEY):
    openai_api_key = OPENAI_API_KEY
    loaders = UnstructuredURLLoader(urls=url)
    data = loaders.load()
    print(data)
    text_splitter = CharacterTextSplitter(separator='\n',
                                          chunk_size=1000,
                                          chunk_overlap=200)

    docs = text_splitter.split_documents(data)
    embeddings = OpenAIEmbeddings()
    doc_vectorstore = FAISS.from_documents(docs, embeddings)
    return doc_vectorstore


def test_vectorstore(question: str):
    llm = ChatOpenAI(temperature=0, model_name='gpt-3.5-turbo')
    chain = RetrievalQAWithSourcesChain.from_llm(llm=llm, retriever=vectorstore.as_retriever())
    print(chain({"question": f"{question}"}, return_only_outputs=True))


if __name__ == "__main__":
    vectorstore = create_vectorstore("vectorstore")
    test_vectorstore("What is Worldcoin?")
