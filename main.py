import os
import pickle
import telebot
from dotenv import load_dotenv
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import faiss
from urls import urls
from ingest import create_vectorstore

load_dotenv()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(BOT_TOKEN)

vectorstore = create_vectorstore(urls, OPENAI_API_KEY)

# with open("keeper_kb.pkl", "rb") as file:
#     vectorstore = pickle.load(file)

chat_history = []


@bot.message_handler(commands=['info'])
def info(message):
    bot.reply_to(message, "Hey there! I'm Bitcoin Keeper's Customer Support bot available for you 24/7 ;)")


@bot.message_handler(commands=['help'])
def help_command(message):
    bot.reply_to(message, """
    Here are a list of commands that you can use to interact with me:
    /hello - Greet
    /info - Know about me more ;)
    /clear - Clear previous chat history
    
    You can ask me anything directly and you don't need any special commands for that... cuz you are special for us ;)
    """)


@bot.message_handler(commands=['hello'])
def greet(message):
    bot.reply_to(message, "Howdy, how are you doing?")



@bot.message_handler(commands=['clear'])
def clear_chat_history(message):
    chat_history.clear()
    print(chat_history)
    bot.reply_to(message, "Your chat history has been cleared!")


@bot.message_handler(func=lambda msg: True)
def respond_query(message):
    llm = ChatOpenAI(temperature=0.7, model_name='gpt-3.5-turbo')
    # chain = RetrievalQA.from_llm(llm=llm, retriever=vectorstore.as_retriever())
    chain = ConversationalRetrievalChain.from_llm(llm=llm, retriever=vectorstore.as_retriever())
    try:
        response = chain({"question": f"{message}", "chat_history": chat_history}, return_only_outputs=True)
        print(response)
        bot.reply_to(message, response["answer"])
        if len(chat_history) > 4:
            chat_history.pop(0)
        chat_history.append((message.text, response["answer"]))
        print(chat_history)

    except Exception as e:
        print(e)
        bot.reply_to(message, "Oops! I'm having a brain meltdown. Maybe try again?")


if __name__ == "__main__":
    print("Bot is Up and running!")
    bot.infinity_polling()
