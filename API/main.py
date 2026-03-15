from fastapi import FastAPI
from fastapi.params import Body
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
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

@app.post("/encrypt/rail-fence")
def rail_fence(payload: dict = Body(...)):

    rails = payload.get("rails")
    plain_text = payload.get("plain_text").replace(" ", "")  # remove spaces

    
    fence = [ [] for i in range(rails)] # create rails
    
    rail = 0
    direction = 1 # 1 = down, -1 = up

    for char in plain_text:
        fence[rail].append(char)
        rail += direction

        if rail == 0 or rail == rails - 1:
            direction *= -1

    cipher_text = ""
    for row in fence:
        cipher_text += ''.join(row)

    return {"cipher_text": cipher_text}


