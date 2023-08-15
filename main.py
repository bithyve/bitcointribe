import os
import pickle
import telebot
from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain import LLMChain
from langchain.vectorstores import faiss
from urls import urls
from ingest import create_vectorstore
from qa_prompt import QA_PROMPT
from general_prompt import GENERAL_PROMPT

load_dotenv()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(BOT_TOKEN)

vectorstore = create_vectorstore(urls, OPENAI_API_KEY)

# with open("keeper_kb.pkl", "rb") as file:
#     vectorstore = pickle.load(file)


def get_mention_username(update, username):
    mention = update.effective_updater.mentions[0]
    return mention.username if mention.username == username else None


@bot.message_handler(commands=['info'])
def info(message):
    bot.reply_to(message, "Hey there! I'm Bitcoin Keeper's Customer Support bot available for you 24/7 ;)")


@bot.message_handler(commands=['help'])
def help_command(message):
    bot.reply_to(message, """
    Here are a list of commands that you can use to interact with me:
    /hello - Greet
    /info - Know about me more ;)
    
    You can ask me anything directly and you don't need any special commands for that... cuz you are special for us ;)
    """)


@bot.message_handler(commands=['hello'])
def greet(message):
    bot.reply_to(message, "Howdy, how are you doing?")


@bot.message_handler(func=lambda msg: True)
def respond_query(message):
    llm = ChatOpenAI(temperature=0.5, model_name='gpt-3.5-turbo')
    chain = RetrievalQA.from_llm(llm=llm, retriever=vectorstore.as_retriever(), prompt=QA_PROMPT)
    try:
        response = (chain({"query": f"{message}"}, return_only_outputs=True))
        print(response)
        if response["result"] == "Sorry":
            general_chain = LLMChain(llm=llm, prompt=GENERAL_PROMPT)
            response = general_chain.run(human_input=message)
            print(response)
            bot.reply_to(message, response)
        else:
            bot.reply_to(message, response["result"])

    except Exception as e:
        print(e)
        bot.reply_to(message, f"Oops! I'm having a brain meltdown. Maybe try again?\n\nError: {e}")


if __name__ == "__main__":
    print("Bot is Up and running!")
    bot.infinity_polling()
