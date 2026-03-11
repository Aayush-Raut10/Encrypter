from fastapi import FastAPI
from fastapi.params import Body

app = FastAPI()

@app.get('/')
def root():
    return {"message":"welcome to encrypter"}


@app.post('/encrypt/ceaser-cipher')
def ceaser_cipher(payload: dict = Body(...)):

    key = payload.get("key")
    plain_text = payload.get("plain_text").replace(" ", "").upper()

    cipher_text = ""
    
    for char in plain_text:
        position = ord(char) - 65
        
        letter = chr((position + key) + 65 )
        
        cipher_text += letter
    
    return {"cipher_text":cipher_text}