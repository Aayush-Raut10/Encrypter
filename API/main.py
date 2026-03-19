from fastapi import FastAPI
from fastapi.params import Body
from fastapi.middleware.cors import CORSMiddleware
from API.utils import encrypt_rail_fence, decrypt_rail_fence


app = FastAPI()

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://aayush-raut10.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def root():
    return {"message":"welcome to encrypter"}


@app.post('/ceaser-cipher')
def ceaser_cipher(payload: dict = Body(...)):

    key = payload.get("key")
    plain_text = payload.get("plain_text")
    mode = payload.get("mode")

    if mode == "encrypt":
    
        cipher_text = ""
        
        for char in plain_text:
            if ord(char) != 10:
                
                position = ord(char) - 65

            
                letter = chr((position + key) + 65 )
            
                cipher_text += letter
            else:
                cipher_text += char
        
        return {"cipher_text":cipher_text}
    
    elif mode == "decrypt":
        cipher_text = ""
        
        for char in plain_text:
            if ord(char) != 10:
                
                position = ord(char) - 65

            
                letter = chr((position - key) + 65 )
            
                cipher_text += letter
            else:
                cipher_text += char
        
        return {"cipher_text":cipher_text}

@app.post("/rail-fence")
def rail_fence(payload: dict = Body(...)):

    rails = payload.get("rails")
    text = payload.get("plain_text").replace(" ", "")  # remove spaces
    mode = payload.get("mode", "encrypt")  # default to encryption

    if mode == "encrypt":
        return {"cipher_text": encrypt_rail_fence(text, rails)}
    elif mode == "decrypt":
        return {"plain_text": decrypt_rail_fence(text, rails)}
    else:
        return {"error": "Mode must be 'encrypt' or 'decrypt'"}

