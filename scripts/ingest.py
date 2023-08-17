
def create_vectorstore(url, OPENAI_API_KEY):
    from langchain.document_loaders import UnstructuredURLLoader
    from langchain.text_splitter import CharacterTextSplitter
    from langchain.vectorstores import FAISS
    from langchain.embeddings import OpenAIEmbeddings
    openai_api_key = OPENAI_API_KEY
    loaders = UnstructuredURLLoader(urls=url)
    data = loaders.load()
    print(data)
    text_splitter = CharacterTextSplitter(separator='\n',
                                          chunk_size=1000,
                                          chunk_overlap=200)

    docs = text_splitter.split_documents(data)
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    doc_vectorstore = FAISS.from_documents(docs, embeddings)
    print("Vectorstore created successfully!")
    return doc_vectorstore
